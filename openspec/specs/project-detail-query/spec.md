# project-detail-query

## Purpose

提供 `project.getById` tRPC query 端点，让已认证用户按 projectId 查询单个项目的完整详情，含权限校验。

## Requirements

### Requirement: Owner can view own project detail

系统 SHALL 提供 `project.getById` 端点，让项目 owner 查询自己的项目完整详情。

#### Scenario: Owner queries project with full detail

- **WHEN** 用户 A 拥有项目 X（含 StoryboardVersion + 3 个 Scene）且调用 `project.getById({ projectId: X })`
- **THEN** 返回完整详情，含 `id, title, sourceText, status, audienceRole, audienceLevel, aspectRatio, targetDurationSec, voiceProvider, voiceId, errorCode, errorMessage, createdAt, updatedAt`
- **AND** 含 `currentJob`（最近一次 GenerationJob 的 id, jobType, status, aiProvider, aiModel, errorCode, errorMessage, startedAt, completedAt, createdAt）
- **AND** 含 `currentStoryboardVersion`（id, versionNumber, totalDurationSec, scenes[3]）
- **AND** 响应中不包含 `userId`

#### Scenario: Project without storyboard returns null for currentStoryboardVersion

- **WHEN** 用户创建了项目但 Storyboard 尚未生成
- **THEN** `currentStoryboardVersion = null`，`currentJob` 存在（storyboard job）

### Requirement: Admin can view any user's project

系统 SHALL 允许 admin 用户通过 `project.getById` 查看任意用户的项目详情。

#### Scenario: Admin cross-user access succeeds

- **WHEN** 用户 B 拥有项目 Y，admin 用户调用 `project.getById({ projectId: Y })`
- **THEN** 返回项目 Y 的完整详情

### Requirement: Non-owner access is denied

系统 SHALL 拒绝非 owner 且非 admin 的用户查看他人项目。

#### Scenario: Non-owner non-admin receives FORBIDDEN

- **WHEN** 用户 A 拥有项目 X，用户 B（非 admin）调用 `project.getById({ projectId: X })`
- **THEN** 返回 `FORBIDDEN`，message 含 `[PROJECT_ACCESS_DENIED]`

### Requirement: Non-existent project returns NOT_FOUND

系统 SHALL 对不存在的 projectId 返回 NOT_FOUND 错误。

#### Scenario: Query with non-existent projectId

- **WHEN** 调用 `project.getById({ projectId: "nonexistent-id" })`
- **THEN** 返回 `NOT_FOUND`，message 含 `[PROJECT_NOT_FOUND]`

### Requirement: Get project by ID requires authentication

系统 SHALL 要求 `project.getById` 端点必须携带有效的 authentication session。

#### Scenario: Unauthenticated request returns UNAUTHORIZED

- **WHEN** 未认证用户调用 `project.getById({ projectId: "any-id" })`
- **THEN** 返回 `UNAUTHORIZED`，message 为 `Not authenticated`

### Requirement: Invalid projectId format returns BAD_REQUEST

系统 SHALL 对格式无效的 projectId 返回 BAD_REQUEST。

#### Scenario: Empty projectId

- **WHEN** 调用 `project.getById({ projectId: "" })`
- **THEN** 返回 `BAD_REQUEST`（Zod `.min(1)` 校验拦截）
