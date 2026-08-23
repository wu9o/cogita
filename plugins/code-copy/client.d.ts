declare module 'virtual-code-copy-data' {
  interface CodeCopyConfig {
    enabled: boolean;
    selector: string;
    buttonLabel: string;
    languageLabel: string;
    copiedLabel: string;
    errorLabel: string;
    resetDelay: number;
  }

  export const codeCopyConfig: CodeCopyConfig;
}
