## ADDED Requirements

### Requirement: Inngest client singleton
The system SHALL export Inngest client instance configured with app id "Volcano".

#### Scenario: Client initialization
- **WHEN** inngest client is imported from @/inngest/client
- **THEN** returns singleton Inngest instance with id "Volcano"

#### Scenario: Client reuse
- **WHEN** client is imported in multiple files
- **THEN** same instance is returned (singleton pattern)

### Requirement: API route handler configured
The system SHALL create serve handler in /api/inngest/route.ts that handles Inngest webhook requests.

#### Scenario: Health check
- **WHEN** GET request to /api/inngest
- **THEN** returns 200 with Inngest health check response

#### Scenario: Event processing
- **WHEN** Inngest sends POST request with event
- **THEN** handler processes event and returns 200

### Requirement: Functions array exported
The system SHALL export functions array from server that can be registered with serve handler.

#### Scenario: Empty functions on Epic 1
- **WHEN** serve handler is configured
- **THEN** functions array is empty but structure is ready

#### Scenario: Future function registration
- **WHEN** new Inngest function is added to functions array
- **THEN** serve handler automatically includes it

### Requirement: Environment variables for Inngest
The system SHALL use INNGEST_EVENT_KEY and INNGEST_SIGNING_KEY for authentication.

#### Scenario: Development mode
- **WHEN** INNGEST_DEV is true
- **THEN** signing key validation is skipped

#### Scenario: Production mode
- **WHEN** INNGEST_DEV is false or not set
- **THEN** INNGEST_SIGNING_KEY is required for request validation

### Requirement: Functions directory structure
The system SHALL create /src/inngest/functions/ directory for future function definitions.

#### Scenario: Directory exists
- **WHEN** Epic 1 is complete
- **THEN** /src/inngest/functions/ directory exists

#### Scenario: Index file exports
- **WHEN** functions are added
- **THEN** /src/inngest/functions/index.ts exports them for registration
