# Convert Documents to Videos

一个使用 Next.js 和 better-auth 构建的文档转视频应用。

## 功能特性

- 📧 邮箱密码注册和登录
- 🔐 邮箱验证和密码重置
- 🔒 安全的会话管理和 CSRF 保护
- 🚀 速率限制防止暴力破解
- 🎨 响应式 UI 设计
- 🔑 受保护路由和中间件认证

## 技术栈

- **框架**: Next.js 16.2.7 (App Router)
- **认证**: better-auth 1.6.14
- **数据库**: PostgreSQL + Prisma
- **UI**: Tailwind CSS + shadcn/ui
- **语言**: TypeScript

## 开始使用

### 前置要求

- Node.js 18+ 
- PostgreSQL 数据库
- 微信开放平台账号（可选，用于微信登录）

### 安装

1. 克隆仓库

```bash
git clone <repository-url>
cd convert-documents-to-videos
```

2. 安装依赖

```bash
npm install
```

3. 配置环境变量

复制 `.env.example` 到 `.env.local` 并填写配置：

```bash
cp .env.example .env.local
```

**必需的环境变量：**

- `DATABASE_URL`: PostgreSQL 连接字符串
- `BETTER_AUTH_SECRET`: 至少32字符的随机密钥（生产环境必须修改）
- `BETTER_AUTH_URL`: 应用的公开访问 URL
- `NEXT_PUBLIC_APP_URL`: 客户端使用的应用 URL

**可选的环境变量：**

- `WECHAT_CLIENT_ID` / `WECHAT_CLIENT_SECRET`: 微信开放平台凭证
- `SMTP_*`: SMTP 邮件服务器配置（用于发送验证和重置邮件）

生成随机密钥：
```bash
openssl rand -base64 32
```

4. 运行数据库迁移

```bash
npx prisma migrate dev
```

5. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
src/
├── app/
│   ├── (auth)/              # 认证相关页面（登录、注册等）
│   ├── (protected)/         # 需要认证的页面
│   ├── api/auth/[...all]/   # better-auth API 路由
│   └── layout.tsx           # 根布局（包含 SessionProvider）
├── components/
│   ├── auth/                # 认证相关组件
│   └── ui/                  # UI 组件库
├── lib/
│   ├── auth.ts              # 服务端 better-auth 配置
│   └── auth-client.ts       # 客户端 better-auth 配置
└── middleware.ts            # 路由保护中间件
```

## 认证流程

### 邮箱密码注册
1. 用户访问 `/signup` 填写注册表单
2. 系统创建账号并发送验证邮件
3. 用户点击邮件中的链接完成验证
4. 验证成功后可以登录

### 密码重置
1. 用户访问 `/forgot-password` 输入邮箱
2. 系统发送重置密码邮件
3. 用户点击邮件中的链接设置新密码
4. 重置成功后使用新密码登录

### 微信登录
1. 用户点击"微信登录"按钮
2. 重定向到微信授权页面扫码
3. 授权成功后自动创建账号并登录

## 安全特性

- ✅ CSRF 保护（所有状态变更请求）
- ✅ 速率限制（1分钟内最多5次登录尝试）
- ✅ 安全的会话 Cookie（httpOnly + secure + sameSite）
- ✅ 密码强度验证（至少8字符，包含字母和数字）
- ✅ 服务端路由保护（通过 middleware）
- ✅ 自动会话刷新和跨标签页同步

## 开发指南

### 添加新的受保护路由

在 `src/middleware.ts` 中添加到 `protectedPaths` 数组：

```typescript
const protectedPaths = ["/profile", "/dashboard", "/your-new-route"]
```

### 使用会话信息

在客户端组件中：

```tsx
"use client"
import { useSession } from "@/lib/auth-client"

export function YourComponent() {
  const { data: session, isPending } = useSession()
  
  if (isPending) return <div>加载中...</div>
  if (!session) return <div>未登录</div>
  
  return <div>你好, {session.user.name}</div>
}
```

## 部署

1. 确保所有环境变量已在生产环境配置
2. 运行数据库迁移：`npx prisma migrate deploy`
3. 构建应用：`npm run build`
4. 启动生产服务器：`npm start`

**重要**: 生产环境必须修改 `BETTER_AUTH_SECRET` 为强随机密钥。

## 故障排除

### 邮件发送失败
- 检查 SMTP 配置是否正确
- 临时禁用邮箱验证：在 `src/lib/auth.ts` 中设置 `requireEmailVerification: false`

### 微信登录失败
- 验证 `WECHAT_CLIENT_ID` 和 `WECHAT_CLIENT_SECRET` 是否正确
- 确保回调 URL 在微信开放平台中已配置

### 会话过期问题
- 检查 `BETTER_AUTH_SECRET` 在所有实例中一致
- 验证时间同步正确

## License

MIT
