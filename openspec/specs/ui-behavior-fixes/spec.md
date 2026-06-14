# UI Behavior Fixes Specification

## Purpose

Verifies and fixes all interactive behaviors of the GenerateTab input interface, including expansion, button states, fade mask, theme synchronization, and responsive layout.

## Requirements

### Requirement: Input expansion behavior is smooth and predictable

The system SHALL render a single-line centered input that expands downward line-by-line up to 6 lines, then shows a scrollbar.

#### Scenario: Input starts as single-line centered

- **WHEN** GenerateTab renders with empty input
- **THEN** the input appears as single line with minimal height (~56px)
- **AND** the input container is vertically and horizontally centered on screen
- **AND** container uses `min-h-[calc(100vh-3.5rem)]` accounting for navbar height

#### Scenario: Input expands from 1-5 lines

- **WHEN** user types text that exceeds one line width
- **THEN** the input height increases by one line height
- **AND** expansion occurs downward with smooth transition (150-200ms)
- **AND** input continues expanding for each additional line up to 5 lines

#### Scenario: Input caps at 6 lines with scrollbar

- **WHEN** content exceeds 6 lines
- **THEN** input stops expanding and maintains 6-line height (~336px)
- **AND** vertical scrollbar appears
- **AND** fade mask remains fixed at bottom during scroll

### Requirement: Button state transitions are clear and responsive

The system SHALL display three distinct button states: disabled (empty), ready (has text), and pending (submitting).

#### Scenario: Button states map to conditions

- **WHEN** input is empty (`text.trim().length === 0`)
- **THEN** button shows muted Send icon with `bg-muted text-muted-foreground` and is not clickable
- **WHEN** input has text (`text.trim().length > 0 && !isPending`)
- **THEN** button shows active Send icon with `bg-primary text-primary-foreground`, enabled, hover shows `scale-105`
- **WHEN** submission is pending (`isPending === true`)
- **THEN** button shows Loader2 spinning animation, disabled, `cursor-not-allowed`

#### Scenario: Button meets accessibility standards

- **WHEN** button renders
- **THEN** button size is 40px × 40px minimum for touch targets
- **AND** button positioned `absolute bottom-3 right-3 z-20`
- **AND** button includes `aria-label="生成视频"`

### Requirement: Fade mask prevents text overlap with button

The system SHALL render a gradient overlay that fades text out smoothly above the button-exclusive area.

#### Scenario: Fade mask covers bottom 80px

- **WHEN** input has content
- **THEN** fade mask is positioned `absolute bottom-0 right-0 h-20 w-full z-10`
- **AND** gradient uses `bg-gradient-to-b from-transparent via-background/60 to-background`
- **AND** mask has `pointer-events-none` to allow button clicks

#### Scenario: Fade mask adapts to theme

- **WHEN** user switches theme
- **THEN** fade mask gradient instantly updates using `background` CSS variable
- **AND** light mode shows white gradient, dark mode shows black gradient
- **AND** no visual lag or color mismatch occurs

#### Scenario: Fade mask remains fixed during scroll

- **WHEN** user scrolls input content
- **THEN** fade mask stays fixed at bottom, does not scroll with text
- **AND** button remains visible on exclusive last line

### Requirement: Theme synchronization is instant across all components

The system SHALL update all component colors synchronously when theme toggle is clicked.

#### Scenario: All components update together

- **WHEN** user clicks AnimatedThemeToggler
- **THEN** navbar, input, button, fade mask all update colors in same frame
- **AND** no component lags behind or shows mixed theme colors
- **AND** View Transitions API animates theme change if supported (circular wipe from toggle button)

#### Scenario: Key components use theme variables

- **WHEN** components render
- **THEN** AppNavbar uses `bg-background/80 backdrop-blur-xl`
- **AND** AutoResizeTextarea uses `bg-background text-foreground border-input`
- **AND** FadeMask uses `via-background/60 to-background`
- **AND** IconButton uses `bg-primary text-primary-foreground`

### Requirement: Responsive layout adapts to screen sizes

The system SHALL provide appropriate spacing and sizing for mobile (375px) and desktop (1920px) viewports.

#### Scenario: Mobile layout (375px width)

- **WHEN** viewport is 375px wide
- **THEN** input container has `px-6` horizontal padding (24px each side)
- **AND** input width is 327px (375px - 48px)
- **AND** button stays within screen bounds at bottom-right
- **AND** fade mask covers full input width

#### Scenario: Desktop layout (1920px width)

- **WHEN** viewport is 1920px wide
- **THEN** input container has `max-w-3xl` (768px maximum width)
- **AND** container is centered with symmetric left/right whitespace
- **AND** input does not expand beyond 768px

#### Scenario: Navbar height compensation

- **WHEN** MainApp shell renders
- **THEN** content area uses `pt-14` to offset fixed navbar (56px = 3.5rem)
- **AND** centered input calculation uses `min-h-[calc(100vh-3.5rem)]`
- **AND** input is not obscured by navbar
