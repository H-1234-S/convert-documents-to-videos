# Theme Synchronization Across All Components

## Overview

This spec ensures that when the user toggles between light and dark themes using the AnimatedThemeToggler, all components across the entire page update their colors synchronously with no visual lag or partial updates.

---

## Requirements

### Requirement: All components use theme-aware CSS variables

The system SHALL ensure all components use CSS variables or Tailwind theme classes that respond to the global theme state managed by next-themes.

#### Scenario: Components use theme-aware Tailwind classes

- **WHEN** any component renders (navigation bar, input, buttons, backgrounds, text, borders)
- **THEN** the component uses theme-aware Tailwind classes such as:
  - Background: `bg-background`, `bg-card`, `bg-primary`, `bg-accent`
  - Text: `text-foreground`, `text-muted-foreground`, `text-primary`
  - Borders: `border-border`, `border-input`
  - Rings: `ring-ring`
- **AND** no component uses hardcoded color values (e.g., `bg-white`, `bg-black`, `text-gray-900`) unless they are intentionally theme-independent

#### Scenario: Custom components reference CSS variables

- **WHEN** a component uses custom CSS or inline styles
- **THEN** the component references CSS variables defined in the theme system (e.g., `var(--background)`, `var(--foreground)`, `var(--primary)`)
- **AND** these variables are declared in the global CSS with both light and dark mode values
- **AND** the variables update instantly when the theme changes

### Requirement: Theme toggle triggers synchronous color update

The system SHALL ensure that clicking the theme toggle button updates all component colors instantly and synchronously.

#### Scenario: All components update on theme toggle

- **WHEN** user clicks the AnimatedThemeToggler button
- **THEN** the root element's theme attribute changes (e.g., `<html class="dark">` or `<html class="light">`)
- **AND** all CSS variables and Tailwind classes re-evaluate based on the new theme
- **AND** every component on the page updates its colors within the same frame (no staggered updates)
- **AND** the user perceives a single, instant color change across the entire page

#### Scenario: No components retain old theme colors

- **WHEN** user toggles the theme
- **THEN** no component displays colors from the previous theme
- **AND** no visual lag occurs where some components update before others
- **AND** the page never shows a mixed state (e.g., dark navbar with light input)

### Requirement: WavyBackground canvas updates theme colors

The system SHALL ensure the WavyBackground canvas animation on the Landing hero updates its background and wave colors when the theme changes.

#### Scenario: WavyBackground responds to theme toggle

- **WHEN** user clicks the theme toggle on the Landing hero
- **THEN** the WavyBackground canvas re-renders with the new theme colors
- **AND** light mode uses `rgb(250, 250, 250)` background with `#ccc` waves
- **AND** dark mode uses `rgb(10, 10, 10)` background with `#404040` waves
- **AND** the transition is smooth with no flash of the old colors

### Requirement: Input container and fade mask update synchronously

The system SHALL ensure the input container, textarea, button, and fade mask all update their colors together when the theme changes.

#### Scenario: Input components update on theme toggle

- **WHEN** user toggles the theme
- **THEN** the textarea background, border, and text colors update using theme variables
- **AND** the submit button colors (background, icon color) update using theme variables
- **AND** the fade mask gradient updates to use the new `background` color (e.g., `to-background`)
- **AND** all updates occur synchronously with no partial color changes

### Requirement: No hardcoded colors in component styles

The system SHALL avoid hardcoded color values in component styles to ensure full theme compatibility.

#### Scenario: Code review detects hardcoded colors

- **WHEN** reviewing component code
- **THEN** all color-related properties use theme variables or Tailwind theme classes
- **AND** no hardcoded hex, rgb, or named color values exist (except for theme-independent cases like transparent)
- **AND** exceptions are documented (e.g., WavyBackground canvas colors may be hardcoded but theme-responsive)

---

## Design Notes

### Implementation Approach

- Use `next-themes` with `ThemeProvider` wrapping the entire app
- Define CSS variables in `globals.css` for both light and dark themes
- Ensure all components use Tailwind's theme-aware classes or CSS variables
- For canvas/SVG elements that can't use CSS variables directly, pass theme state as props and re-render on change

### Testing Theme Synchronization

- Manually toggle theme and visually inspect all components
- No component should lag behind or show mixed theme colors
- Use browser DevTools to verify CSS variable values update correctly

### Edge Cases

- Components rendered conditionally (e.g., dropdowns, modals) must also use theme-aware styles
- Animations and transitions should not cause color flicker during theme change
- Third-party components (if any) should be wrapped or styled to respect the theme

---

## Acceptance Criteria

- [ ] All components use theme-aware Tailwind classes or CSS variables
- [ ] No hardcoded color values exist in component styles (except documented exceptions)
- [ ] Theme toggle updates all component colors instantly and synchronously
- [ ] No visual lag or partial updates occur during theme change
- [ ] WavyBackground canvas updates its colors when theme changes
- [ ] Input container, textarea, button, and fade mask all update together
- [ ] Theme preference persists across page reloads
- [ ] Light and dark modes are fully functional and visually consistent
