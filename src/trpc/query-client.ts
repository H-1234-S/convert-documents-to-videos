import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";

/**
 * Shared QueryClient factory.
 *
 * Three important defaults:
 * - staleTime 30s — prevents immediate client-side refetch after SSR hydration
 * - shouldDehydrateQuery — extends the default to also dehydrate *pending* queries
 *   so in-flight prefetches survive the server→client handoff
 *
 * @see https://trpc.io/docs/client/nextjs/app-router-setup#step-5-query-client-factory
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
}
