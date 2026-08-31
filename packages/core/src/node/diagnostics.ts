import { type CogitaDiagnostic, CogitaDiagnosticError, type CogitaLogger } from '@cogita/shared';

/** 将未知异常转换为可读文本，避免错误提示依赖 Error 实例身份。 */
export function getCoreErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return String(error);
}

/** 创建由 Core 维护的稳定构建诊断。 */
export function createCoreDiagnostic(
  code: string,
  message: string,
  details?: Readonly<Record<string, unknown>>,
  hint?: string
): CogitaDiagnostic {
  return {
    schemaVersion: 1,
    code,
    severity: 'error',
    message,
    hint,
    source: '@cogita/core',
    details,
  };
}

/** 创建带有稳定诊断信息的 Core 构建错误。 */
export function createCoreDiagnosticError(
  code: string,
  message: string,
  details?: Readonly<Record<string, unknown>>,
  cause?: unknown,
  hint?: string
): CogitaDiagnosticError {
  return new CogitaDiagnosticError(createCoreDiagnostic(code, message, details, hint), cause);
}

/** 在非严格模式下输出诊断，同时保留旧版日志文本。 */
export function warnCoreDiagnostic(logger: CogitaLogger, diagnostic: CogitaDiagnostic) {
  logger.warn(diagnostic.message, diagnostic);
}
