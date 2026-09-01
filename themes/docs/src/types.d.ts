declare module 'virtual-cogita-i18n-text' {
  export const locale: string;

  export function t(
    key: string,
    fallback?: string,
    values?: Record<string, string | number>
  ): string;
}
