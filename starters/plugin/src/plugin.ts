import {
  type CogitaPlugin,
  type CogitaPluginConfig,
  type CogitaPluginFactory,
  getCogitaBuildContext,
  getCogitaLogger,
} from '@cogita/shared';

export interface StarterPluginOptions {
  /** 是否启用插件。 */
  enabled?: boolean;
  /** 构建开始时输出的提示信息。 */
  message?: string;
}

/** 创建一个可携带站点级配置的 Cogita 插件工厂。 */
export function createStarterPlugin(options: StarterPluginOptions = {}): CogitaPluginFactory {
  return (config: CogitaPluginConfig): CogitaPlugin | null => {
    if (options.enabled === false) {
      return null;
    }

    const buildContext = getCogitaBuildContext(config);
    const logger = getCogitaLogger(config);

    return {
      name: '@your-scope/cogita-plugin-starter',
      cogita: {
        providesCapabilities: ['starter.example'],
      },
      async beforeBuild() {
        logger.info(`[Starter Plugin] ${options.message || `准备构建 ${buildContext.root}`}`);
      },
    };
  };
}
