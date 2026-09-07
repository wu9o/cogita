import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  COGITA_CAPABILITIES,
  COGITA_VIRTUAL_MODULE_IDS,
  createCogitaVirtualModule,
  getCogitaLogger,
} from '@cogita/shared';
import type { CogitaPlugin, CogitaPluginConfig } from '@cogita/shared';
import type { AdditionalPage, UserConfig } from '@rspress/core';
import { glob } from 'glob';
import { createI18nRuntimeModule, resolveI18nConfig } from './utils';

/** 创建站点界面文案国际化插件。 */
export function pluginI18n(config: CogitaPluginConfig): CogitaPlugin | null {
  const logger = getCogitaLogger(config);
  if (!config.i18n || config.i18n.enabled === false) {
    logger.info('[I18n Plugin] 未找到国际化配置，跳过界面文案国际化');
    return null;
  }

  const finalConfig = resolveI18nConfig(config.i18n, config.site?.lang);
  const pluginDirectory = path.dirname(fileURLToPath(import.meta.url));
  logger.info(
    `[I18n Plugin] 使用 ${finalConfig.locale} 界面文案，回退语言为 ${finalConfig.fallbackLocale}`
  );

  return {
    name: '@cogita/plugin-i18n',
    cogita: {
      providesCapabilities: [COGITA_CAPABILITIES.UI_I18N],
    },
    globalUIComponents: finalConfig.showSwitcher
      ? [path.resolve(pluginDirectory, './switcher.js')]
      : undefined,

    async addPages(_rspressConfig: UserConfig, _isProd: boolean): Promise<AdditionalPage[]> {
      if (!config.i18n?.contentFallback || !config.contentDir || !config.locales?.length) {
        return [];
      }

      const defaultLocale = config.site?.lang || config.locales[0]?.lang;
      const localizedLocales = config.locales
        .map((locale) => locale.lang)
        .filter((locale) => locale && locale !== defaultLocale);
      if (!defaultLocale || localizedLocales.length === 0) return [];

      const contentRoot = path.resolve(config.root, config.contentDir);
      const files = await glob('**/*.{md,mdx}', {
        absolute: true,
        cwd: contentRoot,
        ignore: config.locales.map((locale) => `${locale.lang}/**`),
        nodir: true,
      });
      const fallbackPages: AdditionalPage[] = [];

      for (const filePath of files) {
        const relativePath = path.relative(contentRoot, filePath);
        const routePath = relativePath
          .replace(/\.(md|mdx)$/i, '')
          .replace(/(^|[/\\])index$/i, '$1')
          .split(path.sep)
          .join('/');
        const normalizedRoute = routePath ? `/${routePath}` : '/';

        for (const locale of localizedLocales) {
          const localizedFile = path.join(contentRoot, locale, relativePath);
          if (existsSync(localizedFile)) continue;
          fallbackPages.push({
            routePath: `/${locale}${normalizedRoute === '/' ? '/' : normalizedRoute}`,
            filepath: filePath,
          });
        }
      }

      if (fallbackPages.length > 0) {
        logger.info(
          `[I18n Plugin] 为 ${fallbackPages.length} 个未翻译内容页面生成默认语言回退路由`
        );
      }
      return fallbackPages;
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
