---
title: One content model
description: How Atlas puts articles and ordinary documents into one content model.
---

# One content model

The Knowledge Demo uses `posts/` for dated articles and `content/` for ordinary documents that do not require dates. Both enter search, topics, and relations through one content index.

They are not copied into one content type. Each keeps its meaning in the same space: articles record change, while documents express stable constraints.

Next, read [Retrieval and backtracking](./retrieval.md) to see how links establish relations between entries.
