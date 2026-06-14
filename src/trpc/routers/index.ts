import { router, createCallerFactory } from "../init";
import { projectRouter } from "./project";

/**
 * AppRouter - tRPC 主路由
 *
 * 按业务域组织子路由：
 * - project: 项目管理相关 API
 */
export const appRouter = router({
  project: projectRouter,
});

/**
 * AppRouter 类型导出
 *
 * ⚠️ 客户端导入时必须使用 `import type { AppRouter }`，
 * 而非 `import { AppRouter }`，以避免将服务端代码打包到客户端。
 */
export type AppRouter = typeof appRouter;

/**
 * 创建服务端调用器工厂
 * 用于：
 * - 服务端到服务端的 tRPC 调用
 * - 集成测试中模拟 API 调用
 */
export const createCaller = createCallerFactory(appRouter);
