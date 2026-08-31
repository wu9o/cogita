declare module 'virtual-code-copy-data' {
  export const cogitaVirtualModuleVersion: 1;
  interface CodeCopyConfig {
    enabled: boolean;
    selector: string;
    buttonLabel: string;
    selectionLabel: string;
    languageLabel: string;
    copiedLabel: string;
    errorLabel: string;
    resetDelay: number;
  }

  export const codeCopyConfig: CodeCopyConfig;
}
