## 1. Baseline Verification

- [x] 1.1 Run `npm test` to confirm 22 existing ep2-01 tests pass
- [x] 1.2 Fix any failing tests before proceeding

## 2. Data Access Layer — project.repo.ts

- [x] 2.1 Create `src/lib/db/repositories/` and `__tests__/` directories
- [x] 2.2 Implement `LIST_SELECT` and `DETAIL_SELECT` constants with `satisfies Prisma.ProjectSelect`
- [x] 2.3 Define output types: `ListProjectsOptions`, `ProjectListItem`, `ProjectListResult`, `ProjectDetailResult`, `ProjectDetailJob`, `ProjectDetailScene`, `ProjectDetailStoryboard`
- [x] 2.4 Implement `findProjectsPaginated(userId, options)` — cursor-based pagination with parallel `Promise.all([findMany, count])`
- [x] 2.5 Implement `findProjectDetailById(projectId)` — `findUnique` with DETAIL_SELECT
- [x] 2.6 Implement `toListItem()` and `toDetailResult()` transformation functions
- [x] 2.7 Write `project.repo.test.ts` — mock Prisma, test pagination, status filter, boundary cases, detail query

## 3. Business Layer — project.service.ts

- [x] 3.1 Add `ProjectNotFoundError` error class (`extends Error` + `code = "PROJECT_NOT_FOUND"`)
- [x] 3.2 Add `ProjectAccessDeniedError` error class (`extends Error` + `code = "PROJECT_ACCESS_DENIED"`)
- [x] 3.3 Implement `listProjects(userId, options)` — delegates to `findProjectsPaginated`
- [x] 3.4 Implement `getProjectById(projectId, userId, isAdmin)` — query → null check → permission check → return detail
- [x] 3.5 Write service tests — list delegation, owner access, admin access, non-owner denied, not found

## 4. API Layer — project.router.ts

- [x] 4.1 Add `VALID_PROJECT_STATUSES` constant (synced with schema.prisma status comment)
- [x] 4.2 Add `listProjectsInputSchema` — cursor, pageSize (1–50, default 12), status (enum)
- [x] 4.3 Add `getProjectByIdInputSchema` — projectId with regex validation (CUID not UUID)
- [x] 4.4 Implement `project.list` query — `protectedProcedure` → `listProjects` → error mapping
- [x] 4.5 Implement `project.getById` query — `protectedProcedure` → `getProjectById` → strip `userId` → error mapping
- [x] 4.6 Write router integration tests — auth, validation, success, error mapping, data isolation

## 5. Integration Verification

- [x] 5.1 Run `npm test` — all tests pass (existing + new)
- [x] 5.2 Run `npm run lint` — no new errors
- [x] 5.3 Run `npm run dev` — tRPC panel shows `project.list` and `project.getById`
- [x] 5.4 Manual test: create project via `createAndGenerate`, verify visible in `list`, queryable via `getById`
- [x] 5.5 Manual test: different user cannot see other user's projects in `list`, gets FORBIDDEN on `getById`
