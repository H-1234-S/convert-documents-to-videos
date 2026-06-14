# AnimatedThemeToggler Specification

## Purpose

Provides a smooth, animated theme toggle component for switching between light and dark modes with full page synchronization.

## Requirements

### Requirement: AnimatedThemeToggler provides smooth theme switching with icon animation and full page synchronization

The system SHALL provide an AnimatedThemeToggler component that displays a button to toggle between light and dark themes with smooth icon transitions, and ensures all page components update their theme colors synchronously.

#### Scenario: Component renders current theme icon

- **WHEN** the component is rendered
- **THEN** the button displays a sun icon in dark mode or a moon icon in light mode
- **AND** the icon is centered within a square button
- **AND** the button has subtle styling consistent with navigation bar aesthetics (e.g., `hover:bg-accent` with rounded corners)

#### Scenario: Clicking toggles theme and animates icon

- **WHEN** user clicks the theme toggle button
- **THEN** the theme switches between light and dark mode
- **AND** the icon transitions smoothly from sun to moon (or vice versa) with animation
- **AND** the animation duration is between 200ms and 400ms
- **AND** the theme preference is persisted (e.g., to localStorage or using next-themes)

#### Scenario: Theme change synchronizes across all components

- **WHEN** user clicks the theme toggle button
- **THEN** all page components (navigation bar, input container, buttons, backgrounds, text, borders) update their colors instantly
- **AND** no component retains the old theme colors after the toggle
- **AND** all theme-aware CSS variables and Tailwind classes (e.g., `bg-background`, `text-foreground`, `border-border`) update synchronously
- **AND** no visual lag or partial updates occur (all components change together)

### Requirement: Icon transition uses Framer Motion for smooth morphing

The system SHALL animate the icon change using Framer Motion with rotation and scale effects for a polished transition.

#### Scenario: Icon animates with rotation on theme change

- **WHEN** the theme switches
- **THEN** the outgoing icon rotates (e.g., 180deg) and scales down while fading out
- **AND** the incoming icon rotates in from the opposite direction and scales up while fading in
- **AND** the transition uses spring physics or ease-out easing for natural motion
- **AND** the animation uses `motion` components from Framer Motion

#### Scenario: Icon has accessible label

- **WHEN** the component renders
- **THEN** the button has an appropriate aria-label (e.g., "切换主题" or "Toggle theme")
- **AND** screen readers can announce the current theme state
- **AND** the button is keyboard accessible (Tab and Enter/Space)

### Requirement: Component integrates with next-themes

The system SHALL use the `next-themes` package to manage theme state and ensure SSR compatibility.

#### Scenario: Theme state is managed by next-themes

- **WHEN** the component mounts
- **THEN** it reads the current theme from `useTheme()` hook provided by next-themes
- **AND** clicking the toggle calls `setTheme()` to switch between "light" and "dark"
- **AND** the theme persists across page reloads
- **AND** no flash of unstyled content (FOUC) occurs on initial page load

### Requirement: Component is positioned in navigation bar before user avatar

The system SHALL position the AnimatedThemeToggler in the navigation bar's right section, immediately before (to the left of) the user avatar dropdown.

#### Scenario: Theme toggle positioned before avatar

- **WHEN** the navigation bar renders in MainApp shell
- **THEN** the AnimatedThemeToggler appears in the right section of the navbar
- **AND** the toggle is positioned immediately to the left of the user avatar
- **AND** there is consistent spacing between the toggle and avatar (e.g., gap-2 or gap-4)

### Requirement: Component uses minimal and elegant styling

The system SHALL style the component with a clean, high-end aesthetic that matches a minimalist design language.

#### Scenario: Button has subtle hover and active states

- **WHEN** user hovers over the button
- **THEN** the button shows a subtle background change (e.g., `hover:bg-accent`)
- **AND** the transition is smooth (e.g., 150ms duration)

#### Scenario: Icon size is appropriate for navigation bar

- **WHEN** the component renders
- **THEN** the icon size is consistent with other navigation elements (e.g., 20px or h-5 w-5)
- **AND** the button has sufficient padding for comfortable touch targets (minimum 40x40px hit area)

#### Scenario: Component supports system theme preference

- **WHEN** user has not manually set a theme preference
- **THEN** the component respects the system theme preference (prefers-color-scheme)
- **AND** the icon reflects the active resolved theme (system default or manually selected)
