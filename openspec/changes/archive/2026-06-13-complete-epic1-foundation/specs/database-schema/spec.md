## ADDED Requirements

### Requirement: Core business tables defined
The system SHALL define 8 core business tables in Prisma schema: Project, StoryboardVersion, Scene, Asset, GenerationJob, RenderJob, JobEvent, UsageRecord.

#### Scenario: All tables created
- **WHEN** Prisma migration is executed
- **THEN** all 8 business tables are created in PostgreSQL

#### Scenario: User relations established
- **WHEN** better-auth User table is extended
- **THEN** User has one-to-many relations to Project, Asset, GenerationJob, UsageRecord

### Requirement: Project table structure
The system SHALL define Project table with fields: id, userId, title, sourceText, status, audienceRole, audienceLevel, aspectRatio, targetDurationSec, voiceProvider, voiceId, currentStoryboardVersionId, finalVideoAssetId, thumbnailAssetId, errorCode, errorMessage, createdAt, updatedAt.

#### Scenario: Project creation
- **WHEN** a new project is created
- **THEN** all required fields are populated with correct types

#### Scenario: Status field validation
- **WHEN** project status is set
- **THEN** it MUST be one of: draft, queued, generating_storyboard, storyboard_ready, generating_audio, calculating_timeline, rendering, completed, failed, cancelled

### Requirement: Asset lifecycle status
The system SHALL add lifecycleStatus field to Asset table with values: active, temporary, orphaned, deleted.

#### Scenario: Active asset
- **WHEN** asset is successfully uploaded and referenced
- **THEN** lifecycleStatus is set to "active"

#### Scenario: Orphaned asset cleanup
- **WHEN** asset is uploaded but job fails and no reference exists
- **THEN** lifecycleStatus is set to "orphaned" for later cleanup

### Requirement: Database indexes defined
The system SHALL create indexes on: userId+createdAt, projectId+status, storyboardVersionId+order, assetKey, checksum.

#### Scenario: Project list query performance
- **WHEN** querying user's projects ordered by createdAt
- **THEN** userId_createdAt_idx is used for efficient lookup

#### Scenario: Asset deduplication
- **WHEN** checking if asset with same checksum exists
- **THEN** checksum_idx is used for fast lookup

### Requirement: Foreign key constraints
The system SHALL define foreign keys with appropriate CASCADE and SET NULL behaviors.

#### Scenario: User deletion cascades
- **WHEN** a User is deleted
- **THEN** all associated Projects, Assets, Jobs are CASCADE deleted

#### Scenario: Project deletion preserves orphan assets
- **WHEN** a Project is deleted
- **THEN** Asset.projectId is SET NULL and asset remains for potential cleanup
