## ADDED Requirements

### Requirement: Unauthenticated users see Landing hero with WavyBackground

The system SHALL render a full-screen WavyBackground canvas animation for unauthenticated users visiting `/`, with brand title, rotating subtitle, theme toggle, and login/signup buttons.

#### Scenario: Landing hero renders for unauthenticated user

- **WHEN** an unauthenticated user navigates to `/`
- **THEN** the page displays a full-screen WavyBackground canvas animation with theme-responsive background colors:
  - Light mode: `rgb(250, 250, 250)` background with `#ccc` waves
  - Dark mode: `rgb(10, 10, 10)` background with `#404040` waves
- **AND** the top-right corner shows AnimatedThemeToggler, "登录" and "注册" buttons fixed at `top-6 right-6`
- **AND** the center displays:
  - Brand title "Volcano" with TypingAnimation (`text-7xl md:text-9xl font-bold tracking-tighter`)
  - Rotating subtitle with TypingAnimation (`text-xl md:text-2xl font-light`): "AI 驱动的视频生成平台", "文档一键转视频", "智能微课制作"

#### Scenario: Landing hero hides when session resolves

- **WHEN** an unauthenticated user visits `/` and then logs in
- **THEN** the Landing hero is replaced by the MainApp shell
- **AND** no flash of Landing content occurs during session resolution

#### Scenario: Theme toggle changes WavyBackground colors

- **WHEN** user clicks the AnimatedThemeToggler on Landing hero
- **THEN** WavyBackground canvas re-renders with theme-appropriate colors
- **AND** all text and buttons remain visible in both light and dark modes

### Requirement: Landing hero buttons link to auth pages

The system SHALL provide navigation buttons that link to the login and signup pages.

#### Scenario: Login button navigates to login page

- **WHEN** user clicks "登录" button
- **THEN** browser navigates to `/login`

#### Scenario: Signup button navigates to signup page

- **WHEN** user clicks "注册" button
- **THEN** browser navigates to `/signup`

### Requirement: Landing hero excludes marketing content sections

The system SHALL render the Landing hero with WavyBackground, brand title, rotating subtitle, theme toggle, and auth buttons, but excluding any CTA section, footer, feature sections, or "Learn More" links.

#### Scenario: No marketing content sections are present

- **WHEN** Landing hero is rendered
- **THEN** no feature section, footer, or "了解更多" link exists in the DOM
- **AND** only the brand title "Volcano" and rotating subtitle are displayed as centered content
