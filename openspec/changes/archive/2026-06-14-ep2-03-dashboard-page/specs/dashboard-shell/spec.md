## ADDED Requirements

### Requirement: Auth-gated routing prevents flash of incorrect UI

The system SHALL render a full-screen loading spinner while the session is being resolved (`isPending`), then render the MainApp shell for authenticated users or the Landing hero for unauthenticated users.

#### Scenario: Loading spinner shown during session resolution

- **WHEN** a user visits `/` and `useSession()` returns `isPending: true`
- **THEN** a full-screen dark loading spinner is displayed
- **AND** neither Landing hero nor MainApp shell is rendered

#### Scenario: MainApp shell rendered for authenticated user

- **WHEN** session resolves with valid user data
- **THEN** the MainApp shell is rendered with navigation bar and default "生成视频" tab active

#### Scenario: Landing hero rendered for unauthenticated user

- **WHEN** session resolves with no user data
- **THEN** the Landing hero is rendered

### Requirement: Navigation bar provides three centered tabs

The system SHALL render a fixed top navigation bar with three centered tabs ("生成视频" / "历史记录" / "订阅升级") and a user avatar dropdown on the right.

#### Scenario: Navigation bar renders with three tabs

- **WHEN** an authenticated user views the MainApp shell
- **THEN** the navigation bar shows three buttons labeled "生成视频", "历史记录", and "订阅升级", centered in the bar
- **AND** tabs are rendered as `<button>` elements with keyboard accessibility

#### Scenario: Default active tab is "生成视频"

- **WHEN** the MainApp shell first renders
- **THEN** the "生成视频" tab has an active/highlighted visual style (`bg-primary/10 text-primary font-medium`)
- **AND** the other two tabs have muted styling (`text-muted-foreground`)

#### Scenario: Clicking a tab changes the active content area

- **WHEN** user clicks "历史记录" tab
- **THEN** the "历史记录" tab becomes highlighted and the content area shows HistoryTab
- **AND** the previously active tab returns to default styling

### Requirement: User menu provides profile access and logout

The system SHALL render a user avatar button that opens a dropdown menu with "个人中心" and "退出登录" options.

#### Scenario: User avatar displays user initial

- **WHEN** an authenticated user views the navigation bar
- **THEN** the avatar fallback shows the first character of the user's name

#### Scenario: Dropdown menu opens on avatar click

- **WHEN** user clicks the avatar button
- **THEN** a dropdown menu appears with items "个人中心" (links to `/profile`) and "退出登录"

#### Scenario: Logout signs out the user

- **WHEN** user clicks "退出登录"
- **THEN** the session is terminated and the UI transitions to Landing hero

### Requirement: Tab state is client-side only

The system SHALL manage the active tab selection using React `useState` without writing to URL search params or path.

#### Scenario: Tab selection does not appear in URL

- **WHEN** user switches between tabs
- **THEN** the URL remains unchanged (no query params or hash changes)

#### Scenario: Tab selection resets on full page reload

- **WHEN** user reloads the page
- **THEN** the active tab resets to "生成视频" (default)
