## ADDED Requirements

### Requirement: Event type constants and send helpers exported
The system SHALL export event name constants (`EVENTS`) and typed event payload interfaces from `src/inngest/client.ts`, along with a `sendGenerateRequested()` helper function that sends `video/generate.requested` events.

#### Scenario: Event constant exports
- **WHEN** importing from `@/inngest/client`
- **THEN** `EVENTS.VIDEO_GENERATE_REQUESTED` equals `"video/generate.requested"`

#### Scenario: Typed send helper
- **WHEN** calling `sendGenerateRequested({ projectId, userId, jobId })`
- **THEN** the function calls `inngest.send()` with the correct event name and data payload

#### Scenario: Client singleton preserved
- **WHEN** `sendGenerateRequested()` is used alongside existing `inngest` client
- **THEN** both share the same singleton Inngest instance
