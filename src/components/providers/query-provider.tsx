"use client";

import { TRPCReactProvider } from "@/trpc/client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

/**
 * QueryProvider wraps the tRPC + TanStack Query provider tree.
 *
 * Delegates all tRPC wiring to TRPCReactProvider (from @trpc/tanstack-react-query)
 * and adds React Query DevTools in development mode.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <TRPCReactProvider>
      {children}
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
    </TRPCReactProvider>
  );
}
