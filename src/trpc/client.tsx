"use client";

import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState } from "react";
import { makeQueryClient } from "./query-client";
import type { AppRouter } from "./routers";

// ---- tRPC context (hooks + provider wrapper) ----

/**
 * `createTRPCContext<AppRouter>()` replaces the old `createTRPCReact()` from
 * `@trpc/react-query`. It returns:
 * - `TRPCProvider` — inner provider that wires tRPC client + QueryClient together
 * - `useTRPC`       — typed proxy with `.queryOptions()` / `.mutationOptions()` / `.queryFilter()`
 *
 * @see https://trpc.io/docs/client/nextjs/app-router-setup#step-6-client-side-provider--hooks
 */
export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

// ---- QueryClient singleton ----

/**
 * Module-level singleton ensures the same QueryClient survives React Suspense
 * re-renders during the initial render — "this is very important, so we don't
 * re-make a new client if React suspends during the initial render."
 */
let browserQueryClient: QueryClient;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always create a fresh client (per-request).
    return makeQueryClient();
  }
  // Client: reuse the singleton.
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

// ---- URL helper ----

function getUrl() {
  const base = (() => {
    // Browser: relative URL is sufficient.
    if (typeof window !== "undefined") return "";
    // Vercel deployments: derive from environment.
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    // Local development.
    return "http://localhost:3000";
  })();
  return `${base}/api/trpc`;
}

// ---- Provider component ----

/**
 * Unified tRPC + TanStack Query provider.
 *
 * Mount once in the root layout to enable tRPC in all client components:
 * ```tsx
 * <TRPCReactProvider>{children}</TRPCReactProvider>
 * ```
 *
 * @see https://trpc.io/docs/client/nextjs/app-router-setup#step-6-client-side-provider--hooks
 */
export function TRPCReactProvider(
  props: Readonly<{ children: React.ReactNode }>,
) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: getUrl(),
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
