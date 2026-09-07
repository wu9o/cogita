import type { I18nConfig } from '@cogita/shared';
import type { I18nMessages, I18nValues, ResolvedI18nConfig } from './types';

/** 规范化语言标识，兼容 `en_US` 这类常见配置写法。 */
export function normalizeLocale(locale: unknown, fallback = 'en-US'): string {
  if (typeof locale !== 'string') return fallback;
  const normalized = locale.trim().replace(/_/g, '-');
  return normalized || fallback;
}

/** 只保留可安全注入浏览器运行时的文案字典。 */
export function normalizeMessages(value: unknown): I18nMessages {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  const messages: Record<string, Record<string, string>> = {};
  for (const [locale, dictionary] of Object.entries(value)) {
    if (!dictionary || typeof dictionary !== 'object' || Array.isArray(dictionary)) continue;
    const normalizedDictionary = Object.fromEntries(
      Object.entries(dictionary).filter(([, text]) => typeof text === 'string')
    ) as Record<string, string>;
    if (Object.keys(normalizedDictionary).length > 0) {
      messages[normalizeLocale(locale)] = normalizedDictionary;
    }
  }
  return messages;
}

/** 解析国际化配置，默认以英文作为当前语言和回退语言。 */
export function resolveI18nConfig(config?: I18nConfig, siteLocale?: string): ResolvedI18nConfig {
  const fallbackLocale = normalizeLocale(config?.fallbackLocale, 'en-US');
  return {
    enabled: config?.enabled !== false,
    showSwitcher: config?.showSwitcher !== false,
    locale: normalizeLocale(config?.locale, normalizeLocale(siteLocale, 'en-US')),
    fallbackLocale,
    messages: normalizeMessages(config?.messages),
  };
}

/** 生成供主题和第三方组件导入的虚拟国际化模块。 */
export function createI18nRuntimeModule(config: ResolvedI18nConfig): string {
  const serializedConfig = JSON.stringify(config);
  return `export const i18nConfig = ${serializedConfig};
export const fallbackLocale = i18nConfig.fallbackLocale;
export const messages = i18nConfig.messages;
export const supportedLocales = Object.keys(messages);
const localeStorageKey = 'cogita-locale';

function normalizeRuntimeLocale(value) {
  return typeof value === 'string' ? value.trim().replace(/_/g, '-') : '';
}

function isSupportedLocale(value) {
  return supportedLocales.includes(value);
}

export function getLocale() {
  if (typeof window === 'undefined') return i18nConfig.locale;
  const queryLocale = normalizeRuntimeLocale(new URLSearchParams(window.location.search).get('lang'));
  if (isSupportedLocale(queryLocale)) return queryLocale;
  try {
    const storedLocale = normalizeRuntimeLocale(window.localStorage.getItem(localeStorageKey));
    if (isSupportedLocale(storedLocale)) return storedLocale;
  } catch {
    // 浏览器禁用存储时继续使用构建期语言。
  }
  return i18nConfig.locale;
}

export const locale = getLocale();

function getLocaleCandidates(value) {
  return value ? [value, value.split('-')[0]] : [];
}

function getMessage(key, candidates) {
  for (const candidate of candidates) {
    const dictionary = messages[candidate];
    if (dictionary && typeof dictionary[key] === 'string') return dictionary[key];
  }
  return undefined;
}

export function t(key, fallback, values) {
  const candidates = [...getLocaleCandidates(getLocale()), ...getLocaleCandidates(fallbackLocale)];
  let text = getMessage(key, candidates) || fallback || key;
  for (const [name, value] of Object.entries(values || {})) {
    text = text.split('{{' + name + '}}').join(String(value));
  }
  return text;
}

export function setLocale(nextLocale) {
  const normalizedLocale = normalizeRuntimeLocale(nextLocale);
  if (!isSupportedLocale(normalizedLocale) || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(localeStorageKey, normalizedLocale);
  } catch {
    // 浏览器禁用存储时仍然通过 URL 参数完成本次切换。
  }
  const url = new URL(window.location.href);
  url.searchParams.set('lang', normalizedLocale);
  window.location.assign(url.href);
}

export const translate = t;
`;
}

/** 读取一个翻译值，供 Node 侧测试和工具复用相同的回退规则。 */
export function resolveMessage(
  messages: I18nMessages,
  locale: string,
  fallbackLocale: string,
  key: string,
  fallback = '',
  values: I18nValues = {}
): string {
  const candidates = [...getLocaleCandidates(locale), ...getLocaleCandidates(fallbackLocale)];
  const message = candidates
    .map((candidate) => messages[candidate]?.[key])
    .find((candidate): candidate is string => typeof candidate === 'string');
  let text = message ?? (fallback || key);
  for (const [name, value] of Object.entries(values)) {
    text = text.split(`{{${name}}}`).join(String(value));
  }
  return text;
}

function getLocaleCandidates(locale: string): string[] {
  return locale ? [locale, locale.split('-')[0]] : [];
}
