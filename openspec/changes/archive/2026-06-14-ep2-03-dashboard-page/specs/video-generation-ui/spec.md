## ADDED Requirements

### Requirement: User can input text and submit to generate video with centered input layout

The system SHALL provide a textarea input centered on the screen and an icon-based submit button positioned at the bottom-right inside the input container. On submission, it calls `project.createAndGenerate` with hardcoded configuration parameters, and on success clears the input, shows a toast, and switches to the history tab.

#### Scenario: Input is centered on screen with icon button

- **WHEN** the GenerateTab renders
- **THEN** the input container is centered vertically and horizontally on the viewport
- **AND** the textarea starts as a single line and expands downward up to 6 lines
- **AND** an icon-based submit button (Send or ArrowUp icon) is positioned at the bottom-right inside the input container
- **AND** the last line of the input area is reserved exclusively for the button with no text content
- **AND** a fade mask gradient ensures text fades out smoothly above the button area

#### Scenario: Successful submission creates project and switches tab

- **WHEN** user enters text and clicks the submit icon button
- **THEN** `project.createAndGenerate` is called with the input text and hardcoded config (`aspectRatio: "16:9"`, `targetDurationSec: 120`, `audienceRole: "student"`, `audienceLevel: "intermediate"`, `voiceProvider: "minimax"`, `voiceId: "male-qn-qingse"`, title from first 50 chars of text)
- **AND** on success, input is cleared, toast "项目创建成功，正在生成中…" appears, and active tab switches to "历史记录"

#### Scenario: Empty text disables submit button

- **WHEN** the textarea is empty or contains only whitespace
- **THEN** the submit icon button displays a muted/disabled icon (e.g., muted Send icon)
- **AND** the button is disabled and not clickable

#### Scenario: Submission in progress shows loading spinner

- **WHEN** a submission is in progress (`createMutation.isPending` is true)
- **THEN** the submit button icon changes to a spinning loader (e.g., Loader2 with animate-spin)
- **AND** the button is disabled
- **AND** the textarea is disabled
- **AND** clicking the button again does not trigger a second request

#### Scenario: Submission failure shows error toast

- **WHEN** `project.createAndGenerate` returns an error
- **THEN** an error toast is displayed with the error message
- **AND** the input text is preserved (not cleared)
- **AND** the button is re-enabled with the active send icon

### Requirement: Submit button is icon-based and positioned at bottom-right inside input

The system SHALL replace the text-based "生成" button with an icon-only circular button positioned at the bottom-right corner inside the textarea container.

#### Scenario: Button uses state-aware icons

- **WHEN** the input is empty
- **THEN** the button displays a muted/disabled Send or ArrowUp icon
- **WHEN** the input contains text
- **THEN** the button displays an active Send or ArrowUp icon with primary color and solid background
- **WHEN** submission is in progress
- **THEN** the button displays a spinning Loader2 icon

#### Scenario: Button positioned at bottom-right with exclusive last line

- **WHEN** the GenerateTab renders
- **THEN** the button is positioned absolutely at the bottom-right of the input container
- **AND** the last line (~40-56px height) of the input area is reserved exclusively for the button
- **AND** no text content appears on the same line as the button
- **AND** the button has appropriate spacing from edges (e.g., bottom-2 right-2 or bottom-3 right-3)
- **AND** the button is circular (rounded-full) with equal width and height (e.g., 36-40px)
