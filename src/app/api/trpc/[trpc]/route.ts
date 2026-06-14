import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/trpc/routers";
import { createContext } from "@/trpc/init";

/**
 * Next.js App Router tRPC API 处理器。
 *
 * 路由路径：/api/trpc/[trpc]
 * 使用 fetch adapter（而非 Pages Router adapter），因为 App Router
 * handler 基于 Web 标准的 Request/Response。
 *
 * @see https://trpc.io/docs/client/nextjs/app-router-setup#step-4-api-route-handler
 */
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext({ headers: req.headers }),
  });

export { handler as GET, handler as POST };
