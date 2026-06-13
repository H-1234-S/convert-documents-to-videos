## Why

当前项目已完成 Next.js 基础搭建和 better-auth 认证，但缺少核心业务功能所需的基础设施。为了支持 AI 文本转视频的核心业务流程（Storyboard 生成、TTS 音频、Remotion 渲染），需要补全 Epic 1 定义的基础工程组件：业务数据模型、tRPC API 层、数据获取层、环境变量管理、存储服务和任务编排系统。

## What Changes

- **添加业务数据模型**：在 Prisma schema 中新增 8 个核心业务表（Project, StoryboardVersion, Scene, Asset, GenerationJob, RenderJob, JobEvent, UsageRecord）
- **配置 tRPC + TanStack Query**：建立类型安全的 API 层和数据获取机制
- **环境变量管理**：使用 Zod 校验必需和可选环境变量
- **Cloudflare R2 配置**：配置 S3-compatible 存储客户端，定义资源命名规则
- **完善 Inngest 配置**：补全 API route handler 和 functions 注册机制
- **数据库辅助函数**：创建通用的 Prisma 查询辅助工具
- **管理员权限判断**：基于 ADMIN_EMAILS 环境变量的白名单机制

## Capabilities

### New Capabilities

- `database-schema`: 8 个核心业务表的完整 Prisma schema 定义，包括索引、关系和约束
- `trpc-api`: tRPC server 和 client 配置，包括 context、router 和类型导出
- `data-fetching`: TanStack Query provider 配置和 tRPC 集成
- `env-validation`: 使用 Zod 校验的环境变量管理系统
- `storage-provider`: Cloudflare R2 客户端配置和资源上传/签名 URL 生成
- `task-orchestration`: Inngest client 和 API endpoint 的完整配置
- `database-helpers`: 通用 Prisma 查询辅助函数和事务管理
- `admin-authorization`: 基于邮箱白名单的管理员权限判断逻辑

### Modified Capabilities

<!-- 无现有功能需求变更 -->

## Impact

**数据库**
- 新增 8 个业务表，需要执行 Prisma migration
- better-auth 表需要添加与业务表的关系（User → Project 等）

**环境变量**
- 新增必填变量：DATABASE_URL（已有）, BETTER_AUTH_SECRET（已有）, ADMIN_EMAILS
- 新增可选变量：R2_*, INNGEST_*, DEEPSEEK_*, MINIMAX_*, REMOTION_*

**项目结构**
- `/src/server/` 目录：tRPC routers 和 context
- `/src/lib/env.ts`：环境变量校验
- `/src/lib/r2.ts`：R2 客户端
- `/src/lib/db/`：数据库辅助函数
- `/src/inngest/functions/`：后台任务定义（预留）

**依赖**
- 已有：@trpc/server, @trpc/client, @tanstack/react-query, inngest, zod
- 需要添加：@aws-sdk/client-s3（用于 R2）

**现有代码**
- `src/lib/auth.ts`：需要添加管理员判断 helper 函数
- `src/app/api/inngest/route.ts`：需要完善 handler 实现
- `prisma/schema.prisma`：需要添加业务表和更新 User 关系
