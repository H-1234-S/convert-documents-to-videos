## ADDED Requirements

### Requirement: Video playback page shows project title

The system SHALL render a placeholder page at `/projects/[id]/play` that fetches the project by ID and displays its title.

#### Scenario: Play page shows project title

- **WHEN** an authenticated user navigates to `/projects/[id]/play` for an existing project
- **THEN** `project.getById.useQuery({ projectId: id })` fetches the project
- **AND** the project title is displayed on the page

#### Scenario: Play page shows coming soon message

- **WHEN** the play page renders
- **THEN** "视频播放功能即将推出" message is displayed
- **AND** no video player component is present

### Requirement: Play page is protected

The system SHALL require authentication for the video playback page via the `(protected)` route group layout.

#### Scenario: Unauthenticated user redirected

- **WHEN** an unauthenticated user navigates to `/projects/[id]/play`
- **THEN** the user is redirected to login (handled by the `(protected)` layout)

### Requirement: Play page shows project actions

The system SHALL provide delete and retry buttons on the play page for project management.

#### Scenario: Delete button deletes the project

- **WHEN** user clicks the delete button
- **THEN** `project.delete` mutation is called
- **AND** on success, user is redirected to `/` (home page)

#### Scenario: Retry button is shown for failed/cancelled projects

- **WHEN** the project status is `failed` or `cancelled`
- **THEN** a retry button is displayed
- **WHEN** user clicks retry
- **THEN** `project.retry` mutation is called
