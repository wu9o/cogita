/** 代码复制插件配置。 */
export interface CodeCopyConfig {
  /** 是否启用代码复制按钮。 */
  enabled?: boolean;
  /** 要增强的代码块选择器。 */
  selector?: string;
  /** 未复制时按钮的可访问名称。 */
  buttonLabel?: string;
  /** 包含语言名称的按钮提示，支持 `{language}` 占位符。 */
  languageLabel?: string;
  /** 复制成功后的按钮文案。 */
  copiedLabel?: string;
  /** 复制失败后的按钮文案。 */
  errorLabel?: string;
  /** 成功或失败状态恢复前的等待时间，单位为毫秒。 */
  resetDelay?: number;
}

/** 规范化后的代码复制配置。 */
export interface ResolvedCodeCopyConfig {
  enabled: boolean;
  selector: string;
  buttonLabel: string;
  languageLabel: string;
  copiedLabel: string;
  errorLabel: string;
  resetDelay: number;
}
