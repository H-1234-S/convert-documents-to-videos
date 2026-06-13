## ADDED Requirements

### Requirement: User can list own projects with cursor pagination

系统 SHALL 提供 `project.list` 端点，让已认证用户查询自己的项目列表，支持 cursor-based 分页和按 status 筛选。

#### Scenario: Normal query returns all user projects

- **WHEN** 用户 A 有 3 个项目（2 个 completed，1 个 failed）且调用 `project.list` 不传筛选参数
- **THEN** 返回 `items.length = 3`，按 `createdAt` 降序排列
- **AND** 每项含 `id, title, status, aspectRatio, targetDurationSec, createdAt, updatedAt, currentJob`
- **AND** `total = 3`，`nextCursor` 为第 3 项的 id（如 pageSize > 3 则 nextCursor=null）

#### Scenario: Status filter returns matching projects

- **WHEN** 用户 A 有 3 个项目（2 completed，1 failed）且调用 `project.list({ status: "failed" })`
- **THEN** 返回 `items.length = 1`，`total = 1`，该项 `status = "failed"`

#### Scenario: Cursor pagination across pages

- **WHEN** 用户有 25 个项目，调用 `project.list({ pageSize: 10 })`
- **THEN** 首页 `items.length = 10`，`nextCursor` 为第 10 项的 id
- **AND** 用 `nextCursor` 作为 `cursor` 调用第二页返回 `items.length = 10`，`nextCursor` 为第 20 项的 id
- **AND** 第三页返回 `items.length = 5`，`nextCursor = null`

#### Scenario: Empty list for user with no projects

- **WHEN** 用户 B 没有任何项目且调用 `project.list`
- **THEN** 返回 `items = []`，`nextCursor = null`，`total = 0`

#### Scenario: Data isolation between users

- **WHEN** 用户 A 有 2 个项目，用户 B 有 1 个项目，用户 A 调用 `project.list`
- **THEN** 返回 2 项，不包含用户 B 的项目

#### Scenario: PageSize exceeds limit returns validation error

- **WHEN** 请求 `pageSize = 100`（超过上限 50）
- **THEN** tRPC 返回 `BAD_REQUEST`（Zod max(50) 校验拦截）

### Requirement: List projects requires authentication

系统 SHALL 要求 `project.list` 端点必须携带有效的 authentication session。

#### Scenario: Unauthenticated request returns UNAUTHORIZED

- **WHEN** 未认证用户调用 `project.list`
- **THEN** 返回 `UNAUTHORIZED`，message 为 `Not authenticated`
