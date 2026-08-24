export type {
  ContentCheckConfig,
  ContentCheckField,
  ContentCheckIgnore,
  ContentCheckIssueSeverity,
} from '@cogita/shared';

/** 内容诊断问题。 */
export interface ContentCheckIssue {
  severity: 'error' | 'warning';
  code: string;
  route: string;
  filePath: string;
  message: string;
}

/** 内容诊断报告。 */
export interface ContentCheckReport {
  schemaVersion: 1;
  generatedAt: string;
  postCount: number;
  errors: number;
  warnings: number;
  issues: ContentCheckIssue[];
}
