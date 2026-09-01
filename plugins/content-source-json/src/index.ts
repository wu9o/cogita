import fs from 'node:fs/promises';
import path from 'node:path';
import type {
  ContentEntryKind,
  ContentSource,
  ContentSourceContext,
  ContentSourceEntry,
} from '@cogita/shared';

/** JSON 内容源的创建选项。 */
export interface JsonContentSourceOptions {
  /** 相对于站点根目录的 JSON 文件路径，也可以传绝对路径。 */
  file?: string;
  /** 构建期读取的远程 JSON 地址，例如 GitHub Raw 或知识库导出 API。 */
  url?: string;
  /** 内容源在站点内的唯一标识；缺省时根据 file 或 url 生成。 */
  id?: string;
  /** 请求远程 JSON 时附加的请求头；不要把密钥硬编码到仓库。 */
  headers?: Readonly<Record<string, string>>;
  /** 远程请求超时时间，默认 15 秒。 */
  timeoutMs?: number;
}

/** JSON 文件中单条内容的格式，content 用于提供可选的 Markdown 正文。 */
export interface JsonContentSourceRecord {
  id?: string;
  kind: ContentEntryKind;
  title: string;
  description?: string;
  excerpt?: string;
  author?: string;
  filePath?: string;
  route: string;
  createDate?: string;
  updateDate: string;
  tags?: string[];
  categories?: string[];
  image?: string;
  imageAlt?: string;
  imageCaption?: string;
  url?: string;
  content?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    return undefined;
  }
  return value;
}

/** 生成不包含查询参数和认证信息的远程地址，用于构建错误提示。 */
function getSafeUrlLabel(value: string): string {
  try {
    const parsed = new URL(value);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return '<invalid-url>';
  }
}

function getSourceRecords(value: unknown, sourceId: string): JsonContentSourceRecord[] {
  const records = Array.isArray(value)
    ? value
    : isRecord(value) && Array.isArray(value.entries)
      ? value.entries
      : undefined;

  if (!records) {
    throw new Error(`[Cogita JSON Content Source] ${sourceId} 必须是数组或包含 entries 数组的对象`);
  }

  return records.map((value, index) => {
    if (!isRecord(value)) {
      throw new Error(`[Cogita JSON Content Source] 第 ${index + 1} 条内容不是对象`);
    }

    const kind = value.kind;
    const title = typeof value.title === 'string' ? value.title.trim() : '';
    const route = typeof value.route === 'string' ? value.route.trim() : '';
    const updateDate = typeof value.updateDate === 'string' ? value.updateDate.trim() : '';
    const createDate = typeof value.createDate === 'string' ? value.createDate.trim() : undefined;
    if (
      (kind !== 'post' && kind !== 'document') ||
      !title ||
      !route ||
      !updateDate ||
      (kind === 'post' && !createDate)
    ) {
      throw new Error(
        `[Cogita JSON Content Source] 第 ${index + 1} 条内容缺少 kind、title、route、updateDate${kind === 'post' ? ' 或 createDate' : ''}`
      );
    }

    const id =
      typeof value.id === 'string' && value.id.trim() ? value.id.trim() : `entry-${index + 1}`;
    const filePath =
      typeof value.filePath === 'string' && value.filePath.trim()
        ? value.filePath.trim()
        : `source://${sourceId}/${id}`;
    const content = typeof value.content === 'string' ? value.content : undefined;

    return {
      kind,
      title,
      description: typeof value.description === 'string' ? value.description : undefined,
      excerpt: typeof value.excerpt === 'string' ? value.excerpt : undefined,
      author: typeof value.author === 'string' ? value.author : undefined,
      filePath,
      route,
      createDate,
      updateDate,
      tags: getStringArray(value.tags),
      categories: getStringArray(value.categories),
      image: typeof value.image === 'string' ? value.image : undefined,
      imageAlt: typeof value.imageAlt === 'string' ? value.imageAlt : undefined,
      imageCaption: typeof value.imageCaption === 'string' ? value.imageCaption : undefined,
      url: typeof value.url === 'string' ? value.url : undefined,
      content,
    };
  });
}

function toContentEntry(record: JsonContentSourceRecord): ContentSourceEntry {
  const { id: _id, content: _content, filePath, ...entry } = record;
  if (!filePath) {
    throw new Error('[Cogita JSON Content Source] 条目缺少 filePath');
  }
  return { ...entry, filePath };
}

/** 创建一个从 JSON 快照读取内容条目的官方 ContentSource。 */
export function createJsonContentSource(options: JsonContentSourceOptions): ContentSource {
  const file = options.file?.trim();
  const url = options.url?.trim();
  if ((file && url) || (!file && !url)) {
    throw new Error('[Cogita JSON Content Source] file 和 url 必须二选一');
  }

  const id = options.id?.trim() || `json:${file || url}`;
  const timeoutMs = options.timeoutMs ?? 15_000;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error('[Cogita JSON Content Source] timeoutMs 必须是正数');
  }
  const contentByFilePath = new Map<string, string>();

  return {
    id,
    async load(context: ContentSourceContext) {
      contentByFilePath.clear();
      let parsed: unknown;
      if (file) {
        const filePath = path.isAbsolute(file) ? file : path.resolve(context.root, file);
        try {
          parsed = JSON.parse(await fs.readFile(filePath, 'utf8'));
        } catch (error) {
          const readError = new Error(
            `[Cogita JSON Content Source] 读取 ${filePath} 失败：${error instanceof Error ? error.message : String(error)}`
          );
          (readError as Error & { cause?: unknown }).cause = error;
          throw readError;
        }
      } else {
        if (!url) {
          throw new Error('[Cogita JSON Content Source] 远程来源缺少 url');
        }
        const safeUrlLabel = getSafeUrlLabel(url);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const response = await fetch(url, {
            headers: options.headers,
            signal: controller.signal,
          });
          if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText}`);
          }
          parsed = await response.json();
        } catch (error) {
          const reason = error instanceof Error && error.name === 'AbortError' ? '请求超时' : error;
          const requestError = new Error(
            `[Cogita JSON Content Source] 请求 ${safeUrlLabel} 失败：${reason instanceof Error ? reason.message : String(reason)}`
          );
          (requestError as Error & { cause?: unknown }).cause = error;
          throw requestError;
        } finally {
          clearTimeout(timeout);
        }
      }

      const records = getSourceRecords(parsed, id);
      const entries: ContentSourceEntry[] = [];
      for (const record of records) {
        const entry = toContentEntry(record);
        if (contentByFilePath.has(entry.filePath)) {
          throw new Error(`[Cogita JSON Content Source] filePath 重复：${entry.filePath}`);
        }
        if (record.content !== undefined) {
          contentByFilePath.set(entry.filePath, record.content);
        }
        entries.push(entry);
      }
      return entries;
    },
    async getContent(entry) {
      const content = contentByFilePath.get(entry.filePath);
      if (content === undefined) {
        throw new Error(`[Cogita JSON Content Source] 条目没有提供 content：${entry.filePath}`);
      }
      return content;
    },
  };
}

export default createJsonContentSource;
