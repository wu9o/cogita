import { t as translate } from 'virtual-cogita-i18n-text';

export function t(key: string, fallback: string, values?: Record<string, string | number>): string {
  return translate(key, fallback, values);
}
