import { createStarterPlugin } from './plugin';

export { createStarterPlugin } from './plugin';
export type { StarterPluginOptions } from './plugin';

/** 默认启用的插件工厂，适合直接放入 Cogita 配置的 plugins 数组。 */
export const pluginStarter = createStarterPlugin();
