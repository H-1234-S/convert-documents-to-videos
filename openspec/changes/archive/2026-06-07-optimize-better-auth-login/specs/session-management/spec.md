## ADDED Requirements

### Requirement: 客户端自动维护会话状态
系统 SHALL 在客户端自动获取和维护用户会话状态。

#### Scenario: 页面加载时获取会话
- **WHEN** 应用首次加载或页面刷新
- **THEN** 系统自动从服务端获取当前会话状态

#### Scenario: 会话状态在组件间共享
- **WHEN** 多个组件需要访问用户信息
- **THEN** 所有组件通过统一的 hook 获取相同的会话数据

#### Scenario: 未登录状态
- **WHEN** 用户未登录时访问页面
- **THEN** 会话状态为 null 且不触发错误

### Requirement: 会话令牌自动刷新
系统 SHALL 在会话令牌即将过期时自动刷新。

#### Scenario: 令牌接近过期时刷新
- **WHEN** 会话令牌在5分钟内过期且用户仍在活动
- **THEN** 系统自动向服务端请求刷新令牌

#### Scenario: 刷新失败后登出
- **WHEN** 令牌刷新请求失败
- **THEN** 系统清除本地会话并重定向到登录页面

### Requirement: 客户端提供会话管理 hooks
系统 SHALL 提供 React hooks 用于访问会话状态和用户信息。

#### Scenario: 使用 useSession 获取用户信息
- **WHEN** 组件调用 useSession hook
- **THEN** hook 返回当前用户信息和会话状态（loading/authenticated/unauthenticated）

#### Scenario: 监听会话状态变化
- **WHEN** 用户登录或登出
- **THEN** 所有使用 useSession 的组件自动更新显示

### Requirement: 会话持久化到本地存储
系统 SHALL 将会话令牌安全存储到浏览器，以支持跨标签页和页面刷新后保持登录。

#### Scenario: 登录后持久化会话
- **WHEN** 用户成功登录
- **THEN** 系统将会话令牌存储到 httpOnly cookie

#### Scenario: 跨标签页共享会话
- **WHEN** 用户在一个标签页登录
- **THEN** 其他已打开的标签页自动识别登录状态

#### Scenario: 关闭浏览器后恢复会话
- **WHEN** 用户关闭浏览器后重新打开应用
- **THEN** 如果会话未过期，用户保持登录状态
