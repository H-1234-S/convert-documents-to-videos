## ADDED Requirements

### Requirement: Prisma client singleton
The system SHALL export prisma client singleton from @/lib/db/client.ts to prevent multiple instances.

#### Scenario: Development hot reload
- **WHEN** Next.js hot reloads in development
- **THEN** same prisma instance is reused via globalThis

#### Scenario: Production mode
- **WHEN** running in production
- **THEN** single prisma instance is created

### Requirement: Common query helpers
The system SHALL provide helper functions for common Prisma query patterns like findByUserId, findByProjectId.

#### Scenario: Find user projects
- **WHEN** findProjectsByUserId is called
- **THEN** returns all projects for user ordered by createdAt desc

#### Scenario: Find with pagination
- **WHEN** findProjects is called with cursor and limit
- **THEN** returns paginated results with nextCursor

### Requirement: Transaction wrapper
The system SHALL provide executeTransaction wrapper for Prisma interactive transactions.

#### Scenario: Successful transaction
- **WHEN** executeTransaction runs multiple operations
- **THEN** all operations commit together

#### Scenario: Transaction rollback
- **WHEN** one operation in transaction fails
- **THEN** all operations are rolled back

### Requirement: Error handling utilities
The system SHALL provide isPrismaError and mapPrismaError for consistent error handling.

#### Scenario: Unique constraint violation
- **WHEN** Prisma throws P2002 error
- **THEN** mapPrismaError returns user-friendly "already exists" message

#### Scenario: Foreign key violation
- **WHEN** Prisma throws P2003 error
- **THEN** mapPrismaError returns "related record not found" message

### Requirement: Type utilities exported
The system SHALL export TypeScript utility types like PrismaSelect, PrismaInclude for type-safe queries.

#### Scenario: Type-safe select
- **WHEN** using PrismaSelect<Project>
- **THEN** TypeScript validates selected fields exist on Project model

#### Scenario: Type-safe include
- **WHEN** using PrismaInclude<Project>
- **THEN** TypeScript validates included relations exist
