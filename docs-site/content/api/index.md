---
title: Architecture & API
---

# Architecture & API

Cogita uses a small set of public contracts to connect configuration, themes, plugins, and generated sites.

## Core documents

- [Architecture design](./architecture-design.md): configuration flow, theme resolution, and plugin assembly.
- [Content index design](./content-index-design.md): the shared content model used by themes and plugins.
- [API reference](./api-reference.md): public types and helper APIs.
- [Theme development guide](../theme-development.md): package structure and publishing.

## Read by role

- Site authors: start with [Configuration](../configuration.md) and [Theme usage](../theme-customization.md).
- Theme authors: read [Architecture design](./architecture-design.md) and [Theme development](../theme-development.md).
- Plugin authors: read [Plugin API specification](../plugins/plugin-api-specification.md) and the relevant design document.

The goal is a stable boundary: Core resolves the site, themes define the reading experience, and plugins provide reusable capabilities without owning site content.
