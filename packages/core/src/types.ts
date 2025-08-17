export interface SiteConfig {
  title?: string;
  description?: string;
  base?: string;
}

export interface CogitaConfig {
  site?: SiteConfig;
  theme?: string;
  // plugins: Plugin[]
  // theme: ThemeConfig
}
