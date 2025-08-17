---
"@cogita/cli": major
"@cogita/core": major
"@cogita/shared": major
"@cogita/ui": major
"@cogita/plugin-posts-frontmatter": major
"@cogita/config": major
"@cogita/theme-lucid": major
---

--- 
"@cogita/cli": minor 
"@cogita/core": minor 
"@cogita/plugin-posts-frontmatter": minor
"@cogita/shared": minor
"@cogita/theme-lucid": minor
"@cogita/ui": minor
---
### 🎉 Initial Release of Cogita Framework
This is the first public release of Cogita, an out-of-the-box static blog system based on Rspress.
**Core Features:** 
- **Theme-Driven Architecture**: Themes are self-contained ecosystems that can declare and automatically register their own plugin dependencies.
- **Configuration Passthrough**: Enabled direct access to Rspress's `themeConfig` and `builderConfig` for advanced customization.
- **`@cogita/theme-lucid`**: A fully functional default theme featuring an out-of-the-box post list on the homepage.
- **`@cogita/plugin-posts-frontmatter`**: The core plugin that automatically scans and provides post data to themes.
- **Automated Release Workflow**: Set up a professional release pipeline using Changesets and GitHub Actions.
