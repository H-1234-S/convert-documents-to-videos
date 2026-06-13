## 1. 依赖和环境准备

- [x] 1.1 安装 @aws-sdk/client-s3 依赖
- [x] 1.2 更新 .env.example 添加所有新增环境变量和说明
- [x] 1.3 在本地 .env 文件中添加 ADMIN_EMAILS 配置

## 2. 环境变量管理

- [x] 2.1 创建 src/lib/env.ts 定义 Zod schema
- [x] 2.2 添加必填变量校验：DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, ADMIN_EMAILS
- [x] 2.3 添加可选变量（开发模式）：R2_*, INNGEST_*, DEEPSEEK_*, MINIMAX_*, REMOTION_*
- [x] 2.4 实现 NODE_ENV 区分的条件校验逻辑
- [x] 2.5 导出 Env 类型供全局使用

## 3. Prisma Schema 扩展

- [x] 3.1 在 prisma/schema.prisma 中添加 Project 表定义
- [x] 3.2 添加 StoryboardVersion 表定义
- [x] 3.3 添加 Scene 表定义
- [x] 3.4 添加 Asset 表定义（包含 lifecycleStatus 字段）
- [x] 3.5 添加 GenerationJob 表定义
- [x] 3.6 添加 RenderJob 表定义
- [x] 3.7 添加 JobEvent 表定义
- [x] 3.8 添加 UsageRecord 表定义
- [x] 3.9 更新 User 表添加关系：projects, assets, generationJobs, usageRecords
- [x] 3.10 添加所有必需的索引：userId_createdAt_idx, projectId_status_idx 等
- [x] 3.11 运行 npx prisma migrate dev --name add_business_tables (需要数据库运行时执行)
- [x] 3.12 运行 npx prisma generate 生成类型

## 4. 数据库辅助函数

- [x] 4.1 创建 src/lib/db/ 目录
- [x] 4.2 在 src/lib/db/client.ts 中导出 prisma 单例（复用 src/lib/prisma.ts）
- [x] 4.3 创建 src/lib/db/errors.ts 实现 isPrismaError 函数
- [x] 4.4 实现 mapPrismaError 将 Prisma 错误码映射为友好消息
- [x] 4.5 创建 src/lib/db/transaction.ts 实现 executeTransaction wrapper
- [x] 4.6 导出 TypeScript 类型工具：PrismaSelect, PrismaInclude

## 5. 管理员权限判断

- [x] 5.1 在 src/lib/auth.ts 中添加 isAdminEmail 函数（小写匹配）
- [x] 5.2 添加 isAdminSession 函数检查当前 session
- [x] 5.3 实现邮箱白名单解析逻辑（trim + toLowerCase）

## 6. tRPC Server 配置

- [x] 6.1 创建 src/server/ 目录
- [x] 6.2 创建 src/server/context.ts 定义 createContext 函数
- [x] 6.3 在 context 中集成 better-auth session 获取
- [x] 6.4 在 context 中添加 isAdmin 判断逻辑
- [x] 6.5 创建 src/server/trpc.ts 初始化 tRPC
- [x] 6.6 导出 publicProcedure 和 protectedProcedure
- [x] 6.7 创建 adminProcedure 检查 isAdmin 权限
- [x] 6.8 创建 src/server/routers/ 目录
- [x] 6.9 创建 src/server/routers/_app.ts 定义空的 appRouter
- [x] 6.10 导出 AppRouter 类型供客户端使用

## 7. tRPC Client 配置

- [x] 7.1 创建 src/lib/trpc/ 目录
- [x] 7.2 创建 src/lib/trpc/client.ts 使用 createTRPCReact
- [x] 7.3 配置 httpBatchLink 指向 /api/trpc
- [x] 7.4 导出 trpc 实例供组件使用

## 8. tRPC API Route

- [x] 8.1 创建 src/app/api/trpc/[trpc]/ 目录
- [x] 8.2 创建 src/app/api/trpc/[trpc]/route.ts
- [x] 8.3 使用 fetchRequestHandler 处理 GET 和 POST 请求
- [x] 8.4 集成 appRouter 和 createContext

## 9. TanStack Query 配置

- [x] 9.1 创建 src/lib/query-client.ts 初始化 QueryClient
- [x] 9.2 配置 staleTime 为 60 秒，refetchOnWindowFocus 为 false
- [x] 9.3 创建 src/components/providers/query-provider.tsx
- [x] 9.4 在 QueryProvider 中集成 tRPC client 和 QueryClientProvider
- [x] 9.5 添加 ReactQueryDevtools（开发模式）
- [x] 9.6 在 src/app/layout.tsx 中使用 QueryProvider 包裹 children

## 10. Cloudflare R2 配置

- [x] 10.1 创建 src/lib/r2.ts
- [x] 10.2 使用 S3Client 初始化 R2 客户端（检查环境变量是否存在）
- [x] 10.3 实现 generateAssetKey 函数（userId/projectId/assetId.ext）
- [x] 10.4 定义 uploadToR2 函数签名（抛出 Not implemented）
- [x] 10.5 定义 getSignedUrl 函数签名（抛出 Not implemented）
- [x] 10.6 定义 deleteFromR2 函数签名（抛出 Not implemented）
- [x] 10.7 导出类型定义：UploadParams, UploadResult

## 11. Inngest 配置完善

- [x] 11.1 创建 src/inngest/functions/ 目录
- [x] 11.2 创建 src/inngest/functions/index.ts 导出空 functions 数组
- [x] 11.3 更新 src/app/api/inngest/route.ts
- [x] 11.4 使用 serve handler 注册 inngest client 和 functions
- [x] 11.5 导出 GET 和 POST handler

## 12. 验证和测试

- [x] 12.1 运行 npm run build 确保构建成功
- [x] 12.2 运行 npm run dev 确保启动成功
- [x] 12.3 检查 TypeScript 类型无错误
- [x] 12.4 访问 /api/trpc 确认返回 tRPC 响应
- [x] 12.5 访问 /api/inngest 确认返回 Inngest 健康检查
- [x] 12.6 验证 .env.example 包含所有必需变量
- [x] 12.7 确认 Prisma Studio 可以看到所有 12 个表（4 auth + 8 business）
