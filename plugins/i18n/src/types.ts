import type { I18nConfig } from '@cogita/shared';

export type { I18nConfig };

/** 国际化运行时可以消费的文案字典。 */
export type I18nMessages = Readonly<Record<string, Readonly<Record<string, string>>>>;

/** 规范化后的国际化配置。 */
export interface ResolvedI18nConfig {
  enabled: boolean;
  locale: string;
  fallbackLocale: string;
  messages: I18nMessages;
}

/** 文案插值变量。 */
export type I18nValues = Readonly<Record<string, string | number>>;
