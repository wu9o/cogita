---
title: "Git Rebase 排障实录：重复 Commit 如何悄悄覆盖已有的 Fix"
createDate: "2026-04-28"
updateDate: "2026-04-28"
tags:
  - Git
  - Rebase
  - 版本控制
  - 排障
categories:
  - 工程实践/Git
  - 版本控制
author: "wu9o"
excerpt: "一次 git pull --rebase 让若干 commit 全部重新生成了新 hash，其中一个已被修复的 feat commit 以新身份晚于 fix commit 进入主干，在三路合并时覆盖了 fix，bug 悄然复现。本文还原完整推导过程，并给出可复用的自查与预防手册。"
---

# Git Rebase 排障实录：重复 Commit 如何悄悄覆盖已有的 Fix

## 一、问题描述

在一个多分支并行开发的项目中，某次发布后出现了一个「曾经被修复过」的 bug。翻查 git log 发现主干上同一条提交信息出现了**两次**，两个 commit 的 hash 和 committer 都不同，但内容完全一致：

```
a1b2c3d4  feat: 实现某功能 X   (2026-03-05 22:18, alice)
e5f6g7h8  feat: 实现某功能 X   (2026-03-10 17:14, bob)
```

对应的 fix commit 确实存在：

```
i9j0k1l2  fix: 还原功能 X 引入的副作用（修复 a1b2c3d4 引入的 bug）  (2026-03-10 15:40)
```

但 fix commit 的时间（15:40）**早于**第二个 feat commit（17:14），在 merge 时后者把 fix 的内容覆盖了，bug 就此复现。

---

## 二、排查过程

### 步骤 1：发现重复 commit

通过 `git log --oneline` 在主干分支检索，发现同一条提交信息出现两次，hash、作者、时间均不同，但执行 `git show` 对比 diff 内容**完全一致**，确认是同一批文件改动被引入了两遍。

### 步骤 2：确认 fix commit 存在且已失效

fix commit `i9j0k1l2` 确实存在于主干历史，且时间早于第二个 feat commit。

在三路 merge 时，Git 以 merge base 为参考：
- fix 方向：相对 merge base 把文件**还原**了（没有净变化）
- 重复 feat 方向：相对 merge base 有**新增改动**

Git 选择了有净变化的一侧，fix 的效果因此丢失。

### 步骤 3：溯源第二个 feat commit 的来源

```bash
git log --all --oneline --ancestry-path <重复commit>..HEAD
```

追踪到它来自某个个人开发分支（`feat/xxx`），通过以下路径进入主干：

```
feat/xxx
  → MR → release/feature-branch（大需求的集成分支）
  → MR → release/sprint-xxx（发布分支）
  → merge → main（主干）
```

### 步骤 4：确认是 rebase 导致的

检查第二个 feat commit 的 parent：

```bash
git cat-file -p <重复commit>
# parent: <某个陌生的 hash>
```

该 parent 并不是原始 feat commit 的 parent，说明这个 commit 是被重放（replay）出来的，而非原始提交。

进一步验证：

```bash
# 确认原始 feat commit 在 rebase 前就已在个人分支的历史中
git merge-base --is-ancestor <原始feat> <rebase前的分支tip>
# 返回 0（true）
```

结论：开发者在个人分支上执行了类似如下的操作：

```bash
git pull origin release/feature-branch
# 等价于：
# git fetch origin release/feature-branch
# git rebase origin/release/feature-branch
```

这次 rebase 将个人分支上的若干 commit 全部重放，产生了一批全新 hash 的副本，其中就包括了原始 feat commit 的变异版本。

---

## 三、根因分析

### 3.1 rebase 为什么会让所有 commit 的 hash 全部变化

Git commit 的 hash 由以下内容共同计算：

- **tree hash**（文件快照）
- **parent hash**（父节点）
- author / committer / timestamp
- commit message

rebase 会将 commit 的 parent 从旧 base 替换为新 base。第 1 个 commit 的 parent 变了，hash 随之改变；第 2 个 commit 的 parent 是第 1 个的新 hash，hash 也随之改变……**形成链式反应，所有后续 commit 全部得到新 hash**。

这与文件内容是否有冲突无关——哪怕所有文件一字未改，只要 parent 变了，hash 就必然变化。

### 3.2 为什么原始 feat commit 被重放而不是跳过

理解这个问题，需要先搞清楚 rebase 的「重放范围」是如何确定的。

#### 公共祖先决定重放范围

rebase 的第一步是找到当前分支（`feat/xxx`）与新 base（`release/feature-branch`）的**最近公共祖先（merge base）**。公共祖先之后、属于当前分支的所有 commit，都会被逐一重放到新 base 上。

```
公共祖先 P
    ├── release/feature-branch: P → R1 → R2  （新 base 方向）
    └── feat/xxx:               P → ... → feat-original → ...  （当前分支方向）
```

`release/feature-branch` 是专门为某个大需求建立的集成分支，**它从未同步过主干**，因此它不包含原始 feat commit（原始 feat 是从主干引入到个人分支的）。这就导致两个分支的公共祖先正好卡在原始 feat commit **进入个人分支之前**，使其落入了「需要重放」的范围。

#### patch-id 机制为何没有跳过它

rebase 在重放时会计算每个 commit 的 **patch-id**（只看文件内容的变更，忽略时间、parent 等元信息），用来判断某个改动是否已经被新 base 包含、可以跳过。

但由于 `release/feature-branch` 从未同步过主干，它的历史里根本没有原始 feat commit 的改动内容，patch-id 对不上，Git 认为这是一个「尚未应用」的变更，于是老老实实地把它重放了一遍，产生了一个内容相同但 hash 全新的副本。

**一句话总结**：集成分支（`release/feature-branch`）没有同步过主干，导致它与个人分支的公共祖先把原始 feat commit 划进了重放范围；新 base 里又确实没有这个改动，Git 只能将其重放，产生变异副本。

### 3.3 为什么变异 commit 会覆盖 fix

三路 merge 的判断逻辑如下：

```
merge base（合并时的公共祖先）
  ├── 路径 A（含 fix）：fix 把文件还原成了 base 的状态  → 相对 base 无净变化
  └── 路径 B（含变异 feat）：重新引入了相同的改动        → 相对 base 有新增
```

Git 在三路 merge 中，发现路径 B 对某文件有新增改动而路径 A 没有，就会选择路径 B 的版本。fix 的内容等同于「什么都没做」，最终被路径 B 覆盖，bug 复现。

---

## 四、自查方法

如果你怀疑分支上存在「变异 commit」，可以按以下步骤排查：

### 排查步骤 1：判断某个原始 commit 是否有对应的 fix

```bash
# 查看原始 commit 改动了哪些文件
git show <原始commit> --stat

# 检索这些文件后续是否有 fix commit
git log --oneline --all --grep="fix" -- <file-path>
```

若原始 commit 之后**没有**针对它的 fix → 风险较低。  
若存在对应 fix → 进入步骤 2。

### 排查步骤 2：确认 fix 是否已被变异 commit 覆盖

```bash
# 查看 fix commit 的具体改动
git show <fix-commit> -- <file-path>

# 查看当前主干该文件的实际内容
git show main:<file-path>
```

若 fix 的关键改动**仍然存在** → 暂时安全。  
若 fix 的改动**已被覆盖** → 需要立即重新提交 fix 并评估影响范围。

也可以通过时序快速判断：

```bash
# 确认两个 commit 在主干上的相对顺序
git log --oneline main | grep -E "<变异commit前缀>|<fix-commit前缀>"
```

若变异 commit 出现在 fix commit **之后**，且改动的是同一文件的同一区域，fix 大概率已被覆盖。

---

## 五、预防建议

本次问题并非单纯由 rebase 本身引起，而是由两个条件**同时成立**触发的：

1. **集成分支（`release/feature-branch`）未及时同步主干**，导致它不包含原始 feat commit 及其 fix
2. **个人开发分支曾拉取过主干代码**，因此包含了原始 feat commit

在此基础上，个人分支对集成分支执行 rebase 时，原始 feat commit 对于新 base 是「未知的」，被当作新 patch 重放，产生了变异副本。

**如果集成分支提前同步了主干**，它就已经包含原始 feat commit，rebase 时 patch-id 能对上，Git 会自动识别并跳过，不会产生重复 commit。

### 建议 1：长期集成分支应定期同步主干

大型需求开发周期较长，主干期间会持续有新 commit 合入。集成分支应定期 merge 主干，避免与主干产生过大的分叉：

```bash
# 在集成分支上定期执行
git merge origin/main
git push origin release/feature-branch
```

**同步时机建议**：
- 主干有重要 commit 合入后，集成分支及时跟进
- 大型需求开发超过 1 周时，至少每周同步一次主干

### 建议 2：rebase 前确认目标分支与主干的同步状态

在对集成分支执行 rebase/pull 之前，先检查集成分支是否落后于主干：

```bash
# 检查集成分支相对主干落后了哪些 commit
git log --oneline release/feature-branch..origin/main
```

若输出不为空，说明集成分支尚未同步主干，此时 rebase 存在产生重复 commit 的风险。**应先推动集成分支同步主干，再在个人分支上执行 rebase**。

### 建议 3：发起 MR 前做 diff 检查

在向集成分支发起 MR 前，检查本次 MR 是否带入了非预期的 commit：

```bash
# 查看本次 MR 将带入的所有 commit
git log --oneline <target-branch>..HEAD
```

若发现有不属于本次开发的 commit（尤其是与主干历史内容相同的），说明可能存在重复引入，需先清理再发 MR。

### 建议 4：发现重复 commit 后的处置方式

1. **不要直接发 MR**，先处理重复 commit
2. 使用 `git rebase -i` 将重复 commit 标记为 `drop`
3. 或通过 `git reset` 回退到公共祖先，再 cherry-pick 仅属于本次开发的 commit
4. 重新推送前用 `git log --oneline <target-branch>..HEAD` 确认结果符合预期

---

## 六、总结

| 阶段 | 关键点 |
|------|--------|
| **为什么 hash 全变** | rebase 改变 parent，触发链式 hash 变化，与文件内容无关 |
| **为什么原始 commit 被重放** | 集成分支未同步主干，公共祖先把原始 commit 划进了重放范围；patch-id 也无法跳过 |
| **为什么 fix 被覆盖** | 三路 merge 中，fix 等于「相对 base 无净变化」，变异 commit 等于「有新增」，Git 选择了后者 |
| **如何预防** | 集成分支定期同步主干；rebase 前检查目标分支同步状态；MR 前 diff 检查 |

> **核心认知**：`git pull --rebase` 不仅仅是「拉代码」，它会重写本地所有未推送 commit 的 hash。在多分支长周期协作场景中，rebase 的范围由公共祖先决定，而公共祖先的位置取决于各分支的同步状态——这才是问题的真正根源。
