# Project History UI Specification

## Purpose

Provides a minimalist project history list with status-based styling, polling updates, and contextual actions.

## Requirements

### Requirement: History tab displays projects in minimalist list layout

The system SHALL display user's non-deleted projects from `project.list` in a minimalist single-column list layout with status-based grayscale color differentiation, hover-revealed action bar, and fine border separators.

#### Scenario: Completed projects show black text with status label

- **WHEN** user has completed projects
- **THEN** each completed project renders as a list item with:
  - Title in black text (`#171717`)
  - Status label "已完成"
  - Duration and creation date in muted text
  - Hover reveals action bar with play and delete buttons

#### Scenario: In-progress projects show medium gray text with animated label

- **WHEN** user has projects with status `queued`, `generating_*`, `calculating_*`, or `rendering`
- **THEN** the list item uses medium gray text (`#737373`)
- **AND** a "生成中…" label is displayed below the title
- **AND** hover reveals action bar

#### Scenario: Storyboard-ready projects show medium-dark gray

- **WHEN** user has projects with status `storyboard_ready`
- **THEN** the list item uses medium-dark gray text (`#525252`)
- **AND** a "分镜就绪" label is displayed

#### Scenario: Failed projects show dark gray with retry option

- **WHEN** user has projects with status `failed`
- **THEN** the list item uses dark gray text (`#404040`)
- **AND** a "生成失败" label is displayed
- **AND** hover reveals action bar with play, delete, and retry buttons

#### Scenario: Cancelled projects show light gray

- **WHEN** user has projects with status `cancelled`
- **THEN** the list item uses light gray text (`#a3a3a3`)
- **AND** a "已取消" label is displayed
- **AND** hover reveals action bar with play, delete, and retry buttons

#### Scenario: Deleted projects are excluded

- **WHEN** user has projects with status `deleted`
- **THEN** those projects are NOT rendered in the list (client-side filter)

### Requirement: History tab polls for status updates

The system SHALL automatically refetch `project.list` every 10 seconds via TanStack Query `refetchInterval` to capture status transitions of in-progress projects.

#### Scenario: In-progress project transitions to completed

- **WHEN** a project visible in the history tab is `queued` and its generation completes
- **THEN** within 10 seconds the card updates to completed styling without user interaction

#### Scenario: Polling continues regardless of tab visibility

- **WHEN** the user switches away from the history tab
- **THEN** polling continues at 10-second intervals (no special visibility optimization in v1)

### Requirement: Loading state shows skeleton cards

The system SHALL display 3 skeleton placeholder cards with pulse animation while `project.list` is loading for the first time.

#### Scenario: Skeleton cards shown on first load

- **WHEN** user first enters the history tab and `isLoading` is true
- **THEN** 3 skeleton cards with pulse animation are displayed

#### Scenario: Stale data preserved during refetch

- **WHEN** user switches back to the history tab after being on another tab
- **THEN** previously cached data is displayed immediately (not replaced with skeleton)
- **AND** a subtle loading indicator may appear while data refetches

### Requirement: Empty state guides users to create their first video

The system SHALL display an empty state with message and CTA button when the user has no non-deleted projects.

#### Scenario: Empty state shown for user with no projects

- **WHEN** data loads and `items.length === 0` (after filtering deleted)
- **THEN** empty state displays: "还没有生成视频" message and "开始生成" button
- **AND** clicking "开始生成" switches to the "生成视频" tab

### Requirement: Error state allows retry

The system SHALL display an error message with a retry button when `project.list` fails.

#### Scenario: Error state with retry button

- **WHEN** `project.list` query fails with an error
- **THEN** "加载失败,请重试" message is displayed
- **AND** a "重新加载" button is shown that triggers `refetch()`

### Requirement: Card action bar provides play, retry, and delete actions

The system SHALL render an action bar that fades in on hover for each history list item with context-sensitive buttons.

#### Scenario: All list items show play and delete buttons on hover

- **WHEN** any history list item is hovered
- **THEN** action bar fades in (`opacity-0 group-hover:opacity-100 transition-opacity`) with "▶ 播放" and "🗑 删除" buttons

#### Scenario: Failed and cancelled items show retry button

- **WHEN** a list item has status `failed` or `cancelled`
- **THEN** a "🔄 重试" button is additionally shown in the action bar

#### Scenario: Play button navigates to video playback page

- **WHEN** user clicks "▶ 播放"
- **THEN** browser navigates to `/projects/[id]/play`

#### Scenario: Delete button removes the project

- **WHEN** user clicks "🗑 删除"
- **THEN** `project.delete` mutation is called with `{ projectId }`
- **AND** on success, a success toast is shown

#### Scenario: Retry button restarts generation

- **WHEN** user clicks "🔄 重试"
- **THEN** `project.retry` mutation is called with `{ projectId }`
- **AND** on success, a success toast is shown

### Requirement: List items are clickable and navigate to playback

The system SHALL wrap each list item in a clickable Link element that navigates to the video playback page.

#### Scenario: Clicking a list item navigates to playback

- **WHEN** user clicks a history list item (not the action bar buttons)
- **THEN** browser navigates to `/projects/[id]/play`

### Requirement: Data is isolated per user

The system SHALL only display projects belonging to the currently authenticated user.

#### Scenario: User A does not see user B's projects

- **WHEN** user A has 2 projects and user B logs in
- **THEN** user B sees 0 projects from user A in their history tab
