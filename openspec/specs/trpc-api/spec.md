## Purpose

tRPC API capability provides end-to-end type-safe API layer with server configuration, client setup, and Next.js App Router route handlers.

**Follows the official tRPC + Next.js App Router setup guide:**
https://trpc.io/docs/client/nextjs/app-router-setup

## Requirements

### Requirement: tRPC server configured
The system SHALL configure tRPC server with context, router initialization, and type safety.

#### Scenario: tRPC context from headers
- **WHEN** tRPC procedure is called
- **THEN** context is created from `{ headers: Headers }` (not the full Request) for reuse across API route, RSC proxy, and tests

#### Scenario: Context includes session
- **WHEN** tRPC procedure is called
- **THEN** context includes better-auth session with userId and user email

#### Scenario: Router exports type
- **WHEN** AppRouter type is exported from `@/trpc/routers`
- **THEN** client and server proxy share end-to-end type safety via `createTRPCContext<AppRouter>()`

### Requirement: tRPC client configured
The system SHALL create tRPC client with `@trpc/tanstack-react-query` using `createTRPCContext` pattern, following the official Next.js App Router setup.

#### Scenario: Client creation
- **WHEN** React app initializes
- **THEN** tRPC client is created with `/api/trpc` endpoint and `httpBatchLink` enabled
- **AND** URL is dynamically resolved via `getUrl()` (empty in browser, `VERCEL_URL` on Vercel, `localhost:3000` locally)

#### Scenario: QueryClient singleton
- **WHEN** `TRPCReactProvider` mounts
- **THEN** module-level `browserQueryClient` singleton ensures the same `QueryClient` survives React Suspense re-renders

#### Scenario: Type inference works
- **WHEN** calling `useTRPC().project.list.queryOptions({})` with `useQuery()`
- **THEN** TypeScript infers return type from server definition

#### Scenario: Mutation works
- **WHEN** calling `useMutation(useTRPC().project.createAndGenerate.mutationOptions({}))`
- **THEN** TypeScript infers input/output types from server definition

#### Scenario: Cache invalidation
- **WHEN** mutation succeeds
- **THEN** `queryClient.invalidateQueries(useTRPC().project.list.queryFilter())` invalidates related queries

### Requirement: API route handler
The system SHALL create Next.js API route at `/api/trpc/[trpc]/route.ts` using fetch adapter (not Pages Router adapter).

#### Scenario: GET request handled
- **WHEN** client sends GET request to `/api/trpc` endpoint
- **THEN** tRPC processes it and returns serialized response

#### Scenario: POST request handled
- **WHEN** client sends POST request with mutations
- **THEN** tRPC executes mutation and returns result

#### Scenario: Context from request headers
- **WHEN** route handler creates context
- **THEN** it passes `{ headers: req.headers }` (not the full `req` object)

### Requirement: Server directory structure
The system SHALL organize tRPC code in `/src/trpc/` following the official Next.js App Router structure.

#### Scenario: Module imports
- **WHEN** importing from `@/trpc/routers`
- **THEN** AppRouter type is available for client

#### Scenario: init.ts — context and procedures
- **WHEN** init.ts is modified
- **THEN** context creation and procedure definitions (public, protected, admin) are in one file

#### Scenario: query-client.ts — SSR-friendly factory
- **WHEN** `makeQueryClient()` creates a QueryClient
- **THEN** `shouldDehydrateQuery` includes pending queries for server-client hydration
- **AND** `staleTime` is set to 30s to prevent immediate client-side refetch after SSR

#### Scenario: client.tsx — provider and hooks
- **WHEN** `TRPCReactProvider` is mounted in root layout
- **THEN** it provides tRPC client + QueryClient via `TRPCProvider` + `QueryClientProvider`
- **AND** `useTRPC()` hook returns a typed proxy with `.queryOptions()` / `.mutationOptions()` / `.queryFilter()`
- **AND** module-level `browserQueryClient` singleton persists across Suspense boundaries

#### Scenario: server.tsx — RSC proxy
- **WHEN** `server.tsx` uses `createTRPCOptionsProxy`
- **THEN** `queryClient` parameter receives a cached getter function (`cache(makeQueryClient)`) — not a direct instance
- **AND** server components can prefetch queries via `trpc.*.queryOptions()`
- **AND** a direct `caller` is exported for pure server-side calls (detached from QueryClient cache)

### Requirement: Public procedure defined
The system SHALL export publicProcedure for unauthenticated endpoints.

#### Scenario: Public procedure usage
- **WHEN** defining a public endpoint like health check
- **THEN** publicProcedure is used without auth requirement

#### Scenario: Protected procedure check
- **WHEN** protected procedure is called without session
- **THEN** returns UNAUTHORIZED error
