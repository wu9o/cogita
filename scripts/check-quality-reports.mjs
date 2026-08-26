import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const QUALITY_REPORT_SCHEMA_VERSION = 1;
const QUALITY_REPORT_TYPES = new Set(['content-check', 'seo-audit']);

function parseArgs(argv) {
  const options = {
    reports: [],
    root: process.cwd(),
    maxErrors: process.env.COGITA_QUALITY_MAX_ERRORS ?? '0',
    maxWarnings: process.env.COGITA_QUALITY_MAX_WARNINGS ?? 'Infinity',
    annotations: process.env.COGITA_QUALITY_ANNOTATIONS ?? 'auto',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--report') {
      options.reports.push(argv[++index]);
    } else if (argument === '--root') {
      options.root = path.resolve(argv[++index]);
    } else if (argument === '--max-errors') {
      options.maxErrors = argv[++index];
    } else if (argument === '--max-warnings') {
      options.maxWarnings = argv[++index];
    } else if (argument === '--no-annotations') {
      options.annotations = 'never';
    } else if (argument === '--annotations') {
      options.annotations = argv[++index];
    } else if (argument === '--help') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`未知参数：${argument}`);
    }
  }

  if (options.reports.length === 0) {
    throw new Error('至少需要一个 --report <path> 参数。');
  }

  return options;
}

function parseThreshold(value, name) {
  if (value === 'Infinity' || value === 'infinity') {
    return Number.POSITIVE_INFINITY;
  }

  const threshold = Number(value);
  if (!Number.isInteger(threshold) || threshold < 0) {
    throw new Error(`${name} 必须是大于等于 0 的整数或 Infinity。`);
  }
  return threshold;
}

function isRecord(value) {
  return typeof value === 'object' && value !== null;
}

function inferReportType(reportPath) {
  const baseName = path.basename(reportPath).toLowerCase();
  if (baseName.includes('seo')) {
    return 'seo-audit';
  }
  if (baseName.includes('content')) {
    return 'content-check';
  }
  return undefined;
}

/** 将旧版报告补齐为统一 schema，保证 CI 可以平滑消费已生成的报告。 */
function normalizeReport(rawReport, reportPath) {
  if (!isRecord(rawReport)) {
    throw new Error(`报告不是 JSON 对象：${reportPath}`);
  }
  if (rawReport.schemaVersion !== QUALITY_REPORT_SCHEMA_VERSION) {
    throw new Error(
      `报告 schemaVersion 不受支持：${reportPath}（期望 ${QUALITY_REPORT_SCHEMA_VERSION}）`
    );
  }

  const reportType =
    typeof rawReport.reportType === 'string' ? rawReport.reportType : inferReportType(reportPath);
  if (!reportType || !QUALITY_REPORT_TYPES.has(reportType)) {
    throw new Error(`报告缺少有效 reportType：${reportPath}`);
  }

  const itemCount = rawReport.itemCount ?? rawReport.postCount ?? rawReport.pageCount;
  if (!Number.isInteger(itemCount) || itemCount < 0) {
    throw new Error(`报告缺少有效 itemCount：${reportPath}`);
  }
  if (
    !Number.isInteger(rawReport.errors) ||
    rawReport.errors < 0 ||
    !Number.isInteger(rawReport.warnings) ||
    rawReport.warnings < 0 ||
    !Array.isArray(rawReport.issues)
  ) {
    throw new Error(`报告计数或 issues 字段无效：${reportPath}`);
  }

  const issues = rawReport.issues.map((issue, index) => {
    if (
      !isRecord(issue) ||
      (issue.severity !== 'error' && issue.severity !== 'warning') ||
      typeof issue.code !== 'string' ||
      typeof issue.route !== 'string' ||
      typeof issue.message !== 'string'
    ) {
      throw new Error(`报告 issue[${index}] 无效：${reportPath}`);
    }
    return issue;
  });

  return {
    ...rawReport,
    reportType,
    itemCount,
    issues,
  };
}

function escapeCommandValue(value) {
  return String(value)
    .replaceAll('%', '%25')
    .replaceAll('\r', '%0D')
    .replaceAll('\n', '%0A')
    .replaceAll(':', '%3A')
    .replaceAll(',', '%2C');
}

function getAnnotationFile(filePath, root) {
  if (!filePath) {
    return undefined;
  }
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(root, filePath);
  const workspaceRoot = process.env.GITHUB_WORKSPACE
    ? path.resolve(process.env.GITHUB_WORKSPACE)
    : path.resolve(root);
  const relativePath = path.relative(workspaceRoot, absolutePath);
  if (!relativePath || relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return undefined;
  }
  return relativePath;
}

function shouldAnnotate(mode) {
  if (mode === 'always') {
    return true;
  }
  if (mode === 'never') {
    return false;
  }
  return process.env.GITHUB_ACTIONS === 'true';
}

function emitAnnotation(issue, report, root) {
  const properties = [`title=${escapeCommandValue(`${report.reportType}:${issue.code}`)}`];
  const file = getAnnotationFile(issue.filePath, root);
  if (file) {
    properties.unshift(`file=${escapeCommandValue(file)}`);
  }
  const command = issue.severity === 'error' ? 'error' : 'warning';
  const message = `[${report.reportType}] ${issue.route} ${issue.code}: ${issue.message}`;
  console.log(`::${command} ${properties.join(',')}::${escapeCommandValue(message)}`);
}

function printHelp() {
  console.log(`用法：node scripts/check-quality-reports.mjs --report <path> [选项]

选项：
  --root <path>              报告所属项目根目录，默认当前目录
  --max-errors <number>      允许的错误数，默认 0
  --max-warnings <number>    允许的警告数，默认 Infinity
  --annotations <mode>       auto、always 或 never，默认 auto
  --no-annotations           禁用 GitHub Actions annotation
`);
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const maxErrors = parseThreshold(options.maxErrors, '--max-errors');
  const maxWarnings = parseThreshold(options.maxWarnings, '--max-warnings');
  const reports = options.reports.map((reportPath) => {
    const absolutePath = path.resolve(options.root, reportPath);
    if (!existsSync(absolutePath)) {
      throw new Error(`找不到质量报告：${absolutePath}`);
    }
    try {
      return {
        path: absolutePath,
        report: normalizeReport(JSON.parse(readFileSync(absolutePath, 'utf8')), absolutePath),
      };
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`质量报告不是有效 JSON：${absolutePath}`, { cause: error });
      }
      throw error;
    }
  });

  let errors = 0;
  let warnings = 0;
  for (const { report } of reports) {
    errors += report.errors;
    warnings += report.warnings;
    if (shouldAnnotate(options.annotations)) {
      for (const issue of report.issues) {
        emitAnnotation(issue, report, options.root);
      }
    }
    console.log(
      `[Quality Gate] ${report.reportType}: ${report.itemCount} 项，${report.errors} 个错误，${report.warnings} 个警告`
    );
  }

  console.log(
    `[Quality Gate] 汇总：${reports.length} 份报告，${errors} 个错误，${warnings} 个警告；阈值 errors<=${maxErrors}, warnings<=${maxWarnings}`
  );
  if (errors > maxErrors || warnings > maxWarnings) {
    console.error('[Quality Gate] 超出配置的错误或警告阈值。');
    process.exitCode = 1;
  }
}

try {
  main();
} catch (error) {
  console.error(`[Quality Gate] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}

export { normalizeReport, parseThreshold };
