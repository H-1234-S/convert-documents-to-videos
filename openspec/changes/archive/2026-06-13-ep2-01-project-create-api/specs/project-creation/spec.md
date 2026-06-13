## ADDED Requirements

### Requirement: User can submit source text to create a video generation project
The system SHALL accept user-submitted source text (1-5000 characters) with optional configuration parameters and create a Project with initial status `queued` and a corresponding `storyboard` GenerationJob with status `pending`.

#### Scenario: Successful project creation with all optional fields
- **WHEN** an authenticated user calls `project.createAndGenerate` with `sourceText="Hello World"`, `aspectRatio="16:9"`, `audienceRole="student"`, `audienceLevel="beginner"`, `targetDurationSec=60`, `voiceProvider="azure"`, `voiceId="zh-CN-XiaoxiaoNeural"`, and a valid UUID `requestId`
- **THEN** the system creates a Project record with status `queued`, title from first 50 characters of sourceText, all optional fields preserved, and a GenerationJob with `jobType="storyboard"`, `status="pending"`, `requestId` set to the input UUID
- **AND** returns `{ projectId: string, jobId: string }`

#### Scenario: Default aspect ratio applied
- **WHEN** an authenticated user calls `project.createAndGenerate` without specifying `aspectRatio`
- **THEN** the system defaults `aspectRatio` to `"16:9"`

#### Scenario: Title truncation for long source text
- **WHEN** the `sourceText` exceeds 50 characters
- **THEN** the generated title is the first 50 characters followed by "..."

### Requirement: Input validation rejects invalid parameters
The system SHALL validate all input parameters through Zod schema and return BAD_REQUEST for invalid values.

#### Scenario: Empty source text rejected
- **WHEN** an authenticated user calls `project.createAndGenerate` with `sourceText=""`
- **THEN** the system returns TRPCError with code BAD_REQUEST

#### Scenario: Overlong source text rejected
- **WHEN** an authenticated user calls `project.createAndGenerate` with 5001-character `sourceText`
- **THEN** the system returns TRPCError with code BAD_REQUEST

#### Scenario: Invalid aspect ratio rejected
- **WHEN** an authenticated user calls `project.createAndGenerate` with `aspectRatio="4:3"` (not in enum)
- **THEN** the system returns TRPCError with code BAD_REQUEST

#### Scenario: Invalid requestId format rejected
- **WHEN** an authenticated user calls `project.createAndGenerate` with `requestId="not-a-uuid"`
- **THEN** the system returns TRPCError with code BAD_REQUEST

### Requirement: Daily quota limits free users to 1 project per day
The system SHALL enforce a daily limit of 1 generation project per free user, counting from `GenerationJob` records with `jobType="storyboard"` and `status != "cancelled"` created today (00:00:00 to 23:59:59.999).

#### Scenario: First project of the day succeeds
- **WHEN** a non-admin user with 0 projects today calls `project.createAndGenerate`
- **THEN** the project is created successfully

#### Scenario: Second project of the day rejected
- **WHEN** a non-admin user who already created 1 project today calls `project.createAndGenerate`
- **THEN** the system returns TRPCError with code TOO_MANY_REQUESTS and message starting with `[QUOTA_EXCEEDED]` including `resetsAt` timestamp

#### Scenario: Cancelled projects excluded from quota count
- **WHEN** a user created 1 project today but it was cancelled
- **THEN** the user can still create a new project (quota check excludes cancelled GenerationJobs)

### Requirement: Admin users bypass quota limits
The system SHALL skip daily quota checks for admin users (determined by `ctx.isAdmin`).

#### Scenario: Admin creates multiple projects in one day
- **WHEN** an admin user who already created 1 project today calls `project.createAndGenerate` again
- **THEN** the project is created successfully without quota error

### Requirement: Concurrent project limit prevents overlapping active projects
The system SHALL allow at most 1 active project per user, where "active" means status is in: `queued`, `generating_storyboard`, `storyboard_ready`, `generating_audio`, `calculating_timeline`, `rendering`.

#### Scenario: Second project blocked while first is active
- **WHEN** a user with an active project (status `generating_storyboard`) calls `project.createAndGenerate` again
- **THEN** the system returns TRPCError with code TOO_MANY_REQUESTS and message starting with `[CONCURRENT_LIMIT]`

#### Scenario: Project allowed after previous completes
- **WHEN** a user's only previous project has status `completed`
- **THEN** a new `project.createAndGenerate` call succeeds

### Requirement: Idempotency via requestId prevents duplicate project creation
The system SHALL guarantee idempotency through `GenerationJob.requestId` unique constraint, returning the existing project's ID on duplicate requests instead of creating a new project.

#### Scenario: Duplicate requestId returns existing project
- **WHEN** an authenticated user calls `project.createAndGenerate` with a `requestId` that was already used in a successful creation
- **THEN** the system returns TRPCError with code CONFLICT and message starting with `[DUPLICATE_REQUEST]` including `existingProjectId`
- **AND** no new Project or GenerationJob is created (transaction rolled back)

### Requirement: PostgreSQL advisory lock serializes concurrent requests from the same user
The system SHALL use `pg_advisory_xact_lock(userId_hash)` within the Prisma transaction to serialize concurrent requests from the same user, preventing TOCTOU race conditions in quota and concurrency checks.

#### Scenario: Two simultaneous requests serialized
- **WHEN** two requests from the same user arrive simultaneously
- **THEN** the first request acquires the advisory lock, completes all checks and creation, then the second request acquires the lock and fails with concurrent limit

#### Scenario: Different users not blocked by each other
- **WHEN** user A and user B call `project.createAndGenerate` simultaneously
- **THEN** both requests can proceed in parallel (different lock keys)

### Requirement: Inngest event sent on successful project creation
The system SHALL send a `video/generate.requested` Inngest event with `{ projectId, userId, jobId }` after the transaction commits successfully.

#### Scenario: Event sent after transaction commit
- **WHEN** a project is created successfully
- **THEN** a `video/generate.requested` event is sent to Inngest with correct projectId, userId, and jobId

#### Scenario: Inngest send failure does not block API response
- **WHEN** the transaction commits successfully but Inngest send fails
- **THEN** the API still returns 200 with projectId and jobId, the Project remains in `queued` status, and an error is logged to the console

### Requirement: Unauthenticated users are rejected
The system SHALL reject unauthenticated requests through the `protectedProcedure` middleware before reaching business logic.

#### Scenario: Request without session cookie
- **WHEN** a request without a valid better-auth session cookie calls `project.createAndGenerate`
- **THEN** the system returns TRPCError with code UNAUTHORIZED
