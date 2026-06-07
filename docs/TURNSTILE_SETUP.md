# Cloudflare Turnstile 人机验证配置

## 获取 Turnstile 密钥

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 登录你的 Cloudflare 账号
3. 进入 **Turnstile** 页面
4. 点击 **Add Site** 创建新站点
5. 填写站点信息：
   - **Site name**: 你的站点名称
   - **Domain**: 你的域名（开发环境可以填 `localhost`）
   - **Widget Mode**: 选择 `Managed` (推荐)
6. 创建后会获得：
   - **Site Key** (公开的，用于前端)
   - **Secret Key** (保密的，用于后端验证)

## 环境变量配置

在 `.env.local` 文件中添加：

```env
# 生产环境使用真实密钥
NEXT_PUBLIC_TURNSTILE_SITE_KEY="your-actual-site-key"
TURNSTILE_SECRET_KEY="your-actual-secret-key"
```

## 开发环境测试密钥

开发阶段可以使用 Cloudflare 提供的测试密钥：

```env
# 开发环境测试密钥（总是通过验证）
NEXT_PUBLIC_TURNSTILE_SITE_KEY="1x00000000000000000000AA"
TURNSTILE_SECRET_KEY="1x0000000000000000000000000000000AA"
```

**注意**：测试密钥会总是验证成功，仅用于开发和测试。生产环境必须使用真实密钥。

## 验证流程

1. 用户在注册页面填写表单
2. Turnstile widget 自动展示人机验证（无需用户交互，或简单点击）
3. 验证成功后获得 token
4. 前端提交注册请求前，先调用 `/api/auth/verify-captcha` 验证 token
5. 服务端调用 Cloudflare API 验证 token 真实性
6. 验证通过后才允许注册并发送邮件

## 优势

- **用户体验好**：大多数情况下无需用户交互
- **完全免费**：Cloudflare Turnstile 免费使用
- **隐私友好**：不追踪用户行为
- **高安全性**：有效防止机器人批量注册

## 故障排查

### 验证总是失败
- 检查 `TURNSTILE_SECRET_KEY` 是否正确配置
- 确认域名与 Cloudflare 后台配置一致
- 查看浏览器控制台是否有 CORS 错误

### Widget 不显示
- 检查 `NEXT_PUBLIC_TURNSTILE_SITE_KEY` 是否正确
- 确认网络可以访问 Cloudflare CDN
- 查看浏览器控制台错误信息
