## MODIFIED Requirements

### Requirement: Navigation bar provides three centered tabs (MODIFIED)

The system SHALL render a fixed top navigation bar with three centered tabs ("生成视频" / "历史记录" / "订阅升级") using the SegmentedControl component, a theme toggle, and a user avatar dropdown on the right, without a bottom border.

#### Scenario: Navigation bar renders without bottom border

- **WHEN** an authenticated user views the MainApp shell
- **THEN** the navigation bar is displayed without a bottom border or dividing line
- **AND** the navigation bar background seamlessly transitions to the page content area
- **AND** no visual separator (border, shadow, or line) appears below the navbar

#### Scenario: Navigation bar uses SegmentedControl for tabs

- **WHEN** the navigation bar renders
- **THEN** the three tabs ("生成视频", "历史记录", "订阅升级") are rendered using the SegmentedControl component
- **AND** the SegmentedControl is centered horizontally in the navigation bar
- **AND** the selected tab displays with the animated indicator as defined in the SegmentedControl spec

#### Scenario: Theme toggle positioned before avatar

- **WHEN** the navigation bar renders
- **THEN** the AnimatedThemeToggler component appears in the right section
- **AND** the theme toggle is positioned immediately to the left of the user avatar
- **AND** spacing between theme toggle and avatar is consistent (e.g., gap-3 or gap-4)

#### Scenario: Navigation bar has clean minimal layout

- **WHEN** the navigation bar renders
- **THEN** the navbar uses a clean layout with appropriate padding (e.g., px-6 py-3 or py-4)
- **AND** the background is either transparent, uses `bg-background`, or a very subtle `bg-card`
- **AND** the overall design is minimal and high-end without unnecessary visual elements

### REMOVED Requirements

### Requirement: Navigation bar provides three centered tabs (ORIGINAL - SUPERSEDED)

The original requirement specified rendering tabs as individual `<button>` elements with manual active state management. This is now superseded by using the SegmentedControl component.

#### Scenario: Navigation bar shows three buttons (REMOVED)

This scenario is replaced by the SegmentedControl implementation, which provides the same functionality with enhanced animation and UX.

#### Scenario: Default active tab is "生成视频" (RETAINED)

- **WHEN** the MainApp shell first renders
- **THEN** the SegmentedControl's `value` prop is set to "生成视频" (or its corresponding value)
- **AND** the SegmentedControl displays the indicator on the "生成视频" option

#### Scenario: Clicking a tab changes the active content area (RETAINED)

- **WHEN** user clicks a different tab in the SegmentedControl
- **THEN** the SegmentedControl's `onChange` callback updates the active tab state
- **AND** the content area switches to the corresponding tab component
- **AND** the indicator animates to the newly selected tab
