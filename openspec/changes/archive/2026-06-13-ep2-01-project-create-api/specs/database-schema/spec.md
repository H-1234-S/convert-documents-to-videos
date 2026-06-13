## MODIFIED Requirements

### Requirement: Project table structure
The system SHALL define Project table with fields: id, userId, title, sourceText, status, audienceRole, audienceLevel, aspectRatio, targetDurationSec, voiceProvider, voiceId, currentStoryboardVersionId, finalVideoAssetId, thumbnailAssetId, errorCode, errorMessage, createdAt, updatedAt. The status field SHALL default to `"queued"` for new records.

#### Scenario: Project creation
- **WHEN** a new project is created
- **THEN** all required fields are populated with correct types and status defaults to `"queued"`

#### Scenario: Status field validation
- **WHEN** project status is set
- **THEN** it MUST be one of: draft, queued, generating_storyboard, storyboard_ready, generating_audio, calculating_timeline, rendering, completed, failed, cancelled

### Requirement: Core business tables defined
The system SHALL define 8 core business tables in Prisma schema: Project, StoryboardVersion, Scene, Asset, GenerationJob, RenderJob, JobEvent, UsageRecord. GenerationJob SHALL include an optional unique `requestId` field for client-side idempotency.

#### Scenario: All tables created
- **WHEN** Prisma migration is executed
- **THEN** all 8 business tables are created in PostgreSQL with GenerationJob.requestId as nullable unique string

#### Scenario: User relations established
- **WHEN** better-auth User table is extended
- **THEN** User has one-to-many relations to Project, Asset, GenerationJob, UsageRecord
