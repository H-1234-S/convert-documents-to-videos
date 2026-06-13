---
name: jo-git-commit
description: Use when implementation is complete and you're ready to commit and push - follows Jo's branch naming, commit message convention, and push pattern
---

# Jo's Git Commit

## 概述

当实现完成（测试通过、lint 无警告），准备提交并推送时使用此 skill。遵循 Jo 的命名规范和提交风格。

**核心原则：** 分支名语义化 → 提交信息中文描述 → 推送绑定远程分支。

**技能触发时宣布：** "I'm using the jo-git-commit skill to commit and push this work."

## 分支命名规范

```
<number>-<kebab-case-description>
```

| 序号 | 确定方式 |
|------|---------|
| 已有分支 | `git branch -a` 查看现有分支，取最小编号 + 1 |
| 首个分支 | 从 `01` 开始 |

**示例：**
```
01-init-project
02-identity-authentication
03-project-create-api
04-project-list-detail-api
05-project-delete-cancel
```

## 提交信息规范

### 简短格式（推荐）

```
<number>: <中文描述>
```

```bash
git commit -m "04: project list and detail query API"
```

### 详细格式（重大变更时使用）

```
<number>: <中文简短描述>

- <变更点 1>
- <变更点 2>
- <变更点 3>
```

```bash
git commit -m "04: project list & detail query API

- 新建 project.repo.ts 数据访问层（cursor 分页 + Prisma select）
- 追加 listProjects / getProjectById 到 project.service
- 追加 project.list / project.getById tRPC query 端点
- 新增 ProjectNotFoundError / ProjectAccessDeniedError
- 67 个测试全部通过，lint 零警告"
```

## 执行流程

### Step 1: 确认基线通过

```bash
npm test && npm run lint
```

### Step 2: 创建分支并提交

```bash
# 创建并切换到新分支
git checkout -b <number>-<branch-name>

# 添加所有变更
git add .

# 提交
git commit -m "<number>: <description>"
```

### Step 3: 推送并绑定远程

```bash
git push -u origin <number>-<branch-name>
```

`-u` 参数的作用：
- 将本地分支和远程分支建立追踪关系
- 后续只需 `git push` / `git pull`，无需指定远程和分支名

## 完整示例

```bash
# Step 1: 验证
npm test
npm run lint

# Step 2: 分支 + 提交
git checkout -b 04-project-list-detail-api
git add .
git commit -m "04: project list and detail query API"

# Step 3: 推送
git push -u origin 04-project-list-detail-api
```

## Commit Strategy（多 commit 拆分）

当变更较大时，拆分为多个 commit：

```bash
# Commit 1: 数据层
git add src/lib/db/repositories/
git commit -m "feat(ep2-02): add project repo with list and detail queries"

# Commit 2: 业务层
git add src/server/services/
git commit -m "feat(ep2-02): add listProjects and getProjectById to project.service"

# Commit 3: API 层
git add src/server/routers/
git commit -m "feat(ep2-02): add project.list and project.getById tRPC endpoints"
```

## Red Flags

**绝不：**
- 在测试失败时提交
- 在 lint 有错误时提交
- 直接 push 到 `main` 分支
- 跳过 `-u` 参数（会导致后续 push/pull 需重复指定远程分支）
- 在 `main` 分支上直接开发

**始终：**
- 先运行 `npm test` 确认通过
- 先运行 `npm run lint` 确认无新增错误
- 在 feature 分支上工作
- 使用 `-u` 绑定远程追踪
