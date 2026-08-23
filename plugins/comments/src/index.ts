export { default, pluginComments } from './plugin';
export type {
  CommentsConfig,
  CommentsProvider,
  GiscusConfig,
  GiscusMapping,
  ResolvedCommentsConfig,
  ResolvedGiscusConfig,
  ResolvedUtterancesConfig,
  UtterancesConfig,
  UtterancesIssueTerm,
} from './types';
export {
  extractCommentPostRoutes,
  resolveCommentsConfig,
  validateCommentsConfig,
} from './utils';
