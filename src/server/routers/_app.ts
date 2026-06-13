import { router } from "../trpc";

export const appRouter = router({
  // Routers will be added in future epics
});

export type AppRouter = typeof appRouter;
