## Purpose

tRPC API capability provides end-to-end type-safe API layer with server configuration, client setup, and Next.js route handlers.

## Requirements

### Requirement: tRPC server configured
The system SHALL configure tRPC server with context, router initialization, and type safety.

#### Scenario: tRPC context includes session
- **WHEN** tRPC procedure is called
- **THEN** context includes better-auth session with userId and user email

#### Scenario: Router exports type
- **WHEN** AppRouter type is exported from server
- **THEN** client can import and use it for end-to-end type safety

### Requirement: tRPC client configured
The system SHALL create tRPC React client with HTTP batch link and proper configuration.

#### Scenario: Client creation
- **WHEN** React app initializes
- **THEN** tRPC client is created with /api/trpc endpoint and batch link enabled

#### Scenario: Type inference works
- **WHEN** calling trpc.project.list.useQuery()
- **THEN** TypeScript infers return type from server definition

### Requirement: API route handler
The system SHALL create Next.js API route at /api/trpc/[trpc]/route.ts using fetchRequestHandler.

#### Scenario: GET request handled
- **WHEN** client sends GET request to /api/trpc endpoint
- **THEN** tRPC processes it and returns serialized response

#### Scenario: POST request handled
- **WHEN** client sends POST request with mutations
- **THEN** tRPC executes mutation and returns result

### Requirement: Server directory structure
The system SHALL organize server code in /src/server/ with trpc.ts, context.ts, and routers/_app.ts.

#### Scenario: Module imports
- **WHEN** importing from @/server/routers/_app
- **THEN** AppRouter type is available for client

#### Scenario: Context isolation
- **WHEN** context.ts is modified
- **THEN** changes apply to all procedures without touching trpc.ts

### Requirement: Public procedure defined
The system SHALL export publicProcedure for unauthenticated endpoints.

#### Scenario: Public procedure usage
- **WHEN** defining a public endpoint like health check
- **THEN** publicProcedure is used without auth requirement

#### Scenario: Protected procedure check
- **WHEN** protected procedure is called without session
- **THEN** returns UNAUTHORIZED error
