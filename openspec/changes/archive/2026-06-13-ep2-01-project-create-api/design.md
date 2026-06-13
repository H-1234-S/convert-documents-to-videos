## Context

Volcano 是 AI 视频生成 SaaS 应用，使用 Next.js 16（tRPC v11、Better Auth v1.6、Prisma v7.8 + PostgreSQL、Inngest v4.5）。Epic 1 已完成认证、数据库 Schema 和基础设施搭建。本 Change 是 Epic 2 的第一个功能模块，实现"用户提交文本创建视频生成项目"的核心入口 API。

当前状态：
- tRPC `protectedProcedure` 已就绪（`src/server/trpc.ts`），context 提供 `userId`、`session`、`isAdmin`
- Prisma Schema 中 Project 和 GenerationJob 表已存在，但 `Project.status` 默认值为 `"draft"`（应为 `"queued"`）
- Inngest client 已是最小化配置（仅 `new Inngest({ id: "Volcano" })`），缺少事件类型定义和发送辅助函数
- 项目无测试基础设施（devDependencies 中无 vitest）
- 无业务服务层（`src/server/services/` 目录不存在）

## Goals / Non-Goals

**Goals:**
- 实现 `project.createAndGenerate` tRPC mutation，接收文本+配置参数，创建 Project 和 GenerationJob，发送 Inngest 事件
- 在单个 Prisma 交互式事务内完成所有业务判断（额度检查 + 并发检查 + 创建），消除 TOCTOU 竞态窗口
- 使用 PostgreSQL advisory lock（`pg_advisory_xact_lock`）按 userId 串行化同一用户的并发请求
- 通过 `GenerationJob.requestId @unique` 实现数据库级幂等保护
- 搭建 vitest 测试基础设施，编写单元测试和集成测试

**Non-Goals:**
- Inngest function 实现（ep3-04）
- 项目列表/详情 API（ep2-02）
- 完整错误码体系 / AppError 类（ep7-01）
- UsageRecord 写入（ep7-02）
- stuck project 定时扫描补偿（ep7-03）
- 前端创建页面（ep2-04）

## Decisions

### 1. Project 初始状态：`queued`（修改 Schema default）

**决策**：将 `Project.status` 默认值从 `"draft"` 改为 `"queued"`。

**理由**：`draft` 语义上表示用户正在编辑草稿，但 `createAndGenerate` 是用户提交后的入口——此时 Project 已进入生成队列。PRD 状态机虽然是 `draft → queued → ...`，但当前产品没有"保存草稿"功能，跳过 draft 直接从 queued 开始。

**替代方案**：保持 Schema default 为 `"draft"`，在 service 层显式设置 `status: "queued"`。被否决原因：Schema default 应与业务语义一致，减少隐式依赖。

### 2. 幂等键：`GenerationJob.requestId @unique`（非 JSON 搜索方案）

**决策**：在 GenerationJob 表新增 `requestId String? @unique` 字段，利用数据库唯一约束保证幂等。

**理由**：
- `@unique` 约束提供数据库级强保证，无竞态窗口
- 放在 GenerationJob 而非 Project：一个 Project 可经历多次重试（多个 GenerationJob），每次携带新 requestId；GenerationJob 天然承载"本次操作"语义
- 比 JSON 字段搜索方案更高效（可被索引，无需反序列化查询）

**替代方案**：将 requestId 存储在 GenerationJob 的 JSON 字段中通过反序列化搜索。被否决：Prisma 无法高效查询 JSON 内部字段，且无法利用索引。

### 3. TOCTOU 防护：PostgreSQL Advisory Lock（非 SELECT FOR UPDATE）

**决策**：将全部业务判断（额度检查 + 并发检查）统一移入 advisory lock 保护的事务内，锁外不做任何状态判断。

**理由**：
- 并发限制检查的是多个 Project 行（count），不是更新某一行；`SELECT ... FOR UPDATE` 无法阻止新行插入
- Advisory lock 在应用层精确控制锁范围（per userId），不同用户之间不互斥
- 使用 `pg_advisory_xact_lock`（事务级）：事务提交/回滚时自动释放，无需手动 unlock
- 避免错误消息类型混淆：如果额度检查在事务外，两个并发请求可能都通过额度检查，然后第二个在锁内因并发限制被拒——本当报 QUOTA_EXCEEDED 却报了 CONCURRENT_LIMIT

**替代方案**：事务外检查部分条件 + 事务内检查剩余条件。被否决：存在 TOCTOU 窗口，错误消息不准确。

### 4. 额度检查数据源：GenerationJob 计数（暂代 UsageRecord）

**决策**：当前基于 `GenerationJob` 表计数实现额度检查，ep7-02 迁至 `UsageRecord` 表。

**理由**：UsageRecord 写入逻辑在 ep7-02 才实现；GenerationJob 在创建时即写入，在事务内查询即可获得即时准确的计数。`checkDailyQuota()` 签名在迁移时保持不变（API 契约稳定）。

### 5. Inngest 发送失败：不阻塞 API 响应

**决策**：Inngest `send()` 放在事务提交之后，失败时记录 `console.error` 但不向上抛错误。

**理由**：事务已提交无法回滚；Project 保持 `queued` 状态等待 ep7-03 的定时 sweep 补偿机制。前端仍收到创建成功的响应，进度页轮询到长时间 `queued` 时展示"排队中"。

### 6. 错误码格式：嵌入 TRPCError message（临时方案）

**决策**：业务错误码嵌入 TRPCError 的 `message` 字段，格式为 `[CODE] message | details`。

**理由**：tRPC 内置 `code` 枚举值有限（BAD_REQUEST / UNAUTHORIZED / TOO_MANY_REQUESTS / CONFLICT 等），无法承载细粒度业务错误码。ep7-01 将引入统一 `AppError` 类和 tRPC `errorFormatter`，届时重构。当前格式在 ep7-01 前后对前端透明（message 字段始终存在）。

### 7. 测试框架：vitest（从零搭建）

**决策**：本 Change 安装 vitest + @vitest/coverage-v8 作为项目测试基础设施。

**理由**：项目原本无任何测试框架。vitest 是当前 Next.js 生态的首选测试工具，与 Vite 原生集成，支持 ESM 和 TypeScript。配置文件显式设置 `@/` 路径别名映射。

### 8. 锁键生成：hashUserId 简单哈希

**决策**：使用 `hashUserId()` 将 userId 字符串转为 bigint 作为 advisory lock 的锁键。

**理由**：PostgreSQL advisory lock 接受 signed 64-bit bigint。简单 djb2 变体哈希对 userId（一般为 cuid/ulid）冲突概率极低。锁粒度是 per-userId，不同用户不互斥。

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| `pg_advisory_xact_lock` 在 pgBouncer 事务池模式下不可用（连接可能被复用） | 当前部署使用 PostgreSQL 直连；如需 pgBouncer，可切换到 session 模式或降级为无锁方案 |
| `Prisma.$queryRawUnsafe` SQL 注入 | `lockId` 由纯函数 `hashUserId()` 生成，无用户输入进入 SQL 字符串拼接 |
| Zod v4 API 变化 | 已逐 API 确认 v3↔v4 兼容性（所用 API 行为均无变化） |
| `requestId` unique 约束 migration 与已有数据冲突 | 数据库当前无 GenerationJob 记录（空表），migration 安全 |
| vitest `@/` 别名解析与 Next.js 不一致 | `vitest.config.ts` 显式配置 alias，与 tsconfig paths 保持一致 |
| tRPC v11 `createCallerFactory` API 可能变化 | Step 5 集成测试阶段按 tRPC v11 文档实现，如遇 API 差异实时调整 |
| advisory lock 的 `Math.abs` 边界问题 | `Math.abs(-2147483648)` 在 JS 中仍为负数，但 PostgreSQL advisory lock 接受负 bigint，功能不受影响 |
| Prisma 事务内 P2002 错误后 findUnique 失败 | 已修正设计：catch P2002 后直接通过 `error.projectId` 获取（或在事务外重查），不再在已中止事务内执行 findUnique |
