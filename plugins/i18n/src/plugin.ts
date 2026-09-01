import {
  COGITA_CAPABILITIES,
  COGITA_VIRTUAL_MODULE_IDS,
  createCogitaVirtualModule,
  getCogitaLogger,
} from '@cogita/shared';
import type { CogitaPlugin, CogitaPluginConfig } from '@cogita/shared';
import { createI18nRuntimeModule, resolveI18nConfig } from './utils';

/** 创建站点界面文案国际化插件。 */
export function pluginI18n(config: CogitaPluginConfig): CogitaPlugin | null {
  const logger = getCogitaLogger(config);
  if (!config.i18n || config.i18n.enabled === false) {
    logger.info('[I18n Plugin] 未找到国际化配置，跳过界面文案国际化');
    return null;
  }

  const finalConfig = resolveI18nConfig(config.i18n, config.site?.lang);
  logger.info(
    `[I18n Plugin] 使用 ${finalConfig.locale} 界面文案，回退语言为 ${finalConfig.fallbackLocale}`
  );

  return {
    name: '@cogita/plugin-i18n',
    cogita: {
      providesCapabilities: [COGITA_CAPABILITIES.UI_I18N],
    },

    addRuntimeModules() {
      return {
        [COGITA_VIRTUAL_MODULE_IDS.I18N_TEXT]: createCogitaVirtualModule(
          createI18nRuntimeModule(finalConfig)
        ),
      };
    },
  };
}

export default pluginI18n;
