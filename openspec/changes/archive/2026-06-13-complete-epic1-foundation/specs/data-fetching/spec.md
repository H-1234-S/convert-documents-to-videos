## ADDED Requirements

### Requirement: TanStack Query client configured
The system SHALL create QueryClient with appropriate default options for staleTime and refetchOnWindowFocus.

#### Scenario: Query client initialization
- **WHEN** app starts
- **THEN** QueryClient is created with staleTime of 60 seconds and refetchOnWindowFocus disabled

#### Scenario: Cache behavior
- **WHEN** same query is called within staleTime
- **THEN** cached data is returned without refetch

### Requirement: Query provider wraps app
The system SHALL create QueryProvider component that wraps children with QueryClientProvider and tRPC provider.

#### Scenario: Provider setup
- **WHEN** app/layout.tsx renders
- **THEN** QueryProvider wraps all children providing query and tRPC context

#### Scenario: React Query DevTools available
- **WHEN** running in development mode
- **THEN** ReactQueryDevtools component is rendered for debugging

### Requirement: tRPC React Query integration
The system SHALL integrate tRPC client with TanStack Query using trpc.Provider.

#### Scenario: tRPC hooks available
- **WHEN** component calls trpc.project.list.useQuery()
- **THEN** returns TanStack Query result with data, isLoading, error states

#### Scenario: Mutation hooks work
- **WHEN** component calls trpc.project.create.useMutation()
- **THEN** returns mutation function with loading and error states

### Requirement: HTTP batch link configured
The system SHALL configure httpBatchLink for batching multiple requests into single HTTP call.

#### Scenario: Multiple queries batched
- **WHEN** component makes 3 separate useQuery calls in same render
- **THEN** tRPC batches them into single POST request

#### Scenario: Batch link URL
- **WHEN** tRPC client is initialized
- **THEN** httpBatchLink points to /api/trpc endpoint
