## ADDED Requirements

### Requirement: 系统启用 CSRF 保护
系统 SHALL 对所有状态变更请求（登录、注册、登出）进行 CSRF 令牌验证。

#### Scenario: 请求包含有效 CSRF 令牌
- **WHEN** 客户端提交登录请求并包含有效的 CSRF 令牌
- **THEN** 系统验证令牌并处理请求

#### Scenario: 请求缺少 CSRF 令牌
- **WHEN** 请求未包含 CSRF 令牌
- **THEN** 系统拒绝请求并返回 403 错误

#### Scenario: CSRF 令牌无效
- **WHEN** 请求包含过期或伪造的 CSRF 令牌
- **THEN** 系统拒绝请求并返回 403 错误

### Requirement: 系统实施速率限制
系统 SHALL 对认证相关接口实施速率限制以防止暴力破解。

#### Scenario: 正常频率的登录尝试
- **WHEN** 用户在1分钟内尝试登录3次
- **THEN** 系统正常处理所有请求

#### Scenario: 超过速率限制
- **WHEN** 同一 IP 在1分钟内尝试登录超过5次
- **THEN** 系统返回 429 错误并要求等待60秒

#### Scenario: 速率限制重置
- **WHEN** 用户等待冷却时间后再次尝试
- **THEN** 系统重置计数器并允许新的请求

### Requirement: 会话令牌使用安全配置
系统 SHALL 使用 httpOnly、secure 和 sameSite 标志保护会话 cookie。

#### Scenario: 生产环境的 cookie 设置
- **WHEN** 系统在生产环境中创建会话 cookie
- **THEN** cookie 包含 httpOnly、secure 和 sameSite=lax 标志

#### Scenario: JavaScript 无法访问会话令牌
- **WHEN** 客户端 JavaScript 尝试读取会话 cookie
- **THEN** 浏览器拒绝访问（因为 httpOnly）

### Requirement: 密码使用安全的哈希算法
系统 SHALL 使用 bcrypt 或 Argon2 算法存储密码哈希。

#### Scenario: 注册时哈希密码
- **WHEN** 用户注册新账号
- **THEN** 系统使用 bcrypt（cost factor >= 10）哈希密码后存储

#### Scenario: 验证密码
- **WHEN** 用户登录
- **THEN** 系统将输入密码与存储的哈希进行安全比对

### Requirement: 敏感操作记录审计日志
系统 SHALL 记录登录、登出、密码重置等关键操作的审计日志。

#### Scenario: 记录登录事件
- **WHEN** 用户成功登录
- **THEN** 系统记录用户 ID、IP 地址、User-Agent 和时间戳

#### Scenario: 记录失败的登录尝试
- **WHEN** 登录失败
- **THEN** 系统记录尝试的邮箱、IP 地址和失败原因
