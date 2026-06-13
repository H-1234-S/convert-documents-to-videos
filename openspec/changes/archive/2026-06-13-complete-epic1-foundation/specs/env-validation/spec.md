## ADDED Requirements

### Requirement: Environment variables schema defined
The system SHALL define Zod schema for all required and optional environment variables.

#### Scenario: Required variables validated
- **WHEN** app starts without DATABASE_URL
- **THEN** validation fails with clear error message

#### Scenario: Optional variables defaulted
- **WHEN** app starts without R2_BUCKET_NAME
- **THEN** validation succeeds and variable is undefined

### Requirement: Admin emails list validated
The system SHALL parse ADMIN_EMAILS as comma-separated list and validate each email format.

#### Scenario: Valid admin emails
- **WHEN** ADMIN_EMAILS is "admin@test.com,dev@test.com"
- **THEN** validation succeeds and returns array of 2 emails

#### Scenario: Invalid email format
- **WHEN** ADMIN_EMAILS contains "not-an-email"
- **THEN** validation fails with email format error

### Requirement: Environment variable types exported
The system SHALL export TypeScript type Env derived from Zod schema for type-safe access.

#### Scenario: Type inference
- **WHEN** accessing env.DATABASE_URL
- **THEN** TypeScript knows it's a string type

#### Scenario: Optional type handling
- **WHEN** accessing env.R2_BUCKET_NAME
- **THEN** TypeScript knows it's string | undefined

### Requirement: Development vs production validation
The system SHALL require different variables based on NODE_ENV.

#### Scenario: Development mode
- **WHEN** NODE_ENV is "development"
- **THEN** R2 and Inngest variables are optional

#### Scenario: Production mode
- **WHEN** NODE_ENV is "production"
- **THEN** R2_BUCKET_NAME and INNGEST_EVENT_KEY are required

### Requirement: Clear error messages
The system SHALL provide actionable error messages when validation fails.

#### Scenario: Missing required variable
- **WHEN** BETTER_AUTH_SECRET is missing
- **THEN** error message says "Missing required environment variable: BETTER_AUTH_SECRET"

#### Scenario: Invalid format
- **WHEN** DATABASE_URL is not a valid PostgreSQL URL
- **THEN** error message includes expected format example
