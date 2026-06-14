# Auto-Resize Textarea Specification

## Purpose

Provides a minimal, auto-expanding textarea component for video generation input with clean, centered design inspired by modern AI interfaces.

## Requirements

### Requirement: Video generation input uses auto-resizing single-line-style input centered on screen

The system SHALL replace the large textarea with a minimal single-line input field that starts centered on the screen (both vertically and horizontally), auto-expands downward as the user types, up to a maximum of 6 lines, with a clean and elegant design inspired by Gemini's interface.

#### Scenario: Input starts as single-line centered on screen

- **WHEN** the GenerateTab renders with empty input
- **THEN** the input appears as a single-line field with minimal height (e.g., 48px or 56px)
- **AND** the input container is positioned at the vertical and horizontal center of the viewport using flexbox centering (e.g., `flex items-center justify-center min-h-screen`)
- **AND** a placeholder text is displayed (e.g., "描述你想生成的视频内容...")
- **AND** the input has rounded corners and subtle border styling
- **AND** the design is clean and minimal, avoiding visual clutter

#### Scenario: Input expands downward as user types multi-line content

- **WHEN** user types text that exceeds the width of a single line
- **THEN** the input automatically grows in height to accommodate the new line
- **AND** the expansion occurs downward from the initial starting position (top edge anchored, new lines appear below)
- **AND** the height increases smoothly without jarring layout shifts
- **AND** the expansion animation is subtle (e.g., 150-200ms transition)
- **AND** the input continues to expand for each additional line up to 6 lines maximum

#### Scenario: Input height is capped at maximum limit

- **WHEN** the content exceeds a maximum height threshold (6 lines or approximately 168-200px depending on line height)
- **THEN** the input stops expanding and displays a vertical scrollbar
- **AND** the scrollbar appears only when needed (overflow-y: auto)
- **AND** the maximum height ensures the generate button remains visible on its exclusive last line

### Requirement: Input uses textarea with auto-resize behavior

The system SHALL implement the component as a `<textarea>` element with JavaScript-driven height adjustment based on `scrollHeight`.

#### Scenario: Textarea height adjusts based on content

- **WHEN** user types or deletes text
- **THEN** an onChange handler calculates the required height using `scrollHeight`
- **AND** the textarea's height is updated dynamically via inline style or CSS variable
- **AND** the height calculation accounts for padding and border
- **AND** the textarea initially resets height to `auto` before measuring to handle deletions correctly

#### Scenario: Textarea starts with single-row height

- **WHEN** the textarea is empty or has only one line of text
- **THEN** the textarea height is set to a minimal single-row height (e.g., rows={1} or computed minimum)
- **AND** the styling avoids excessive vertical padding that makes it look like a large box

### Requirement: Input styling is high-end and minimalist

The system SHALL style the input with a refined aesthetic: subtle borders, clean typography, and elegant focus states.

#### Scenario: Input has minimal border and background

- **WHEN** the input is rendered
- **THEN** the input has a thin, subtle border (e.g., 1px solid with muted color like `border-input`)
- **AND** the background is either transparent or a very subtle shade (e.g., `bg-background` or `bg-card`)
- **AND** the design avoids heavy shadows or gradients, maintaining simplicity

#### Scenario: Focus state is elegant and understated

- **WHEN** user focuses the input
- **THEN** the border color changes to a primary or accent color
- **AND** a subtle ring or glow effect appears (e.g., `ring-1 ring-primary/20`)
- **AND** the transition is smooth (150ms duration)
- **AND** the focus state is noticeable but not distracting

#### Scenario: Typography is clean and legible

- **WHEN** user types text
- **THEN** the font size is comfortable for reading (e.g., text-base or text-lg)
- **AND** line height is generous for multi-line content (e.g., leading-relaxed)
- **AND** font weight is regular, not bold, maintaining a light appearance

### Requirement: Generate button is positioned inline with input

The system SHALL position the generate button adjacent to or below the input in a way that feels integrated and cohesive.

#### Scenario: Button positioned at bottom-right of input container

- **WHEN** the GenerateTab renders
- **THEN** the "生成" button is positioned at the bottom-right corner of the input container or immediately below it
- **AND** the button is aligned to the right (flex justify-end or absolute positioning)
- **AND** there is minimal spacing between input and button for a compact layout

#### Scenario: Button has clean, minimal styling

- **WHEN** the button renders
- **THEN** the button uses a solid primary color fill with white text
- **AND** the button has rounded corners consistent with the input (e.g., rounded-lg)
- **AND** hover and active states are subtle but present (slight darkening or scale effect)
