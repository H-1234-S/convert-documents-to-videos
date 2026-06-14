# Project Actions Specification

## Purpose

Provides mutation endpoints for deleting and retrying project generation with proper authorization.

## Requirements

### Requirement: Authenticated user can soft-delete their project

The system SHALL provide `project.delete` mutation that sets the project status to `deleted` after verifying the caller is the project owner or an admin.

#### Scenario: Owner deletes their project successfully

- **WHEN** a project owner calls `project.delete({ projectId })`
- **THEN** the project status is updated to `deleted`
- **AND** returns `{ success: true }`

#### Scenario: Non-owner cannot delete project

- **WHEN** a user who is not the project owner calls `project.delete({ projectId })`
- **THEN** the system returns TRPCError with code FORBIDDEN

#### Scenario: Non-existent project returns not found

- **WHEN** a user calls `project.delete` with a non-existent `projectId`
- **THEN** the system returns TRPCError with code NOT_FOUND

#### Scenario: Unauthenticated user is rejected

- **WHEN** an unauthenticated request calls `project.delete`
- **THEN** the system returns TRPCError with code UNAUTHORIZED

### Requirement: Authenticated user can retry failed generation

The system SHALL provide `project.retry` mutation that resets the project status to `queued`, creates a new GenerationJob, and sends an Inngest event after verifying the caller is the project owner or an admin.

#### Scenario: Owner retries a failed project successfully

- **WHEN** a project owner calls `project.retry({ projectId })`
- **THEN** the project status is updated to `queued`
- **AND** a new GenerationJob is created with `jobType="storyboard"` and `status="pending"`
- **AND** a `video/generate.requested` Inngest event is sent with `{ projectId, userId, jobId }`
- **AND** returns `{ jobId: string }`

#### Scenario: Non-owner cannot retry project

- **WHEN** a user who is not the project owner calls `project.retry({ projectId })`
- **THEN** the system returns TRPCError with code FORBIDDEN

#### Scenario: Non-existent project returns not found

- **WHEN** a user calls `project.retry` with a non-existent `projectId`
- **THEN** the system returns TRPCError with code NOT_FOUND

#### Scenario: Unauthenticated user is rejected

- **WHEN** an unauthenticated request calls `project.retry`
- **THEN** the system returns TRPCError with code UNAUTHORIZED

### Requirement: Mutation signatures maintain backward compatibility with ep2-05

The system SHALL use tRPC mutation signatures (`project.delete` input: `{ projectId: string }`, output: `{ success: true }`; `project.retry` input: `{ projectId: string }`, output: `{ jobId: string }`) that ep2-05 guarantees to remain backward-compatible when it enhances internal logic.

#### Scenario: ep2-05 does not change tRPC input/output types

- **WHEN** ep2-05 is implemented (enhancing delete with cascade and retry with resume)
- **THEN** `project.delete` input/output types remain `{ projectId: string }` → `{ success: true }`
- **AND** `project.retry` input/output types remain `{ projectId: string }` → `{ jobId: string }`
