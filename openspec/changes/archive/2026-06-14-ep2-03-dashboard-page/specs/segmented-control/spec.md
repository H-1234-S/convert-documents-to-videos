## ADDED Requirements

### Requirement: SegmentedControl component provides pill-style tab navigation

The system SHALL provide a reusable SegmentedControl component that renders multiple options in a horizontal pill container with an animated indicator that slides to the selected option.

#### Scenario: Component renders all options in pill container

- **WHEN** SegmentedControl is rendered with an array of options
- **THEN** all options are displayed horizontally in a rounded pill container
- **AND** the container has rounded corners (`rounded-full` or equivalent)
- **AND** each option is rendered as an interactive button
- **AND** the component supports any number of options (minimum 2)

#### Scenario: Selected option displays with indicator background

- **WHEN** an option is selected (matches `value` prop)
- **THEN** a white rounded indicator background appears behind the selected option
- **AND** the indicator has rounded corners matching the overall pill style
- **AND** the selected option text uses a distinct color (e.g., primary or dark)
- **AND** unselected options use muted text color

#### Scenario: Clicking an option updates selection and triggers callback

- **WHEN** user clicks an unselected option
- **THEN** the `onChange` callback is invoked with the new value
- **AND** the indicator animates smoothly to the clicked option position
- **AND** the text colors update: newly selected becomes active color, previously selected becomes muted

### Requirement: Indicator animation uses transform for performance

The system SHALL animate the indicator position using CSS `transform: translateX()` rather than layout properties like `left` or `margin`.

#### Scenario: Indicator slides with transform animation

- **WHEN** the selected option changes
- **THEN** the indicator moves to the new position using `translateX()`
- **AND** the transform transition is GPU-accelerated (no layout reflow)
- **AND** the animation duration is between 250ms and 300ms
- **AND** the animation uses an ease-out or spring easing function for natural motion

### Requirement: Animation is powered by Framer Motion

The system SHALL use Framer Motion's layout animation features to implement the indicator transition.

#### Scenario: Indicator uses Framer Motion shared layout animation

- **WHEN** the component renders
- **THEN** the indicator is implemented as a `motion.div` or `motion.span` element
- **AND** the indicator uses `layoutId` for shared layout animation across option changes
- **AND** Framer Motion handles the position calculation and transform animation automatically
- **AND** the transition configuration specifies duration between 0.25s and 0.3s

#### Scenario: Text color transitions are smooth

- **WHEN** an option's selection state changes
- **THEN** the text color transition is animated with a duration matching or slightly shorter than the indicator (e.g., 200-250ms)
- **AND** the color transition uses CSS `transition` or Framer Motion `animate` prop

### Requirement: Component API is flexible and type-safe

The system SHALL provide a generic TypeScript interface that accepts option values of any type and enforces type safety for `value` and `onChange`.

#### Scenario: Component accepts generic option type

- **WHEN** SegmentedControl is used with custom value types (e.g., string, number, enum)
- **THEN** TypeScript enforces that `value` prop matches the option value type
- **AND** `onChange` callback receives the correctly typed value
- **AND** the component supports an `options` array with `{ label: string; value: T }` shape

#### Scenario: Component is keyboard accessible

- **WHEN** user navigates with keyboard (Tab key)
- **THEN** each option receives focus in sequence
- **AND** pressing Enter or Space on a focused option triggers selection
- **AND** focus indicators are visible (browser default or custom)

### Requirement: Component is styled for dashboard navigation use case

The system SHALL style the component to match the dashboard design language with appropriate spacing, colors, and sizing.

#### Scenario: Component uses design system colors

- **WHEN** the component renders
- **THEN** the pill container uses a subtle background color (e.g., `bg-muted` or `bg-secondary/20`)
- **AND** the indicator uses white background (`bg-white` or `bg-background`)
- **AND** selected text uses primary or foreground color
- **AND** unselected text uses muted foreground color

#### Scenario: Component has appropriate sizing and spacing

- **WHEN** the component renders
- **THEN** each option has sufficient padding for touch targets (minimum 40px height recommended)
- **AND** options have horizontal padding for comfortable spacing
- **AND** the pill container has padding around options (e.g., 4px gap)
- **AND** the overall component scales appropriately on mobile and desktop
