import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pluginContentRelations } from '@cogita/plugin-content-relations';
import { pluginPostsFrontmatter } from '@cogita/plugin-posts-frontmatter';
import { pluginSearch } from '@cogita/plugin-search';
import { pluginTags } from '@cogita/plugin-tags';
import { COGITA_CAPABILITIES, type CogitaPluginConfig, type CogitaTheme } from '@cogita/shared';

function withDefaultConfig<T extends keyof CogitaPluginConfig>(
  key: T,
  defaults: NonNullable<CogitaPluginConfig[T]>,
  factory: (config: CogitaPluginConfig) => ReturnType<typeof pluginSearch>
) {
  return (config: CogitaPluginConfig) =>
    factory({
      ...config,
      [key]: { ...defaults, ...(config[key] as object | undefined) },
    });
}

const knowledgeRelations = (config: CogitaPluginConfig) =>
  pluginContentRelations({
    ...config,
    contentRelations: { enabled: true, ...config.contentRelations },
  });

const knowledgeSearch = withDefaultConfig(
  'search',
  { enabled: true, includeContent: true },
  pluginSearch
);

const knowledgeTags = withDefaultConfig('tags', { enabled: true }, pluginTags);

/** 知识库主题配置，默认组合统一内容索引、搜索、标签和内容关系。 */
export function getThemeConfig(): CogitaTheme {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  return {
    name: '@cogita/theme-knowledge',
    capabilities: {
      required: [COGITA_CAPABILITIES.CONTENT_POSTS],
      optional: [
        COGITA_CAPABILITIES.CONTENT_RELATIONS,
        COGITA_CAPABILITIES.DISCOVERY_SEARCH,
        COGITA_CAPABILITIES.DISCOVERY_TAGS,
      ],
    },
    pageLayouts: {
      home: './layouts/Home.js',
      search: './layouts/Search.js',
      tag: './layouts/Tag.js',
    },
    globalStyles: path.resolve(__dirname, './theme.css'),
    globalUIComponents: [path.resolve(__dirname, './components/Relations.js')],
    plugins: [pluginPostsFrontmatter, knowledgeRelations, knowledgeSearch, knowledgeTags],
  };
}
