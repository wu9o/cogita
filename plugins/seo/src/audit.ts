import type { SEOAuditConfig, SEOAuditIssue, SEOAuditReport, SEOPageMeta } from './types';

export interface SEOAuditPage {
  route: string;
  meta: SEOPageMeta;
}

const DEFAULT_MIN_DESCRIPTION_LENGTH = 50;

function addIssue(
  issues: SEOAuditIssue[],
  severity: SEOAuditIssue['severity'],
  code: string,
  route: string,
  message: string
): void {
  issues.push({ severity, code, route, message });
}

/** 审核页面级 SEO 元数据，返回可供日志和文件消费的结构化报告。 */
export function createSEOAuditReport(
  pages: SEOAuditPage[],
  config: SEOAuditConfig = {}
): SEOAuditReport {
  const issues: SEOAuditIssue[] = [];
  const minDescriptionLength = config.minDescriptionLength ?? DEFAULT_MIN_DESCRIPTION_LENGTH;

  for (const page of pages) {
    const { meta } = page;

    if (!meta.title.trim()) {
      addIssue(issues, 'error', 'missing-title', page.route, '页面缺少 title');
    }

    if (!meta.description.trim()) {
      addIssue(issues, 'error', 'missing-description', page.route, '页面缺少 description');
    } else if (meta.description.trim().length < minDescriptionLength) {
      addIssue(
        issues,
        'warning',
        'short-description',
        page.route,
        `description 少于 ${minDescriptionLength} 个字符`
      );
    }

    if (!meta.canonical) {
      addIssue(
        issues,
        'error',
        'missing-canonical',
        page.route,
        '页面缺少 canonical，请配置 site.url'
      );
    }

    if (meta.image && !meta.imageAlt?.trim()) {
      addIssue(issues, 'warning', 'missing-image-alt', page.route, '社交分享图片缺少 imageAlt');
    }

    if (meta.type === 'Article' && !meta.author?.trim()) {
      addIssue(issues, 'warning', 'missing-author', page.route, '文章缺少 author');
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    pageCount: pages.length,
    errors: issues.filter((issue) => issue.severity === 'error').length,
    warnings: issues.filter((issue) => issue.severity === 'warning').length,
    issues,
  };
}

/** 将审核报告格式化为便于终端阅读的中文文本。 */
export function formatSEOAuditReport(report: SEOAuditReport): string {
  const lines = [
    `[SEO Plugin] 审核完成：${report.pageCount} 个页面，${report.errors} 个错误，${report.warnings} 个警告`,
  ];

  for (const issue of report.issues) {
    lines.push(
      `  [${issue.severity === 'error' ? '错误' : '警告'}] ${issue.route} ${issue.code}: ${issue.message}`
    );
  }

  return lines.join('\n');
}
