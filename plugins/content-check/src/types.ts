export type {
  CogitaQualityIssue,
  CogitaQualityReport,
  ContentCheckConfig,
  ContentCheckField,
  ContentCheckIgnore,
  ContentCheckIssueSeverity,
} from '@cogita/shared';

import type { CogitaQualityIssue, CogitaQualityReport } from '@cogita/shared';

/** 内容诊断问题。 */
export interface ContentCheckIssue extends CogitaQualityIssue {
  filePath: string;
}

/** 内容诊断报告。 */
export interface ContentCheckReport extends CogitaQualityReport {
  reportType: 'content-check';
  postCount: number;
  issues: ContentCheckIssue[];
}
