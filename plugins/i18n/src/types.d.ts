declare module 'virtual-cogita-i18n-text' {
  export const i18nConfig: {
    enabled: boolean;
    locale: string;
    fallbackLocale: string;
    messages: Record<string, Record<string, string>>;
  };
  export const locale: string;
  export const fallbackLocale: string;
  export const messages: Record<string, Record<string, string>>;
  export const supportedLocales: string[];
  export function getLocale(): string;
  export function setLocale(nextLocale: string): void;
  export function t(
    key: string,
    fallback?: string,
    values?: Record<string, string | number>
  ): string;
  export const translate: typeof t;
}
