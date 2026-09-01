export { pluginI18n as default, pluginI18n } from './plugin';
export type { I18nConfig, I18nMessages, I18nValues, ResolvedI18nConfig } from './types';
export {
  createI18nRuntimeModule,
  normalizeLocale,
  normalizeMessages,
  resolveI18nConfig,
  resolveMessage,
} from './utils';
