# OpenAI-style Input with Icon Button and Fade Mask

## Overview

This spec defines the updated design for the video generation input in GenerateTab, inspired by OpenAI's ChatGPT interface. The input starts as a single line centered on the screen, expands to a maximum of 6 lines downward, and features an icon-based submit button positioned at the bottom-right inside the input container. The last line is reserved exclusively for the button with no text, and a gradient fade mask ensures text fades out smoothly above the button area.

---

## Requirements

### Requirement: Input is centered on screen and expands from 1 line to maximum 6 lines

The system SHALL implement an auto-resizing textarea that starts as a single-line input centered on the screen and expands downward line-by-line up to 6 lines maximum.

#### Scenario: Input starts as single-line centered on screen

- **WHEN** the GenerateTab renders with empty input
- **THEN** the textarea displays as a single line with minimal height (~56px including padding)
- **AND** the input container is positioned at the vertical and horizontal center of the screen using flexbox centering (flex items-center justify-center with full viewport height)
- **AND** a placeholder text is shown (e.g., "描述你想生成的视频内容...")
- **AND** the input has rounded corners (e.g., rounded-2xl or rounded-3xl for modern feel)
- **AND** subtle border styling (border or ring)

#### Scenario: Input expands downward as user types

- **WHEN** user types text that wraps to a new line
- **THEN** the textarea height increases by exactly one line height
- **AND** the expansion occurs downward (the top edge of the input container remains anchored, and new lines appear below)
- **AND** the expansion is smooth (150-200ms transition)
- **AND** the textarea continues expanding for each additional line up to 6 lines total

#### Scenario: Input stops expanding after 6 lines

- **WHEN** the content exceeds 6 lines
- **THEN** the textarea stops growing in height
- **AND** a vertical scrollbar appears (overflow-y: auto)
- **AND** the 6-line height becomes the fixed maximum height

### Requirement: Generate button uses icons instead of text

The system SHALL replace the text-based "生成" button with an icon-only button that changes based on state.

#### Scenario: Default state shows send icon

- **WHEN** the input is empty
- **THEN** the button displays a disabled send/arrow icon (e.g., lucide-react's Send or ArrowUp)
- **AND** the icon is rendered in a muted color (e.g., text-muted-foreground)
- **AND** the button is disabled and not clickable

#### Scenario: Ready state shows active send icon

- **WHEN** the input contains text (non-empty and non-whitespace)
- **THEN** the button displays an active send icon
- **AND** the icon is rendered in primary or foreground color
- **AND** the button has a solid background (e.g., bg-primary with rounded-full)
- **AND** the button is enabled and clickable

#### Scenario: Pending state shows loading spinner

- **WHEN** submission is in progress (`isPending` is true)
- **THEN** the button displays a spinning loader icon (e.g., Loader2 from lucide-react)
- **AND** the spinner has an animation (animate-spin)
- **AND** the button is disabled during this state

#### Scenario: Button styling is circular and compact

- **WHEN** the button renders in any state
- **THEN** the button is circular (rounded-full with equal width and height, e.g., 36-40px)
- **AND** the icon is centered within the button
- **AND** hover state adds subtle scale or opacity transition
- **AND** the button design matches OpenAI's aesthetic (clean, minimal, modern)

### Requirement: Button positioned at bottom-right with exclusive last line

The system SHALL position the icon button at the bottom-right corner inside the textarea container, and the last line of the input area is reserved exclusively for the button with no text content.

#### Scenario: Button positioned with absolute positioning

- **WHEN** the GenerateTab renders
- **THEN** the button is positioned absolutely at the bottom-right of the textarea's parent container
- **AND** the button has appropriate spacing from edges (e.g., bottom-2 right-2 or bottom-3 right-3)
- **AND** the button floats above the textarea content (z-index)

#### Scenario: Last line is button-only, no text content

- **WHEN** the textarea is rendered
- **THEN** the entire last line (bottom ~40-56px of the input container) is reserved exclusively for the button
- **AND** no text content appears on the same horizontal line as the button
- **AND** the textarea's content area ends above the button line
- **AND** the bottom padding ensures sufficient space for the button line (e.g., pb-14 or pb-16)

#### Scenario: Textarea padding accounts for button space

- **WHEN** the textarea is rendered
- **THEN** the textarea has extra padding on the right side to prevent text from going under the button
- **AND** the right padding is sufficient to accommodate the button width plus spacing (e.g., pr-12 or pr-14)
- **AND** the bottom padding reserves the entire last line for the button (e.g., pb-14 to pb-16)

### Requirement: Fade mask prevents text overlap above button area

The system SHALL implement a gradient fade mask that creates a fade-out effect in the area above the button line, ensuring text smoothly fades out as it approaches the button-exclusive last line.

#### Scenario: Fade mask overlays the area above the button

- **WHEN** the textarea has content
- **THEN** a gradient overlay element is rendered above the button area (covering the bottom portion of the text area, excluding the button line itself)
- **AND** the overlay is positioned absolutely, spanning horizontally across the input width
- **AND** the overlay has pointer-events: none so it doesn't block button clicks or text selection

#### Scenario: Gradient fades from transparent to background color

- **WHEN** the fade mask renders
- **THEN** the gradient transitions vertically from transparent (top) to the background color (bottom, just above the button line)
- **AND** the gradient uses a vertical direction (top-to-bottom fade)
- **AND** example: `bg-gradient-to-b from-transparent via-background/50 to-background`
- **AND** the gradient height covers approximately 2-3 lines of text above the button line (e.g., height of ~60-80px)
- **AND** the fade ensures text gradually disappears as it approaches the button-exclusive line

#### Scenario: Fade mask is visible only when content approaches button area

- **WHEN** the textarea contains 1-3 lines of text
- **THEN** the fade mask may be minimal or not prominent (since text doesn't reach the button area)
- **AND** when content reaches 4+ lines, the mask becomes prominent
- **AND** the mask ensures text never visually overlaps with the button line

#### Scenario: Fade mask respects theme (light/dark mode)

- **WHEN** the user switches between light and dark themes
- **THEN** the fade mask gradient adapts instantly to the current background color
- **AND** the mask uses CSS variables or theme-aware classes (e.g., `to-background`)
- **AND** the transition between themes is smooth with no visual glitches

### Requirement: Character count display is optional or hidden

The system MAY hide the character count display entirely, or position it outside the main input area to maintain clean aesthetics.

#### Scenario: Character count is removed for minimal design

- **WHEN** the GenerateTab renders
- **THEN** no character count is displayed within the input container
- **AND** the focus is entirely on the input and button

#### Scenario: Character count shown externally (alternative)

- **WHEN** the GenerateTab renders and character count is desired
- **THEN** the character count is positioned outside and below the input container
- **AND** the count uses small, muted text (text-xs text-muted-foreground)
- **AND** the count does not interfere with the input or button

---

## Design Notes

### Visual Hierarchy

- The input is the primary focus: large, clean, minimal borders, centered on screen
- The button is secondary but clear: circular, icon-only, positioned at bottom-right on its exclusive line
- The fade mask is invisible UX: users don't see it as a separate element, they just see smooth vertical text fade above the button line
- The layout emphasizes simplicity: input centered, expands downward, button always visible on last line

### Animation & Transitions

- Textarea expansion: 150-200ms ease-out
- Button state changes: icon swap with 100-150ms fade transition
- Fade mask: always present, no transition needed (static gradient)

### Accessibility

- Button must have aria-label: e.g., "生成视频" or "提交" (since it's icon-only)
- Button must be keyboard accessible (Tab navigation, Enter/Space to activate)
- Textarea must support all standard keyboard shortcuts (Shift+Enter for new line if single Enter submits)

### Responsiveness

- On mobile (small screens), ensure button size is touch-friendly (minimum 40x40px tap target)
- Fade mask may need adjustment on very narrow screens
- Textarea max-width should prevent excessively wide text on large screens

---

## Implementation Components

### AutoResizeTextarea Enhancement

- Update `AutoResizeTextarea` to support `maxLines` prop (maxLines={6} for 6-line maximum)
- Calculate max height based on line height: maxHeight = lineHeight × maxLines + padding
- Add `paddingRight` and `paddingBottom` props or className to accommodate button line
- Ensure expansion occurs downward from the initial centered position

### IconButton Component (New or Inline)

- Circular button component with icon prop
- Three states: disabled (empty), active (ready), loading (pending)
- Icons from lucide-react: Send, ArrowUp, or Loader2

### FadeMask Component (New)

- Positioned absolutely above the button line
- Vertical gradient overlay (top-to-bottom fade) with pointer-events-none
- Theme-aware background color
- Height covers 2-3 lines above button area

### GenerateTab Layout

- Container with flexbox centering (vertical and horizontal center of viewport)
- Inner container with relative positioning for input and button
- Textarea with adjusted padding (bottom padding reserves button line)
- IconButton positioned absolutely at bottom-right
- FadeMask overlaying the area above the button line

---

## Edge Cases

### Very short input (1-2 words)

- Button is still visible and functional
- Fade mask is present but not prominent
- Layout remains clean

### Maximum 6 lines reached

- Scrollbar appears
- Fade mask helps indicate there's a button below and provides smooth text fade-out
- User can scroll to see all content
- Button line remains exclusively for the button

### Empty input edge case

- Button is disabled (muted icon)
- Placeholder is visible
- No fade mask needed (or minimal)

### Theme switching

- All colors (input border, button background, fade mask gradient) update instantly
- No jarring visual shifts

---

## Acceptance Criteria

- [ ] Textarea starts at 1 line, expands to max 6 lines (not 10)
- [ ] Input container is centered on screen (vertical and horizontal center)
- [ ] Expansion occurs downward from the centered starting position
- [ ] Button uses icons: disabled state (muted), ready state (active send icon), pending state (spinner)
- [ ] Button positioned at bottom-right inside input container
- [ ] Last line is exclusively reserved for the button with no text content
- [ ] Fade mask gradient prevents text overlap above button area with vertical top-to-bottom fade
- [ ] Fade mask adapts instantly to light/dark theme changes
- [ ] Button is circular, compact, and matches OpenAI aesthetic
- [ ] All animations are smooth (150-200ms transitions)
- [ ] Button has proper aria-label for accessibility
- [ ] Layout works on mobile and desktop
- [ ] Character count is hidden or positioned externally (minimal design)
