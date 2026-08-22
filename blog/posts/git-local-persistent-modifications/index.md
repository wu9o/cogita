---
title: "Git 本地常驻修改：让文件改动只存在于你的电脑上"
createDate: "2026-08-11"
updateDate: "2026-08-11"
tags:
  - Git
  - clean/smudge filter
  - skip-worktree
  - 技巧
categories:
  - 工程实践/Git
  - 版本控制
author: "wu9o"
excerpt: "想在本地改 package.json 删掉 postinstall 脚本，又不想把修改推到远端？本文对比四种 Git 机制，找到能同时满足'本地常驻、不推送、上游可同步'的终极方案。"
---

# Git 本地常驻修改：让文件改动只存在于你的电脑上

## 一、场景：你想改一个文件，但不能推上去

你在一个团队项目里工作，仓库的 `package.json` 有这么几行：

```json
{
  "scripts": {
    "postinstall": "node scripts/download-assets.js",
    "dev": "tooling sync-config && vite dev"
  }
}
```

每次 `npm install` 后都会自动执行 `postinstall`，下载一堆你本地根本不需要的资源文件。而 `dev` 脚本里的 `tooling sync-config &&` 前缀，每次启动开发服务器前都会跑一遍配置同步，在你的本地环境下纯属浪费时间。

你想在本地把这两行改掉——删掉 `postinstall`，去掉 `dev` 的前缀——但又不能把修改提交到远端，否则会影响其他人和 CI。

你的诉求听起来简单，但细想一下有四个条件：

1. **本地修改常驻**：切分支、rebase、merge 之后，修改还在
2. **不推送到远端**：`git add` / `git commit` / `git push` 时，提交的是原始内容
3. **上游变更可同步**：别人改了 `package.json` 并合入主干后，你 rebase/merge 时能正常同步，你的本地修改在新版本上自动重新应用
4. **所有分支生效**：不是只对某个分支，是所有分支都常驻

另外，仓库里还有几个 `AGENTS.md`、`SKILL.md` 之类的文件，你本地完全用不到，想删掉——但这些文件上游偶尔也会更新，你根本不关心那些更新。

这不是 `git stash` 能解决的（stash 是临时的），也不是 `.gitignore` 能解决的（只对未跟踪文件生效）。你需要的是一种**本地常驻、远端无感**的机制。

## 二、四种方案逐一试错

### 方案一：`.git/info/exclude` — 不适用

`.git/info/exclude` 的作用和 `.gitignore` 一样，只对**未跟踪文件**生效。`package.json` 已经被 git 跟踪了，exclude 对它完全无能为力。

### 方案二：`--assume-unchanged` — 不适用

```bash
git update-index --assume-unchanged package.json
```

这个标记的设计初衷是**性能优化**——告诉 git "我假设这个文件不会变，跳过 stat 检查"。Git 官方文档明确指出：在 merge 时 git 可能 "gracefully fail"（优雅失败），**不保证**本地修改的安全性。它只是"建议"git 忽略改动，不是"强制"。

用它来保护本地修改，就像用胶带固定安全带——能用，但你敢赌吗？

### 方案三：`--skip-worktree` — 部分适用

```bash
git update-index --skip-worktree package.json
```

这个机制比 `--assume-unchanged` 靠谱一些。它会在 git index 中设置一个 bit，效果是：

- `git status` / `git add` 完全忽略该文件的本地修改
- `git checkout` / `git merge` / `git rebase` 不会将该文件写入工作区

听起来不错？但有个关键限制：它**冻结**了文件——上游对该文件的变更**不会**同步到你的工作区。

rebase 时可能出现三种情况：

| 场景 | 上游是否修改该文件 | 结果 |
|------|------------------|------|
| A | 否 | 安全，无冲突 |
| B | 是，且你的分支也改过 | rebase 试图写入文件但被阻止，可能导致 rebase 失败 |
| C | 是，但你的分支没改过 | git 可能取消 skip-worktree bit，本地修改丢失 |

结论：`--skip-worktree` 适合**完全不需要上游同步**的文件（比如你想删掉的 `.md` 文件），**不适合** `package.json`（因为上游变更你需要同步）。

### 方案四：clean/smudge filter — 终极方案

Git 有一个被很多人忽略的机制：**clean/smudge filter**。它可以在文件进出 git 仓库时自动做转换，正好完美满足我们的所有诉求。

## 三、clean/smudge filter 原理

Git 在工作区和版本库之间有一个"转换层"。你可以配置 filter，在文件进出这个层时自动修改内容：

```
┌───────────────┐      smudge       ┌───────────────┐
│               │ ───────────────▶  │               │
│   Git 仓库    │    (checkout时)   │   工作区      │
│  (index/blob) │                   │ (你看到的文件) │
│               │ ◀───────────────  │               │
└───────────────┘      clean        └───────────────┘
                    (add/commit时)
```

- **smudge filter**：在 `git checkout` / `git merge` / `git rebase` 时执行，文件从 git 仓库写入工作区**之前**进行转换。我们可以用它**自动剥离**不需要的内容。
- **clean filter**：在 `git add` 时执行，文件从工作区写入 git 仓库**之前**进行转换。我们可以用它**恢复原始内容**，确保剥离后的版本永远不会被提交。

四个诉求如何满足：

| 诉求 | clean/smudge 如何满足 |
|------|----------------------|
| 本地修改常驻 | 每次 checkout 自动执行 smudge，剥离内容 |
| 不推送到远端 | 每次 `git add` 自动执行 clean，恢复原始内容 |
| 上游变更可同步 | merge/rebase 时新版本先经过 smudge，自动重新剥离 |
| 所有分支生效 | filter 配置在 `.git/config`，全局生效 |

关键洞察：smudge 负责在工作区"做减法"（剥离），clean 负责"恢复原样"（从 HEAD 取回原始内容）。两者配合，git 仓库里永远是完整的原始版本，工作区里永远是剥离后的版本。

## 四、完整实现步骤

### 场景一：`package.json`（需要上游同步）

#### 第 1 步：创建 smudge 过滤脚本

smudge 脚本负责在 checkout 时自动剥离 `postinstall` 和 `dev` 前缀。在 `.git/localstrip-smudge.sh` 中创建：

```bash
#!/bin/bash
set -e

TMP_INPUT=$(mktemp)
trap "rm -f '$TMP_INPUT'" EXIT
cat > "$TMP_INPUT"

node -e '
const fs = require("fs");
const input = fs.readFileSync(process.argv[1], "utf8");
try {
  const pkg = JSON.parse(input);
  let modified = false;
  // 1. 删除 postinstall 脚本
  if (pkg.scripts && pkg.scripts.postinstall) {
    delete pkg.scripts.postinstall;
    modified = true;
  }
  // 2. 去掉 dev 脚本的前缀命令
  if (pkg.scripts && pkg.scripts.dev && pkg.scripts.dev.startsWith("tooling sync-config && ")) {
    pkg.scripts.dev = pkg.scripts.dev.replace(/^tooling sync-config && /, "");
    modified = true;
  }
  if (modified) {
    process.stdout.write(JSON.stringify(pkg, null, 2) + "\n");
  } else {
    process.stdout.write(input);
  }
} catch (e) {
  process.stdout.write(input);
}
' "$TMP_INPUT"
```

**关键点**：用 Node.js 安全地解析和修改 JSON，避免正则替换的脆弱性。输出用 `process.stdout.write`（不能用 `fs.writeFileSync(0, ...)`，管道场景下 fd 0 是只读的）。

#### 第 2 步：创建 clean 过滤脚本

clean 脚本负责在 `git add` 时恢复原始内容。在 `.git/localstrip-clean.sh` 中创建：

```bash
#!/bin/bash
set -e

# 丢弃工作区的剥离版本
cat > /dev/null

# 从 HEAD 恢复原始版本
git show HEAD:package.json 2>/dev/null || cat
```

**关键点**：clean 脚本直接用 `git show HEAD:package.json` 恢复原始内容。这样即使上游修改了 `package.json`（比如 rebase 后 HEAD 变了），恢复出的内容也会自动跟踪最新上游版本。`|| cat` 是 fallback——如果 `git show` 失败（比如首次提交前），原样输出。

#### 第 3 步：赋予脚本执行权限

```bash
chmod +x .git/localstrip-smudge.sh .git/localstrip-clean.sh
```

#### 第 4 步：声明哪些文件使用 filter

在 `.git/info/attributes` 中添加（不存在则创建）：

```
package.json filter=localstrip
```

`.git/info/attributes` 和 `.gitattributes` 语法相同，但只在本地生效，不会被推送。

#### 第 5 步：配置 filter

```bash
git config filter.localstrip.smudge '.git/localstrip-smudge.sh'
git config filter.localstrip.clean '.git/localstrip-clean.sh'
```

这会在 `.git/config` 中生成：

```ini
[filter "localstrip"]
    smudge = .git/localstrip-smudge.sh
    clean = .git/localstrip-clean.sh
```

`.git/config` 是本地配置，不会被推送。

#### 第 6 步：触发 filter 生效

filter 配置完成后，需要让 git 重新 checkout `package.json` 以触发 smudge：

```bash
git checkout HEAD -- package.json
```

验证：

```bash
# 工作区应为剥离后的版本
cat package.json | grep postinstall  # 应无输出
cat package.json | grep "tooling sync-config"  # 应无输出

# git status 应该是干净的
git status
```

如果 `git status` 显示 `package.json` 有修改，说明 clean filter 没生效——检查脚本路径和执行权限。

### 场景二：已删除的 `.md` 文件（不需要上游同步）

对于 `AGENTS.md`、`SKILL.md` 等文件，如果完全不需要上游同步（上游改了也不关心），用 `--skip-worktree` 即可，简单高效：

```bash
# 先删除文件
rm -f AGENTS.md
rm -f docs/SKILL.md

# 设置 skip-worktree
git update-index --skip-worktree AGENTS.md
git update-index --skip-worktree docs/SKILL.md
```

验证：

```bash
# 显示有 skip-worktree 标记的文件（前缀为 S）
git ls-files -v | grep '^S'

# git status 应该是干净的
git status
```

## 五、日常工作流

### 正常开发：无需任何特殊操作

filter 在后台自动工作：

- `git checkout` / `git switch` → 自动 smudge（剥离）
- `git add` / `git commit` → 自动 clean（恢复原始）
- `git push` → 推送的是原始内容，远端无感知

你完全感觉不到 filter 的存在。

### Rebase / Merge 上游代码：无需任何特殊操作

上游对 `package.json` 的修改会正常同步，smudge filter 会自动在上游新版本的基础上重新剥离：

```bash
git rebase origin/main
# 或
git merge origin/main
```

rebase 后如果发现工作区的 `package.json` 没有自动 smudge（某些 git 版本可能不触发），手动执行：

```bash
git checkout HEAD -- package.json
```

### 验证 filter 是否生效

```bash
# 1. 检查工作区版本（应为剥离后的）
cat package.json | grep postinstall  # 应无输出

# 2. 检查暂存区版本（git add 后应为原始版本）
git add package.json
git show :package.json | grep postinstall  # 应有输出
git reset HEAD package.json

# 3. 检查 git status（应干净）
git status

# 4. 检查 skip-worktree 文件
git ls-files -v | grep '^S'
```

第 2 步是最关键的验证：`git add` 后暂存区的版本应该是**完整的原始内容**，而不是剥离后的版本。这就保证了你永远不会把剥离后的内容提交上去。

## 六、注意事项

1. **filter 脚本必须用 `process.stdout.write` 输出**：在管道场景下 fd 0 是只读的，不能用 `fs.writeFileSync(0, ...)`。
2. **lock 文件不需要过滤**：`pnpm-lock.yaml` / `package-lock.json` 是 `package.json` 的产物。rebase 后如果有冲突，运行 `npm install` 重新生成即可。由于本地 `package.json` 的 `postinstall` 已被剥离，install 时不会触发该脚本。
3. **clean filter 的 fallback**：`git show HEAD:package.json 2>/dev/null || cat` 中的 `|| cat` 是为了应对首次提交前等边缘情况。正常工作流中 `git show HEAD:package.json` 总是成功的。
4. **skip-worktree 的取消**：如果将来需要恢复对某文件的上游同步：
   ```bash
   git update-index --no-skip-worktree AGENTS.md
   git checkout -- AGENTS.md
   ```
5. **filter 不影响 git log / git show**：filter 只作用于工作区与 index 之间的转换。`git show HEAD:package.json` 显示的是 index/HEAD 中的原始内容，不受 filter 影响。
6. **clone 新仓库后需重新配置**：filter 配置在 `.git/` 目录下，`git clone` 不会携带。在新机器 clone 后需要重新执行上述步骤。建议把配置步骤写成一键脚本。

## 七、一键配置脚本

将以下脚本保存为 `setup-local-strip.sh`（放在仓库外或 `.gitignore` 中），在新 clone 的仓库中运行即可一键配置：

```bash
#!/bin/bash
set -e

REPO_DIR="${1:-.}"
GIT_DIR="$REPO_DIR/.git"

# 1. 创建 smudge 脚本
cat > "$GIT_DIR/localstrip-smudge.sh" << 'SMUDGE_EOF'
#!/bin/bash
set -e
TMP_INPUT=$(mktemp)
trap "rm -f '$TMP_INPUT'" EXIT
cat > "$TMP_INPUT"
node -e '
const fs = require("fs");
const input = fs.readFileSync(process.argv[1], "utf8");
try {
  const pkg = JSON.parse(input);
  let modified = false;
  if (pkg.scripts && pkg.scripts.postinstall) {
    delete pkg.scripts.postinstall;
    modified = true;
  }
  if (pkg.scripts && pkg.scripts.dev && pkg.scripts.dev.startsWith("tooling sync-config && ")) {
    pkg.scripts.dev = pkg.scripts.dev.replace(/^tooling sync-config && /, "");
    modified = true;
  }
  if (modified) {
    process.stdout.write(JSON.stringify(pkg, null, 2) + "\n");
  } else {
    process.stdout.write(input);
  }
} catch (e) {
  process.stdout.write(input);
}
' "$TMP_INPUT"
SMUDGE_EOF
chmod +x "$GIT_DIR/localstrip-smudge.sh"

# 2. 创建 clean 脚本
cat > "$GIT_DIR/localstrip-clean.sh" << 'CLEAN_EOF'
#!/bin/bash
set -e
cat > /dev/null
git show HEAD:package.json 2>/dev/null || cat
CLEAN_EOF
chmod +x "$GIT_DIR/localstrip-clean.sh"

# 3. 配置 attributes
echo "package.json filter=localstrip" >> "$GIT_DIR/info/attributes"

# 4. 配置 filter
cd "$REPO_DIR"
git config filter.localstrip.smudge '.git/localstrip-smudge.sh'
git config filter.localstrip.clean '.git/localstrip-clean.sh'

# 5. 触发 filter
git checkout HEAD -- package.json

echo "Done! Local strip filter configured."
echo "  - postinstall script: stripped"
echo "  - dev script prefix: stripped"
echo "  - git status should be clean"

# 6. 可选：设置 skip-worktree
# git update-index --skip-worktree AGENTS.md
# git update-index --skip-worktree docs/SKILL.md
```

## 八、总结

| 机制 | 本地常驻 | 不推送远端 | 上游可同步 | 所有分支 | 适用场景 |
|------|:--------:|:---------:|:---------:|:--------:|---------|
| `.git/info/exclude` | :x: | :x: | :x: | :x: | 仅未跟踪文件 |
| `--assume-unchanged` | :warning: | :warning: | :x: | :white_check_mark: | 仅性能优化 |
| `--skip-worktree` | :white_check_mark: | :white_check_mark: | :x: | :white_check_mark: | 不需上游同步的文件 |
| **clean/smudge filter** | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | **需要上游同步的文件** |

核心思路：面对"本地修改不推送"这个需求，先问自己一个问题——**这个文件上游改了我还需不需要同步？**

- 需要同步 → clean/smudge filter
- 不需要同步 → `--skip-worktree`

两个机制搭配使用，就能覆盖绝大部分"本地常驻修改"的场景。所有配置文件都在 `.git/` 目录下，天然不会被推送，远端对你的本地修改完全无感。
