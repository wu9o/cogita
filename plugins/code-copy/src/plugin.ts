import { getCogitaLogger } from '@cogita/shared';
import type { CogitaPluginConfig } from '@cogita/shared';
import type { RspressPlugin } from '@rspress/core';
import type { CodeCopyConfig, ResolvedCodeCopyConfig } from './types';

/** 规范化代码复制配置。 */
export function resolveCodeCopyConfig(config?: CodeCopyConfig): ResolvedCodeCopyConfig {
  const resetDelay = Number.isFinite(config?.resetDelay)
    ? Math.max(0, config?.resetDelay || 0)
    : 2000;

  return {
    enabled: config?.enabled !== false,
    selector: config?.selector || '.rspress-doc pre',
    buttonLabel: config?.buttonLabel || '复制代码',
    selectionLabel: config?.selectionLabel || '复制选中代码',
    languageLabel: config?.languageLabel || '复制 {language} 代码',
    copiedLabel: config?.copiedLabel || '已复制',
    errorLabel: config?.errorLabel || '复制失败',
    resetDelay,
  };
}

/** 创建代码复制插件。 */
export function pluginCodeCopy(config: CogitaPluginConfig): RspressPlugin | null {
  const logger = getCogitaLogger(config);
  if (!config.codeCopy) {
    logger.info('[Code Copy Plugin] 未找到代码复制配置，跳过代码复制增强');
    return null;
  }

  const finalConfig = resolveCodeCopyConfig(config.codeCopy);

  if (!finalConfig.enabled) {
    logger.info('[Code Copy Plugin] 代码复制配置已关闭，仅提供空运行时模块');
  }

  return {
    name: '@cogita/plugin-code-copy',

    addRuntimeModules() {
      return {
        'virtual-code-copy-data': `
          export const codeCopyConfig = ${JSON.stringify(finalConfig)};
        `,
      };
    },
  };
}

export default pluginCodeCopy;
