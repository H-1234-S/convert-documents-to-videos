import { router, t } from "../trpc";
import { projectRouter } from "./project";

export const appRouter = router({
  project: projectRouter,
});

export type AppRouter = typeof appRouter;

/** 创建服务端调用器（用于测试和 server-side 调用） */
export const createCaller = t.createCallerFactory(appRouter);
