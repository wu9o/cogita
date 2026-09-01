import { defineConfig } from '@cogita/core';
import { createGitContentSource } from '@cogita/plugin-content-source-git';
import { createJsonContentSource } from '@cogita/plugin-content-source-json';

const demoPrefix = (process.env.COGITA_DEMO_PREFIX || '').replace(/\/$/, '');
const demoBase = `${demoPrefix}/demos/knowledge/`;

export default defineConfig({
  site: {
    title: 'Atlas of Practice',
    description:
      'A long-term knowledge space for articles, manuals, and the connections between them.',
    base: demoBase,
  },
  i18n: {
    locale: 'en-US',
    fallbackLocale: 'en-US',
    messages: {
      'en-US': {
        'knowledge.home.lead':
          'Use one content index to connect articles and documents, so every reading can lead to the next relevant idea.',
        'knowledge.home.search': 'Search knowledge',
        'knowledge.home.tags': 'Browse tags',
        'knowledge.home.navigation': 'Knowledge base navigation',
        'knowledge.home.stats': 'Knowledge base statistics',
        'knowledge.home.contentEntries': 'Content entries',
        'knowledge.home.topicTags': 'Topic tags',
        'knowledge.home.contentLinks': 'Content links',
        'knowledge.home.recentLabel': 'Recently updated',
        'knowledge.home.recentTitle': 'Recently updated',
        'knowledge.home.viewAll': 'View all →',
        'knowledge.home.document': 'Document',
        'knowledge.home.post': 'Article',
        'knowledge.home.openEntry': 'Open entry to continue reading.',
        'knowledge.home.explore': 'Explore by topic',
        'knowledge.home.findAnything': 'Find anything',
        'knowledge.home.findStart': 'Start with one keyword.',
        'knowledge.home.searchCount': '{{count}} content entries indexed.',
        'knowledge.home.openSearch': 'Open search →',
        'knowledge.search.title': 'Find the next relevant idea.',
        'knowledge.search.eyebrow': 'SEARCH',
        'knowledge.search.description': 'Search articles, documents, tags, and full-text content.',
        'knowledge.search.placeholder': 'Enter at least {{count}} characters',
        'knowledge.search.ariaLabel': 'Search knowledge base',
        'knowledge.search.empty': 'Enter a keyword to explore.',
        'knowledge.search.minLength': 'Enter at least {{count}} characters.',
        'knowledge.search.noResults': 'No matching content found.',
        'knowledge.search.document': 'Document',
        'knowledge.search.post': 'Article',
        'knowledge.tag.title': 'Explore by topic',
        'knowledge.tag.eyebrow': 'TOPICS',
        'knowledge.tag.topic': 'TOPIC',
        'knowledge.tag.description':
          'Tags gather scattered articles and documents into reusable knowledge entry points.',
        'knowledge.tag.contentCount': '{{count}} content items',
        'knowledge.tag.back': '← Back to all topics',
        'knowledge.tag.notFound': 'Topic not found',
        'knowledge.tag.around': '{{count}} content items revolve around this topic.',
        'knowledge.tag.open': 'Open entry to continue reading.',
        'knowledge.tag.related': 'Related topics',
        'knowledge.relations.ariaLabel': 'Content relations',
        'knowledge.relations.continue': 'Continue exploring',
        'knowledge.relations.outbound': 'Links from this page',
        'knowledge.relations.inbound': 'Backlinks',
        'knowledge.relations.document': 'Document',
        'knowledge.relations.post': 'Article',
      },
    },
  },
  contentDir: 'content',
  contentSources: [
    createGitContentSource({
      id: 'field-notes-git',
      directory: 'git-content',
      kind: 'document',
      routePrefix: 'git-notes',
    }),
    createJsonContentSource({
      id: 'field-notes-export',
      file: 'content/field-notes.json',
    }),
  ],
  theme: '@cogita/theme-knowledge',
  posts: {
    dir: 'posts',
    routePrefix: 'posts',
    extensions: ['md'],
  },
  contentCheck: {
    enabled: true,
    reportPath: 'content-report.json',
    failOnError: true,
    requiredFields: ['title', 'date'],
    checkLinks: true,
  },
  themeConfig: {
    knowledge: {
      title: 'Atlas of Practice',
      description: 'A personal knowledge base connecting research, decisions, and practice.',
    },
  },
  builderConfig: {
    output: { assetPrefix: demoBase },
  },
});
