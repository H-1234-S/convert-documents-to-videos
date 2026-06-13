## 1. 基础设施准备

- [x] 1.1 安装 vitest 和 @vitest/coverage-v8 到 devDependencies
- [x] 1.2 创建 `vitest.config.ts`（配置 `@/` 别名映射，ESM 兼容）
- [x] 1.3 在 `package.json` 添加 `"test"` 和 `"test:watch"` scripts
- [x] 1.4 创建 `src/server/services/__tests__/` 和 `src/server/routers/__tests__/` 目录
- [x] 1.5 修改 `prisma/schema.prisma`：`Project.status` default `"draft"` → `"queued"`；`GenerationJob` 新增 `requestId String? @unique`
- [x] 1.6 执行 `npx prisma migrate dev --name add_request_id_and_fix_status_default` 生成 migration
- [x] 1.7 验证 `npm run dev` 启动正常（Auth + tRPC + Inngest route 可用）

## 2. quota.service.ts 实现 + 单元测试

- [x] 2.1 创建 `src/server/services/quota.service.ts`：实现 `checkDailyQuota(tx, userId)`，接收事务客户端 `tx` 参数，返回 `QuotaCheckResult { allowed, used, limit, resetsAt }`
- [x] 2.2 导出 `DAILY_FREE_QUOTA = 1` 常量和 `QuotaCheckResult` 接口
- [x] 2.3 创建 `src/server/services/__tests__/quota.service.test.ts`：覆盖空配额、达到上限、排除 cancelled、跨午夜边界、仅使用 tx 参数（不依赖全局 prisma）

## 3. project.service.ts 实现 + 单元测试

- [x] 3.1 创建 `src/server/services/project.service.ts`：实现 `createProject(input, userId, isAdmin)`
- [x] 3.2 在事务内实现完整流程：advisory lock → 额度检查（非 admin）→ 并发检查 → 创建 Project → 创建 GenerationJob
- [x] 3.3 实现辅助函数：`hashUserId()`（userId → bigint）、`isUniqueConstraintError()`（P2002 判断）
- [x] 3.4 实现自定义错误类：`QuotaExceededError`、`ConcurrentLimitError`、`DuplicateRequestError`
- [x] 3.5 处理幂等冲突：catch P2002 → 获取已有 projectId → throw `DuplicateRequestError`（事务自动回滚 Project）
- [x] 3.6 创建 `src/server/services/__tests__/project.service.test.ts`：覆盖正常创建、额度超限、admin 豁免、并发限制、幂等冲突、可选字段、title 截断、事务原子性验证

## 4. Inngest 事件辅助

- [x] 4.1 修改 `src/inngest/client.ts`：添加 `EVENTS` 常量（`VIDEO_GENERATE_REQUESTED`）
- [x] 4.2 添加 `GenerateRequestedEvent` 类型导出
- [x] 4.3 实现并导出 `sendGenerateRequested(params)` 辅助函数

## 5. project.router.ts 实现 + 注册

- [x] 5.1 创建 `src/server/routers/project.ts`：定义 `createProjectInputSchema`（Zod 校验）和 `CreateProjectInput` 类型
- [x] 5.2 实现 `projectRouter` 的 `createAndGenerate` mutation（`protectedProcedure`）
- [x] 5.3 Router 层错误映射：`QuotaExceededError` → `TOO_MANY_REQUESTS [QUOTA_EXCEEDED]`，`ConcurrentLimitError` → `TOO_MANY_REQUESTS [CONCURRENT_LIMIT]`，`DuplicateRequestError` → `CONFLICT [DUPLICATE_REQUEST]`，未知错误 → `INTERNAL_SERVER_ERROR`
- [x] 5.4 Router 层 Inngest 发送：事务成功后发送事件，失败时 console.error 不阻塞响应
- [x] 5.5 在 `src/server/routers/_app.ts` 中注册 `projectRouter`

## 6. tRPC 集成测试

- [x] 6.1 在 `src/server/trpc.ts` 中导出 `createCaller`（使用 `t.createCallerFactory(appRouter)`）
- [x] 6.2 创建 `src/server/routers/__tests__/project.router.test.ts`：使用 `createCaller` 直接调用 procedure
- [x] 6.3 集成测试用例：正常输入返回 projectId+jobId、空文本 BAD_REQUEST、额度超限 TOO_MANY_REQUESTS、并发限制 TOO_MANY_REQUESTS、幂等冲突 CONFLICT、admin 豁免、Inngest 发送失败仍成功

## 7. 集成验证

- [x] 7.1 `npm test` 全部测试通过（单元 + 集成）
- [x] 7.2 `npm run lint` 无新增错误
- [x] 7.3 手动验证：DB 中 Project(status=queued) + GenerationJob(status=pending) 同时存在
- [x] 7.4 手动验证：Inngest Dev UI 可见 `video/generate.requested` 事件
- [x] 7.5 手动验证：重复 requestId → 409 DUPLICATE_REQUEST
- [x] 7.6 手动验证：第 2 次请求 → 429 QUOTA_EXCEEDED
- [ ] 7.7 PR Checklist 全部通过
