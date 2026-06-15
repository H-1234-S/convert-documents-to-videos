/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";

import { createTRPCOptionsProxy, TRPCQueryOptions } from "@trpc/tanstack-react-query";
import { cache } from "react";
import { headers } from "next/headers";
import { appRouter } from "./routers";
import { createContext, createCallerFactory } from "./init";
import { makeQueryClient } from "./query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

/**
 * IMPORTANT: Create a stable getter for the query client that returns the
 * same client during the same request. React's `cache()` deduplicates calls
 * within a single render pass.
 *
 * @see https://trpc.io/docs/client/nextjs/app-router-setup#step-7-server-side-proxy
 */
export const getQueryClient = cache(makeQueryClient);

/**
 * Server-side tRPC proxy for React Server Components.
 *
 * Usage in a server component:
 * ```tsx
 * import { HydrateClient, prefetch, trpc } from "@/trpc/server";
 * prefetch(trpc.project.list.queryOptions({}));
 * ```
 */
export const trpc = createTRPCOptionsProxy({
  ctx: async () => createContext({ headers: await headers() }),
  router: appRouter,
  queryClient: getQueryClient,
});

/**
 * Direct server-side caller — for when you need data on the server without
 * going through TanStack Query's cache.
 *
 * Note: this is detached from the query client and does not store data in
 * the cache. Use `trpc.*.queryOptions()` + `prefetchQuery` / `fetchQuery`
 * when you need both server-side data AND client hydration.
 *
 * Usage:
 * ```tsx
 * import { caller } from "@/trpc/server";
 * const data = await caller.project.list({});
 * ```
 */
export const caller = createCallerFactory(appRouter)(async () =>
  createContext({ headers: await headers() }),
);

export { appRouter };


export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  );
}
 
export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T,
) {
  const queryClient = getQueryClient();
  if (queryOptions.queryKey[1]?.type === 'infinite') {
    void queryClient.prefetchInfiniteQuery(queryOptions as any);
  } else {
    void queryClient.prefetchQuery(queryOptions);
  }
}