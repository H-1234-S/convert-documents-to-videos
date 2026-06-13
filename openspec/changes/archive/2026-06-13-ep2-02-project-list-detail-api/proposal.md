## Why

Dashboard 和项目详情页需要从服务端获取用户的项目列表和项目详情，目前只有 `project.createAndGenerate` 一个 mutation 端点。实现 `project.list` 和 `project.getById` 两个查询端点，提供分页列表和含关联数据的完整详情，为后续 ep2-03（Dashboard 页面）和 ep2-04（项目详情页）的前端开发铺平道路。

## What Changes

- 新建数据访问层 `src/lib/db/repositories/project.repo.ts`，封装 Prisma select 和 cursor-based 分页逻辑
- 在 `project.service.ts` 追加 `listProjects()`、`getProjectById()` 两个业务函数，含权限校验（owner 或 admin）
- 在 `project.ts` router 追加 `project.list` 和 `project.getById` 两个 `protectedProcedure` query 端点
- 新增 `ProjectNotFoundError` 和 `ProjectAccessDeniedError` 错误类
- 新增 repo 层单元测试、追加 service 层和 router 层测试
- 采用 Zod `z.enum()` 校验 status 筛选参数，`.regex()` 校验 projectId 格式（CUID 非 UUID）

## Capabilities

### New Capabilities

- `project-list-query`：用户可按状态筛选、cursor 分页查询自己的项目列表，返回 items + nextCursor + total
- `project-detail-query`：用户可按 projectId 查询单个项目的完整详情（含最近 GenerationJob、当前 StoryboardVersion 及 Scene 列表），owner 或 admin 可访问

### Modified Capabilities

无。本 Change 仅追加新端点，不修改 `project.createAndGenerate` 的行为或契约。

## Impact

- 新建 `src/lib/db/repositories/project.repo.ts` 及 `__tests__/project.repo.test.ts`
- 修改 `src/server/services/project.service.ts`（追加函数和错误类）
- 修改 `src/server/routers/project.ts`（追加 query endpoints + Zod schemas）
- 修改 `src/server/services/__tests__/project.service.test.ts`（追加测试用例）
- 修改 `src/server/routers/__tests__/project.router.test.ts`（追加测试用例）
- 无需修改 `_app.ts`、`trpc.ts`、`context.ts`、prisma schema
