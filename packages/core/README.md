# @cogita/core

[中文文档](./README.zh-CN.md)

> The core engine for Cogita that intelligently orchestrates themes and plugins.

This package contains the core logic for the Cogita static site generator. It acts as a powerful layer on top of [Rspress](https://rspress.dev/), simplifying the process of building a blog while retaining the flexibility of the underlying engine.

## How It Works

The core philosophy of `@cogita/core` is "theme-driven architecture".

1.  **Configuration Loading**: It starts by reading a `cogita.config.ts` file in the user's project, which provides a simple and type-safe way to define the blog's metadata and theme.

2.  **Theme as an Ecosystem**: The core treats themes as more than just visual skins. When a theme like `@cogita/theme-lucid` is specified, the core loads it and inspects its dependencies.

3.  **Automatic Plugin Registration**: If the theme declares a dependency on certain plugins (e.g., for generating a post list), the core automatically instantiates and registers these plugins, injecting the final, merged configuration into them. This ensures that themes are self-contained and work out-of-the-box.

4.  **Configuration Passthrough**: While providing a simple setup, the core doesn't hide Rspress's power. It allows users to pass through configurations directly to Rspress's `themeConfig`, enabling advanced customization.

## License

MIT © [wu9o](https://github.com/wu9o)
