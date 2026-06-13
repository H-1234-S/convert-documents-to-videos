## Context

当前项目已完成 Next.js 基础搭建和 better-auth 认证，但缺少支持 AI 文本转视频业务流程所需的核心基础设施。根据 PRD Epic 1 定义，需要补全：业务数据模型、类型安全的 API 层、数据获取机制、环境变量校验、对象存储、任务编排系统。

现有技术栈：
- Next.js 16.2.7 (App Router)
- TypeScript 5 (Strict Mode)
- Prisma 7.8.0 + PostgreSQL
- better-auth 1.6.14（已配置邮箱验证、密码重置、微信登录）
- @trpc/server 11.17.0（已安装但未配置）
- @tanstack/react-query 5.101.0（已安装但未配置）
- inngest 4.5.1（client 已创建，endpoint 未完善）
- zod 4.4.3（已安装）

现有结构：
- `src/lib/auth.ts`: better-auth 配置完整
- `src/lib/prisma.ts`: Prisma client 单例
- `src/inngest/client.ts`: Inngest client 基础配置
- `src/app/api/inngest/route.ts`: endpoint 存在但不完整
- `prisma/schema.prisma`: 只有 better-auth 的 4 个表

约束：
- 不修改现有 better-auth 配置和认证流程
- 保持 Prisma 输出路径为 `src/generated/prisma`
- 遵循 Next.js App Router 约定
- Epic 1 只配置基础设施，不实现业务 functions

## Goals / Non-Goals

**Goals:**
- 补全 Prisma schema 定义 8 个核心业务表
- 配置 tRPC server 和 client，建立类型安全的 API 层
- 配置 TanStack Query provider 和 tRPC 集成
- 使用 Zod 校验环境变量，区分必填和可选
- 配置 Cloudflare R2 客户端和资源命名规则
- 完善 Inngest API endpoint handler
- 创建数据库查询辅助函数
- 实现基于 ADMIN_EMAILS 的管理员权限判断

**Non-Goals:**
- 不实现具体业务 tRPC routers（后续 Epic）
- 不实现 Inngest functions（后续 Epic）
- 不实现实际的 R2 上传逻辑（后续 Epic）
- 不修改 better-auth 配置
- 不实现前端 UI 组件

## Decisions

### Decision 1: Prisma Schema 扩展策略

**选择**: 在现有 better-auth schema 基础上添加业务表，User 表保持不变，通过外键建立关联。

**理由**:
- better-auth 的 User 表由 better-auth 管理，不应手动修改结构
- 通过 `User.id` 外键关联业务表（Project, Asset, GenerationJob 等）
- 保持 better-auth 的升级路径清晰

**替代方案**:
- 扩展 User 表添加业务字段 → ❌ 破坏 better-auth 的管理边界
- 创建独立的 UserProfile 表 → ❌ Epic 1 不需要额外的用户资料

**实施**:
```prisma
model User {
  // ... better-auth 字段
  projects      Project[]
  assets        Asset[]
  generationJobs GenerationJob[]
  usageRecords  UsageRecord[]
}

model Project {
  id     String @id @default(cuid())
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  // ... 其他字段
}
```

### Decision 2: tRPC Context 设计

**选择**: Context 包含 session, userId, userEmail, isAdmin，通过 better-auth session 获取。

**理由**:
- better-auth 的 `auth.api.getSession()` 返回完整 session 对象
- 需要在每个请求中判断管理员身份（isAdmin）
- userId 和 userEmail 常用，提前解析避免重复代码

**替代方案**:
- 只传递 session，让每个 procedure 自己解析 → ❌ 重复代码多
- 创建独立的 auth service → ❌ 过度设计，Epic 1 不需要

**实施**:
```typescript
// server/context.ts
export async function createContext({ req }: { req: Request }) {
  const session = await auth.api.getSession({ headers: req.headers });
  const isAdmin = session?.user?.email 
    ? isAdminEmail(session.user.email) 
    : false;
  
  return {
    session,
    userId: session?.user?.id,
    userEmail: session?.user?.email,
    isAdmin,
  };
}
```

### Decision 3: 环境变量校验时机

**选择**: 在 `src/lib/env.ts` 中立即执行校验，如果失败则 throw error 阻止应用启动。

**理由**:
- 尽早发现配置错误，避免运行时才报错
- Next.js 构建时会加载所有 lib 模块，可以在构建阶段发现问题
- 生产环境启动失败比运行时崩溃更容易排查

**替代方案**:
- 懒加载校验，首次访问时才校验 → ❌ 运行时错误难以排查
- 每次访问都校验 → ❌ 性能开销大

**实施**:
```typescript
// lib/env.ts
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  ADMIN_EMAILS: z.string().transform(s => s.split(',').map(e => e.trim())),
  // ... 其他字段
});

export const env = envSchema.parse(process.env); // 立即执行
```

### Decision 4: R2 客户端抽象层级

**选择**: Epic 1 只创建 R2 client 初始化和基础函数签名，不实现完整上传逻辑。

**理由**:
- Epic 1 目标是"配置基础设施"，不包含业务逻辑
- 完整的上传逻辑需要结合 Asset 表、事务、错误重试，属于 Epic 4 范畴
- 提供函数签名和类型定义，方便后续实现

**替代方案**:
- 实现完整的上传和签名 URL → ❌ 超出 Epic 1 范围
- 完全不创建 R2 文件 → ❌ Epic 2/3 开发时缺少类型定义

**实施**:
```typescript
// lib/r2.ts
import { S3Client } from '@aws-sdk/client-s3';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

// 函数签名，Epic 4 实现
export async function uploadToR2(params: UploadParams): Promise<UploadResult> {
  throw new Error('Not implemented in Epic 1');
}

export function generateAssetKey(userId: string, projectId: string, assetId: string, ext: string): string {
  return `${userId}/${projectId}/${assetId}.${ext}`;
}
```

### Decision 5: Inngest Functions 目录结构

**选择**: 创建 `src/inngest/functions/` 目录和空的 `index.ts`，但不定义任何 function。

**理由**:
- Epic 1 只配置 Inngest endpoint，functions 属于 Epic 3-5
- 预留目录结构，避免后续创建时影响现有文件
- `index.ts` 导出空数组，serve handler 可以正常运行

**替代方案**:
- 不创建 functions 目录 → ❌ Epic 3 开始时需要修改 endpoint 引入路径
- 创建示例 hello function → ❌ 无业务意义，需要后续删除

**实施**:
```typescript
// inngest/functions/index.ts
export const functions = [];

// app/api/inngest/route.ts
import { serve } from 'inngest/next';
import { inngest } from '@/inngest/client';
import { functions } from '@/inngest/functions';

const handler = serve({ client: inngest, functions });
export { handler as GET, handler as POST };
```

### Decision 6: 数据库辅助函数范围

**选择**: 只提供通用的 Prisma client 单例、错误映射、事务 wrapper，不实现业务查询函数。

**理由**:
- 业务查询（如 findProjectsByUserId）高度依赖业务逻辑，Epic 1 不应定义
- 通用函数（事务、错误处理）可以被所有业务代码复用
- 保持 Epic 1 的"基础设施"定位

**替代方案**:
- 实现所有业务查询函数 → ❌ 超出范围，且需求未明确
- 完全不提供辅助函数 → ❌ 后续代码会重复处理 Prisma 错误

**实施**:
```typescript
// lib/db/client.ts
export { prisma } from '@/lib/prisma'; // 复用现有单例

// lib/db/errors.ts
export function isPrismaError(error: unknown): error is PrismaClientKnownRequestError;
export function mapPrismaError(error: PrismaClientKnownRequestError): string;

// lib/db/transaction.ts
export async function executeTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T>;
```

## Risks / Trade-offs

### Risk 1: Prisma Migration 冲突
**风险**: 如果本地数据库已有 better-auth 表但结构不一致，migration 可能失败。

**缓解**:
- 在 migration 前运行 `npx prisma db pull` 检查现有结构
- 使用 `npx prisma migrate dev` 而不是 `db push`，保留 migration 历史
- 提供回滚脚本（删除新增的 8 个表）

### Risk 2: 环境变量缺失导致构建失败
**风险**: 开发者首次 clone 项目时，`.env` 不完整会导致 Next.js 构建失败。

**缓解**:
- 更新 `.env.example` 包含所有变量和说明
- 在 `env.ts` 中区分开发和生产模式，开发模式下部分变量可选
- 在 README.md 添加环境变量配置指南

### Risk 3: tRPC Context 中 session 为 null
**风险**: 公开 API 调用时 session 为 null，访问 `context.userId` 会报错。

**缓解**:
- 使用 `publicProcedure` 和 `protectedProcedure` 区分
- `protectedProcedure` 在 middleware 中检查 session，如果为 null 则抛出 UNAUTHORIZED
- 避免在 context 创建时强制要求 session 存在

### Risk 4: R2 环境变量未配置但代码尝试初始化
**风险**: 如果 R2_* 变量未配置，`new S3Client()` 会抛出错误。

**缓解**:
- 在 `env.ts` 中标记 R2 变量为可选（开发模式）
- `r2.ts` 中检查环境变量是否存在再初始化 client
- 如果变量不存在，导出 null 并在使用时抛出友好错误

### Risk 5: Admin 白名单邮箱格式不一致
**风险**: ADMIN_EMAILS 中包含大小写或空格，导致匹配失败。

**缓解**:
- 在 `env.ts` 中对每个邮箱执行 `trim()` 和 `toLowerCase()`
- `isAdminEmail` 函数也将输入邮箱转换为小写再匹配
- 在 `.env.example` 中注明邮箱需小写且无空格

## Migration Plan

### Phase 1: 添加依赖
```bash
npm install @aws-sdk/client-s3
```

### Phase 2: 更新 Prisma Schema
1. 编辑 `prisma/schema.prisma` 添加 8 个业务表
2. 运行 `npx prisma migrate dev --name add_business_tables`
3. 运行 `npx prisma generate` 生成类型

### Phase 3: 创建配置文件
按以下顺序创建：
1. `src/lib/env.ts` - 环境变量校验
2. `src/server/context.ts` - tRPC context
3. `src/server/trpc.ts` - tRPC 初始化
4. `src/server/routers/_app.ts` - 空 router
5. `src/lib/trpc/client.ts` - tRPC client
6. `src/components/providers/query-provider.tsx` - Query provider
7. `src/app/api/trpc/[trpc]/route.ts` - API handler
8. `src/lib/r2.ts` - R2 client
9. `src/lib/db/` - 数据库辅助函数
10. `src/inngest/functions/index.ts` - 空 functions 数组
11. 更新 `src/app/api/inngest/route.ts`

### Phase 4: 更新 .env.example
添加所有新增环境变量和说明。

### Phase 5: 验证
```bash
npm run build  # 确保构建成功
npm run dev    # 确保启动成功
```

### 回滚策略
如果 migration 失败：
```bash
npx prisma migrate reset  # 重置数据库
git checkout prisma/schema.prisma  # 恢复 schema
```

如果构建失败，检查：
1. `.env` 文件是否包含必需变量
2. TypeScript 错误是否与新增代码相关
3. 依赖是否正确安装

## Open Questions

1. **R2 Bucket 命名**: 开发和生产环境是否使用不同的 bucket？
   - 建议：开发环境 `volcano-assets-dev`，生产环境 `volcano-assets`

2. **Inngest 开发模式**: 是否需要本地运行 Inngest Dev Server？
   - 建议：Epic 1 使用 `INNGEST_DEV=true`，不连接真实 server

3. **管理员权限持久化**: 是否需要在数据库中记录管理员状态？
   - 建议：Epic 1 只用环境变量，如果未来需要动态管理再迁移到数据库

4. **TypeScript strict mode 冲突**: 现有代码是否已启用 `noUncheckedIndexedAccess`？
   - 建议：检查 tsconfig.json，如果启用则在新代码中遵守

5. **Prisma 输出路径**: 是否保持 `src/generated/prisma` 还是改为 `node_modules/.prisma/client`？
   - 建议：保持现有路径，避免破坏现有 import
