---
title: The Architectural Power of Plugins
date: 2025-08-16
tags: [Cogita, Architecture, Plugins]
---

One of the core design principles of Cogita is its robust and flexible plugin system. But what does that really mean?

## Decoupling Features

Instead of bundling every possible feature into the core, Cogita delegates specific functionalities to independent plugins. For example:

-   **`@cogita/plugin-tags`**: Manages tag generation and data.
-   **`@cogita/plugin-rss`**: Generates an RSS feed.
-   **`@cogita/plugin-sitemap`**: Creates a sitemap for SEO.

This approach has several key advantages:

1.  **Lightweight Core**: The core framework remains small and focused.
2.  **Opt-in Complexity**: Users only add the features they actually need.
3.  **Extensibility**: The community can easily build and share new plugins without modifying the core.

The communication between plugins and themes is handled gracefully through a system of virtual modules, ensuring that they remain decoupled yet interoperable.
