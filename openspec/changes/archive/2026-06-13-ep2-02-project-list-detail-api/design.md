## Context

ep2-01 已实现 `project.createAndGenerate` mutation，包含 advisory lock → 额度检查 → 并发检查 → Project + GenerationJob 创建的事务流程。本项目需要在此基础上，为 Dashboard 和项目详情页提供只读查询能力。

当前架构：service 层直接内联 Prisma 调用（适合 ep2-01 的复杂事务模式）。本 Change 引入 **repository 层**作为纯查询的数据访问封装，两个模式共存于同一 service 文件。

已就绪的依赖：
- `_app.ts` 中 projectRouter 已注册，新端点自动可用
- `createCaller` 已导出，可直接用于测试
- tRPC context 含 `ctx.userId` 和 `ctx.isAdmin`
- Prisma Schema 中 Project / GenerationJob / StoryboardVersion / Scene 表已完善

## Goals / Non-Goals

**Goals:**
- 实现 `project.list` query：cursor-based 分页 + 按 status 筛选，仅返回当前用户的项目
- 实现 `project.getById` query：查询 Project 含最近 GenerationJob + 当前 StoryboardVersion（含 Scene 列表），owner 或 admin 可访问
- 新建 `project.repo.ts` 数据访问层，封装 Prisma select 和分页逻辑
- 完整的 repo / service / router 三层测试覆盖

**Non-Goals:**
- 前端 Dashboard 页面（ep2-03）、项目详情页（ep2-04）
- 删除/取消/重试 API（ep2-05）
- Asset 签名 URL 返回（ep4-04）
- 全文搜索、模糊搜索
- admin 在 list 中查看所有用户项目（admin 也按 userId 隔离列表）

## Decisions

### 1. 分页策略：Cursor-based（游标为 `Project.id`）

比 offset 更稳定，数据变动时不会跳过重复或漏掉数据。Prisma 原生支持 `cursor: { id } + skip: 1`。`Promise.all([findMany, count])` 并行查询减少延迟。

### 2. 数据访问层：新建 project.repo.ts

列表/详情是纯查询，适合抽到 repo；ep2-01 的事务逻辑保持内联。repo 层封装 Prisma select 对象和类型转换，service 层保持清爽。

### 3. 权限模型

| 端点 | 普通用户 | Admin |
|------|---------|-------|
| `project.list` | 仅自己的项目 | 仅自己的项目 |
| `project.getById` | 仅自己的项目 | 可查看任意用户的项目 |

list 按 userId 过滤；getById 放开 admin 跨用户访问用于排查。

### 4. repo 层 import 模式

顶层 `import { prisma } from "@/lib/db/client"`（非动态 import）。repo 是纯查询函数无需事务隔离，顶层 import 更简洁。测试用 `vi.mock` 拦截。

### 5. currentJob 定义

取 `generationJobs` 中 `createdAt` 最新的一条。retry 会创建新 Job，始终指向最新。

### 6. Zod 校验

- `status`：`z.enum(VALID_PROJECT_STATUSES)` — 编译期+运行期双重捕获无效值
- `projectId`：`.min(1).max(50).regex(/^[a-zA-Z0-9_-]+$/)` — CUID 格式，非 UUID
- `pageSize`：`.int().min(1).max(50).default(12)`

### 7. userId 处理

repo 层 `DETAIL_SELECT` 含 `userId: true`（权限校验必需），router 层在返回前 `const { userId, ...publicDetail } = detail` 剔除，编译时保证不泄露。

### 8. 错误码格式

沿用 ep2-01 模式：`[CODE] message | key=value`。`ProjectNotFoundError` → `NOT_FOUND`，`ProjectAccessDeniedError` → `FORBIDDEN`。

## Risks / Trade-offs

| 风险 | 级别 | 缓解 |
|------|------|------|
| `satisfies Prisma.ProjectSelect` 在 Prisma 7 中类型推断异常 | 低 | TypeScript 4.9+ 原生支持 `satisfies`；若不兼容降级为显式类型标注 |
| `Promise.all([findMany, count])` 数据不一致 | 低 | 非事务读的天然性质，Dashboard 不需要精确一致性 |
| cursor 分页在数据删除时漏项 | 低 | cursor 基于 id（不变），删除不影响光标；新增数据不影响当前页 |
| 测试 mock 复杂度（三层） | 低 | repo 层独立 mock Prisma；service 层 mock repo；router 层 mock service |
