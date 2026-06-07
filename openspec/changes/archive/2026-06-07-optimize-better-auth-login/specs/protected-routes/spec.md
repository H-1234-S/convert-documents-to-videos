## ADDED Requirements

### Requirement: 受保护的路由需要身份验证
系统 SHALL 在访问受保护路由前验证用户身份。

#### Scenario: 已登录用户访问受保护路由
- **WHEN** 已登录用户访问 /profile 页面
- **THEN** 系统允许访问并渲染页面内容

#### Scenario: 未登录用户访问受保护路由
- **WHEN** 未登录用户尝试访问 /profile 页面
- **THEN** 系统重定向到登录页面并保存原始 URL

#### Scenario: 登录后返回原始页面
- **WHEN** 用户从登录页面成功登录
- **THEN** 系统重定向到之前尝试访问的受保护页面

### Requirement: 中间件在服务端验证会话
系统 SHALL 使用 Next.js proxy 在服务端验证会话有效性。

#### Scenario: 会话令牌有效
- **WHEN** 请求包含有效的会话令牌
- **THEN** 中间件允许请求继续并将用户信息传递给页面

#### Scenario: 会话令牌无效或过期
- **WHEN** 请求的会话令牌已过期
- **THEN** 中间件清除会话并重定向到登录页面

#### Scenario: 公开路由跳过验证
- **WHEN** 用户访问登录、注册或首页等公开路由
- **THEN** 中间件跳过身份验证检查

### Requirement: 组件级别的权限检查
系统 SHALL 提供客户端组件用于条件渲染受保护内容。

#### Scenario: 使用 Protected 组件包裹内容
- **WHEN** 组件使用 Protected 包裹敏感内容
- **THEN** 仅在用户已登录时渲染内部内容

#### Scenario: 未登录时显示替代内容
- **WHEN** 未登录用户查看包含 Protected 组件的页面
- **THEN** 系统显示登录提示或占位符内容

### Requirement: API 路由验证请求身份
系统 SHALL 在 API 路由中验证请求的身份和权限。

#### Scenario: API 接收已认证请求
- **WHEN** 已登录用户调用 /api/user/profile
- **THEN** API 从会话中提取用户 ID 并返回数据

#### Scenario: API 拒绝未认证请求
- **WHEN** 未登录用户调用受保护的 API 端点
- **THEN** API 返回 401 Unauthorized 错误

#### Scenario: API 验证资源所有权
- **WHEN** 用户尝试修改他人的数据
- **THEN** API 返回 403 Forbidden 错误
