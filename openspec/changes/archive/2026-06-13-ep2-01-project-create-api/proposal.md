## Why

Volcano 产品需要让用户提交文本并触发 AI 视频生成流水线。当前系统（Epic 1）已具备认证、tRPC、数据库 Schema 和 Inngest 基础设施，但缺少"创建 Project + 触发生成"这个核心入口 API。本 Change 实现该入口，建立带幂等保护、额度控制和并发限制的业务层，是 Epic 2「项目管理与 Dashboard」的第一个功能模块。

## What Changes

- **Prisma Schema 修改**：`Project.status` 默认值从 `"draft"` 改为 `"queued"`（与流水线入口状态一致）；`GenerationJob` 新增 `requestId String? @unique` 字段（幂等键）
- **测试基础设施搭建**：安装 vitest + @vitest/coverage-v8，创建配置文件，添加 test scripts
- **业务服务层**：新建 `quota.service.ts`（每日免费额度检查，每人每日 1 次）和 `project.service.ts`（在 Prisma 交互式事务内完成 advisory lock → 额度检查 → 并发检查 → Project+GenerationJob 创建）
- **tRPC mutation**：实现 `project.createAndGenerate`（`protectedProcedure`），接收文本和配置参数，返回 `{ projectId, jobId }`
- **Inngest 事件发送**：在 `client.ts` 中添加 `EVENTS` 常量和 `sendGenerateRequested()` 辅助函数，事务提交后发送 `video/generate.requested` 事件
- **错误处理**：自定义错误类（`QuotaExceededError` / `ConcurrentLimitError` / `DuplicateRequestError`），在 router 层映射为带嵌入式错误码的 TRPCError

## Capabilities

### New Capabilities

- `project-creation`: 用户提交文本创建视频生成项目，包含 Zod 输入校验、PostgreSQL advisory lock 防 TOCTOU 竞态、每日免费额度检查（1 次/用户/日）、admin 无限额、并发限制（1 个 active/用户）、`requestId` 幂等保护（数据库级 @unique 约束）、Inngest 事件发送（失败不阻塞创建，ep7-03 补偿）

### Modified Capabilities

- `database-schema`: `Project.status` 默认值从 `"draft"` 改为 `"queued"`；`GenerationJob` 新增 `requestId String? @unique` 字段
- `task-orchestration`: 新增 `EVENTS` 常量、`GenerateRequestedEvent` 类型和 `sendGenerateRequested()` 辅助函数，标准化 Inngest 事件发送模式

## Impact

- **Affected code**: `prisma/schema.prisma`（修改）、`src/server/services/`（新建目录）、`src/server/services/quota.service.ts`（新建）、`src/server/services/project.service.ts`（新建）、`src/server/routers/project.ts`（新建）、`src/inngest/client.ts`（修改）、`src/server/routers/_app.ts`（修改）、`package.json`（修改）、`vitest.config.ts`（新建）
- **New dependencies**: vitest、@vitest/coverage-v8（devDependencies）
- **DB migration**: 新增 migration（修改 Project.status default、新增 GenerationJob.requestId）
- **Breaking changes**: 无。Schema 默认值变更仅影响新记录，已有数据不受影响（当前数据库无业务数据）。API 为全新 endpoint，不影响现有路由
- **互补 Change**: 本 Change 的幂等和事务逻辑与 ep7-01（错误码体系标准化）、ep7-02（UsageRecord 消费记录）、ep7-03（stuck project 定时扫描补偿）存在后续升级路径
