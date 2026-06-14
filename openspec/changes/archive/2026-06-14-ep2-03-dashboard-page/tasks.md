## 1. Baseline Verification & Setup

- [x] 1.1 Run `npm test` to confirm ep2-01 + ep2-02 tests all pass
- [x] 1.2 Run `npm run dev` and verify WavyBackground component has no import errors
- [x] 1.3 Check if `src/components/ui/skeleton.tsx` exists; if not, run `npx shadcn@latest add skeleton`
- [x] 1.4 Check if `src/components/ui/badge.tsx` exists; if not, run `npx shadcn@latest add badge`
- [x] 1.5 Verify `useSession()` from `@/lib/auth-client` works in a client component
- [x] 1.6 Install dependencies: `npm install framer-motion geist` (for Tab slider animation and local fonts)

## 2. Lightweight Mutation Endpoints (project.delete & generation.retry)

- [x] 2.1 Add `deleteProject` and `retryGeneration` functions to `src/server/services/project.service.ts`
- [x] 2.2 Add `delete` and `retry` mutation endpoints with Zod schemas to `src/server/routers/project.ts`
- [x] 2.3 Write router integration tests for project.delete (owner success, non-owner FORBIDDEN, not-found NOT_FOUND)
- [x] 2.4 Write router integration tests for project.retry (owner success, non-owner FORBIDDEN, not-found NOT_FOUND)
- [x] 2.5 Run `npm test` to confirm all new mutation tests pass

## 3. Home Page Routing with Auth Gate & Flash Prevention

- [x] 3.1 Modify `src/app/page.tsx`: implement `useSession()` gate with `isPending` → Loader, `!session` → LandingHero, `session` → MainApp
- [x] 3.2 Create `src/components/main-app/MainApp.tsx`: compose AppNavbar + conditional tab content rendering with `useState` tab state
- [x] 3.3 Verify: unauthenticated → Landing, authenticated → MainApp, `isPending` → full-screen loader (no flash)

## 4. Landing Hero & Design System Foundation

- [x] 4.1 Modify `src/app/layout.tsx`: switch from `next/font/google` to `localFont` loading from `geist` npm package (all weights 100-900)
- [x] 4.2 Modify `src/components/ui/wavy-background.tsx`: add MutationObserver to watch `.dark` class, implement dynamic color functions (light: rgb(250,250,250) + #ccc waves, dark: rgb(10,10,10) + #404040 waves), add isDark dependency to useEffect for re-rendering
- [x] 4.3 Create `src/components/landing/LandingHero.tsx`: WavyBackground with enhanced parameters (waveOpacity={0.4}, blur={8}, waveWidth={80}) + AnimatedThemeToggler (with text-black dark:text-white) + fixed-position login/signup buttons (theme-responsive colors)
- [x] 4.4 Verify WavyBackground renders full-screen canvas with theme-responsive background and wave colors
- [x] 4.5 Verify login button links to `/login`, signup button links to `/signup`, theme toggle changes canvas colors
- [x] 4.6 Verify typography: title uses font-bold (700), subtitle uses font-light (300), tracking-tighter on title
- [x] 4.7 Verify all text and buttons are visible in both light and dark modes (no white-on-white or black-on-black)

## 5. Main App Shell — Navigation Bar & User Menu

- [x] 5.1 Create `src/components/main-app/AppNavbar.tsx`: fixed top nav with centered three tabs + Framer Motion layoutId slider animation (stiffness: 380, damping: 30) + right-side user menu slot
- [x] 5.2 Create `src/components/main-app/UserMenu.tsx`: Avatar with fallback initial + DropdownMenu (个人中心 → `/profile`, 退出登录)
- [x] 5.3 Verify tab click changes active state and slider animates smoothly with Spring physics
- [x] 5.4 Verify avatar dropdown opens/closes correctly and logout terminates session
- [x] 5.5 Verify three tabs fit on 375px mobile without horizontal overflow
- [x] 5.6 Verify navbar uses backdrop-blur-xl and theme-responsive colors (bg-white/80 dark:bg-black/80)

## 6. Generate Tab

- [x] 6.1 Create `src/components/main-app/GenerateTab.tsx`: large Textarea (min-h-[60vh]) + bottom-right "生成" button, character count display
- [x] 6.2 Wire `project.createAndGenerate.useMutation` with hardcoded config values
- [x] 6.3 Implement anti-double-submit: button disabled + spinner when `isPending`, textarea disabled
- [x] 6.4 Implement empty text guard: button disabled when text is empty or whitespace-only
- [x] 6.5 Implement onSuccess: clear input, toast success, call `onTabChange("history")`
- [x] 6.6 Implement onError: toast error, preserve input text, re-enable button
- [x] 6.7 Verify minimalist layout: centered max-w-3xl container,充足垂直间距 (space-y-6), 与 Landing 留白节奏一致

## 7. History Tab — Data Layer

- [x] 7.1 Create `src/components/main-app/HistoryTab.tsx` with `trpc.project.list.useQuery({ pageSize: 50 })`
- [x] 7.2 Add `refetchInterval: 10_000` for polling
- [x] 7.3 Add client-side filter: `items.filter(item => item.status !== "deleted")`
- [x] 7.4 Implement minimalist list layout: single-line per project (title + status label + duration + date), hover-revealed action bar, fine border-b separators

## 8. History Tab — UI States

- [x] 8.1 Implement loading state: skeleton rows using shadcn Skeleton (`VideoCardSkeleton.tsx`)
- [x] 8.2 Implement empty state: `EmptyState.tsx` with minimalist message "还没有生成视频" + "开始生成" CTA (no icons, pure text)
- [x] 8.3 Implement error state: `ErrorState.tsx` with "加载失败" message and "重新加载" retry button (no icons, pure text)
- [x] 8.4 Verify all states maintain the same layout structure (py-32 vertical centering, max-w-5xl container)

## 9. History Tab — Status-Based Differentiation (Grayscale System)

- [x] 9.1 Completed projects: black text (#171717) + "已完成" label
- [x] 9.2 In-progress projects (queued, generating_*, calculating_*, rendering): medium gray text (#737373) + "生成中…" label
- [x] 9.3 Storyboard-ready projects: medium-dark gray (#525252) + "分镜就绪" label
- [x] 9.4 Failed projects: dark gray (#404040) + "生成失败" label (red accent removed for achromatic consistency)
- [x] 9.5 Cancelled projects: light gray (#a3a3a3) + "已取消" label
- [x] 9.6 Verify all status colors use grayscale values only (no hue), maintaining design system consistency

## 10. History Tab — Hover Actions

- [x] 10.1 Create `src/components/main-app/HistoryCardActions.tsx`: play + delete + conditional retry buttons (displayed on hover)
- [x] 10.2 Wire delete button to `trpc.project.delete.useMutation` with success toast
- [x] 10.3 Wire retry button (visible only for failed/cancelled) to `trpc.project.retry.useMutation` with success toast
- [x] 10.4 Wire play button to navigate to `/projects/[id]/play`
- [x] 10.5 Wrap each list item in a Link that navigates to `/projects/[id]/play` on click
- [x] 10.6 Verify action bar fades in on hover (opacity-0 group-hover:opacity-100 transition-opacity), maintaining minimal visual noise by default

## 11. Subscribe Tab

- [x] 11.1 Create `src/components/main-app/SubscribeTab.tsx`: three pricing cards (免费版 ¥0/月, 专业版 ¥29/月, 企业版 ¥99/月)
- [x] 11.2 Mark "免费版" as "当前方案" with a badge (hardcoded, no DB read)
- [x] 11.3 Add static feature lists for each tier
- [x] 11.4 Ensure all buttons are static (no payment handlers)

## 12. Video Playback Placeholder Page

- [x] 12.1 Create `src/app/(protected)/projects/[id]/play/page.tsx`
- [x] 12.2 Fetch project via `project.getById.useQuery({ projectId: id })` and display title
- [x] 12.3 Display "视频播放功能即将推出" placeholder message
- [x] 12.4 Add delete button calling `project.delete.useMutation`, redirect to `/` on success
- [x] 12.5 Add retry button (visible only for failed/cancelled) calling `project.retry.useMutation`

## 13. Component Tests

- [x] 13.1 Write `LandingHero.test.tsx`: renders login/signup links with correct hrefs
- [x] 13.2 Write `AppNavbar.test.tsx`: renders three tabs, click triggers onChange, user menu opens
- [x] 13.3 Write `GenerateTab.test.tsx`: empty text disables button, input enables button, submit shows loading + disabled
- [x] 13.4 Write `HistoryTab.test.tsx`: renders FocusCards with data, empty list shows EmptyState, loading shows skeleton
- [x] 13.5 Write `EmptyState.test.tsx`: renders icon + text + button
- [x] 13.6 Write `ErrorState.test.tsx`: renders error message + retry button
- [x] 13.7 Run `npm test` to confirm all component tests pass

## 14. Integration Verification

- [x] 14.1 `npm run dev` — verify app starts without errors
- [x] 14.2 Unauthenticated → Landing with WavyBackground + login/signup buttons + theme toggle
- [x] 14.3 Theme toggle on Landing: verify background and wave colors change, verify all text and icons visible in both modes
- [x] 14.4 Login → MainApp with default "生成视频" tab active, Tab slider animates with Spring physics
- [x] 14.5 Generate Tab: input text → submit → loading → toast + auto-switch to history
- [x] 14.6 History Tab: see newly created project in minimalist list layout
- [x] 14.7 History Tab: verify polling updates in-progress project status within ~10s
- [x] 14.8 History Tab: hover over list item → action bar fades in, click item → navigate to `/projects/[id]/play`
- [x] 14.9 History Tab: delete a project → item removed from list
- [x] 14.10 Subscribe Tab: three pricing cards displayed, free marked as "当前方案"
- [x] 14.11 `/projects/[id]/play`: shows project title + "即将推出"
- [x] 14.12 Mobile (375px): verify responsive layout — nav fits, textarea readable, list single-column
- [x] 14.13 Data isolation: user A cannot see user B's projects
- [x] 14.14 Design system consistency: verify all components use black-white-gray colors only, no chromatic colors (except SubscribeTab checkmarks for functional clarity)
- [x] 14.15 `npm run lint` — no new errors
- [x] 14.16 `npm test` — all tests pass

## 15. SegmentedControl Component

- [x] 15.1 Create `src/components/ui/segmented-control.tsx`: generic component with TypeScript interface `SegmentedControlProps<T>`
- [x] 15.2 Implement pill container with rounded-full styling and subtle background (bg-muted or bg-secondary/20)
- [x] 15.3 Implement indicator as `motion.div` with `layoutId="indicator"` for Framer Motion shared layout animation
- [x] 15.4 Configure transition with duration 0.25-0.3s and spring/ease-out easing
- [x] 15.5 Implement text color transitions (selected: primary/foreground, unselected: muted-foreground) with smooth animation
- [x] 15.6 Ensure keyboard accessibility: Tab navigation, Enter/Space selection, visible focus indicators
- [x] 15.7 Verify component accepts generic value types and enforces type safety for `value` and `onChange`
- [x] 15.8 Verify minimum 40px touch target height and appropriate padding/spacing
- [x] 15.9 Write `SegmentedControl.test.tsx`: renders options, click triggers onChange, indicator animates, keyboard navigation works

## 16. AnimatedThemeToggler Component

- [x] 16.1 Check if `next-themes` is installed; if not, run `npm install next-themes`
- [x] 16.2 Configure ThemeProvider in `src/app/layout.tsx` if not already configured
- [x] 16.3 Create `src/components/ui/animated-theme-toggler.tsx` using `useTheme()` from next-themes
- [x] 16.4 Implement sun/moon icon toggle with Framer Motion animations (rotation + scale transitions)
- [x] 16.5 Configure animation duration 200-400ms with spring physics or ease-out easing
- [x] 16.6 Add aria-label for accessibility ("切换主题" or "Toggle theme")
- [x] 16.7 Style button with subtle hover state (hover:bg-accent) and appropriate icon sizing (h-5 w-5 or 20px)
- [x] 16.8 Ensure button has minimum 40x40px touch target
- [x] 16.9 Verify theme persists across page reloads and no FOUC occurs
- [x] 16.10 Write `AnimatedThemeToggler.test.tsx`: renders correct icon, click toggles theme, accessible

## 17. Auto-Resize Textarea Component

- [x] 17.1 Create `src/components/ui/auto-resize-textarea.tsx`: textarea wrapper with auto-height adjustment
- [x] 17.2 Implement height calculation using `scrollHeight` in onChange handler
- [x] 17.3 Set initial single-row height (e.g., rows={1} or computed minimum ~48-56px)
- [x] 17.4 Implement smooth height transition (150-200ms duration)
- [x] 17.5 Set maximum height cap (6-8 lines or 200-240px) with overflow-y: auto for scrolling
- [x] 17.6 Style with minimal border (border-input), subtle background (bg-background or transparent)
- [x] 17.7 Implement elegant focus state with primary/accent border and subtle ring (ring-1 ring-primary/20)
- [x] 17.8 Set comfortable typography (text-base/text-lg font size, leading-relaxed line height)
- [x] 17.9 Write `AutoResizeTextarea.test.tsx`: starts single-line, expands on multi-line input, caps at max height

## 18. Update GenerateTab with Auto-Resize Input

- [x] 18.1 Replace large textarea in `GenerateTab.tsx` with AutoResizeTextarea component
- [x] 18.2 Update layout: position generate button inline at bottom-right of input container
- [x] 18.3 Ensure minimal spacing between input and button for compact layout
- [x] 18.4 Apply clean minimal styling: rounded-lg corners, subtle border/background
- [x] 18.5 Verify button styling: solid primary color, white text, subtle hover/active states
- [x] 18.6 Verify placeholder text displays correctly ("描述你想生成的视频内容...")
- [x] 18.7 Test expansion behavior: single-line → multi-line → max height with scroll
- [x] 18.8 Verify all existing functionality preserved (empty text guard, submit flow, error handling)

## 19. Update Navigation Bar (Remove Border, Add Theme Toggle, Use SegmentedControl)

- [x] 19.1 Update `AppNavbar.tsx`: remove bottom border/dividing line (remove border-b classes)
- [x] 19.2 Replace three individual tab buttons with SegmentedControl component
- [x] 19.3 Configure SegmentedControl options: [{ label: "生成视频", value: "generate" }, { label: "历史记录", value: "history" }, { label: "订阅升级", value: "subscribe" }]
- [x] 19.4 Center SegmentedControl horizontally in navbar
- [x] 19.5 Add AnimatedThemeToggler to navbar right section, positioned immediately before user avatar
- [x] 19.6 Set consistent spacing between theme toggle and avatar (gap-3 or gap-4)
- [x] 19.7 Ensure navbar background is seamless (bg-background, bg-card, or transparent) without visual separator
- [x] 19.8 Verify clean minimal layout with appropriate padding (px-6 py-3 or py-4)
- [x] 19.9 Update `AppNavbar.test.tsx`: verify SegmentedControl renders, theme toggle present, no border

## 20. Update LandingHero Theme Toggle Position

- [x] 20.1 Verify `LandingHero.tsx` already has AnimatedThemeToggler positioned correctly
- [x] 20.2 If theme toggle is not yet in LandingHero, add it in appropriate position (top-right corner or near login/signup buttons)
- [x] 20.3 Ensure theme toggle has proper contrast in both light and dark modes (text-black dark:text-white)
- [x] 20.4 Verify theme changes immediately affect WavyBackground colors

## 21. Integration Testing for New Components

- [x] 21.1 `npm run dev` — verify app starts without errors with new components
- [x] 21.2 Verify SegmentedControl in navbar: indicator animates smoothly on tab change, centered layout
- [x] 21.3 Verify AnimatedThemeToggler in navbar: positioned before avatar, icon animates on click, theme persists
- [x] 21.4 Verify navbar has no bottom border and seamless background transition
- [x] 21.5 Verify GenerateTab with auto-resize input: starts single-line, expands naturally, clean minimal design
- [x] 21.6 Verify generate button inline positioning with input, maintains all functionality
- [x] 21.7 Test keyboard navigation: Tab through SegmentedControl options, theme toggle, and input field
- [x] 21.8 Test mobile (375px): verify all new components fit and are usable
- [x] 21.9 `npm run lint` — no new errors (existing errors are pre-existing)
- [x] 21.10 `npm test` — all tests pass including new component tests

## 22. OpenAI-Style Input Enhancement

- [x] 22.1 Update `AutoResizeTextarea` component: add `maxLines` prop (default 10), calculate max height based on line height
- [x] 22.2 Add dynamic padding props to `AutoResizeTextarea`: `paddingRight` and `paddingBottom` for button space
- [x] 22.3 Update textarea styling: rounded-2xl or rounded-3xl corners for modern feel
- [x] 22.4 Calculate line height dynamically and set maxHeight = lineHeight × maxLines + padding
- [x] 22.5 Verify textarea expands exactly one line at a time up to 10 lines, then shows scrollbar

## 23. Icon-Based Submit Button

- [x] 23.1 Create `IconButton` component or inline implementation: circular (rounded-full), fixed size (36-40px), centered icon
- [x] 23.2 Implement three button states:
  - [x] 23.2.1 Disabled state (empty input): muted send icon (Send or ArrowUp from lucide-react), text-muted-foreground
  - [x] 23.2.2 Ready state (has text): active send icon, bg-primary, white icon color, enabled
  - [x] 23.2.3 Pending state (submitting): spinning Loader2 icon, animate-spin, disabled
- [x] 23.3 Add smooth icon transition animations (100-150ms fade between states)
- [x] 23.4 Add aria-label to button: "生成视频" or "提交" for accessibility
- [x] 23.5 Implement hover state: subtle scale (scale-105) or opacity change
- [x] 23.6 Verify button meets minimum touch target (40x40px) for mobile accessibility

## 24. Button Positioning Inside Input

- [x] 24.1 Wrap textarea in relative-positioned container
- [x] 24.2 Position icon button absolutely at bottom-right (e.g., absolute bottom-2 right-2 or bottom-3 right-3)
- [x] 24.3 Add z-index to button to ensure it floats above textarea
- [x] 24.4 Update textarea padding: pr-12 or pr-14 (right), pb-12 or pb-14 (bottom) to prevent text overlap
- [x] 24.5 Verify button stays in bottom-right corner as textarea expands from 1 to 10 lines

## 25. Gradient Fade Mask

- [x] 25.1 Create `FadeMask` component: positioned absolutely at bottom-right, matches button area dimensions
- [x] 25.2 Implement gradient: bg-gradient-to-l from-background via-background/80 to-transparent (or radial gradient)
- [x] 25.3 Set gradient dimensions: width and height ~80-100px to cover button plus margin
- [x] 25.4 Add pointer-events-none to ensure fade mask doesn't block button clicks
- [x] 25.5 Position fade mask between textarea and button (z-index layering)
- [x] 25.6 Verify fade mask adapts to theme changes (light/dark mode) using theme-aware CSS variables
- [x] 25.7 Test fade effect: ensure text gradually fades out as it approaches button area

## 26. Update GenerateTab Component

- [x] 26.1 Import updated AutoResizeTextarea with maxLines={10} prop
- [x] 26.2 Replace text-based "生成" button with icon-based IconButton
- [x] 26.3 Restructure layout: relative container → textarea → FadeMask → IconButton
- [x] 26.4 Remove or reposition character count display (hide for minimal design or position externally below input)
- [x] 26.5 Wire button states: disabled when empty, active when has text, loading when isPending
- [x] 26.6 Preserve existing functionality: empty guard, anti-double-submit, onSuccess/onError handlers
- [x] 26.7 Verify layout: input starts as 1 line, expands to 10 lines, button stays bottom-right, fade mask visible

## 27. Component Tests for New Features

- [x] 27.1 Write `IconButton.test.tsx`: renders disabled/ready/pending states, correct icons displayed, aria-label present
- [x] 27.2 Write `FadeMask.test.tsx`: renders gradient element, pointer-events-none applied, adapts to theme
- [x] 27.3 Update `AutoResizeTextarea.test.tsx`: verify maxLines prop limits expansion, scrollbar appears after 10 lines
- [x] 27.4 Update `GenerateTab.test.tsx`: verify icon button states change correctly, button positioned inside input container, fade mask renders
- [x] 27.5 Run `npm test` to confirm all new tests pass

## 28. Integration Testing for OpenAI-Style Input

- [x] 28.1 `npm run dev` — verify app starts without errors
- [x] 28.2 Test input expansion: starts 1 line → expands to 10 lines → shows scrollbar
- [x] 28.3 Test icon button states: empty → muted icon, with text → active icon, submitting → spinner
- [x] 28.4 Verify button positioned at bottom-right inside input container
- [x] 28.5 Verify fade mask prevents text overlap with button area
- [x] 28.6 Test theme switching: fade mask gradient adapts to light/dark backgrounds
- [x] 28.7 Test hover state on button: scale or opacity effect visible
- [x] 28.8 Test keyboard accessibility: Tab to button, Enter/Space to submit, aria-label announced by screen readers
- [x] 28.9 Test mobile (375px): button is touch-friendly, layout works on small screens
- [x] 28.10 Test submit flow: click button → spinner → success → input clears and switches to history tab
- [x] 28.11 Verify character count is hidden or positioned externally (not overlapping input/button)
- [x] 28.12 `npm run lint` — no new errors
- [x] 28.13 `npm test` — all tests pass including OpenAI-style input tests

## 29. UI Behavior Fixes & Verification

- [x] 29.1 **输入框行为验证**
  - [x] 29.1.1 无文本时显示单行，垂直和水平居中
  - [x] 29.1.2 输入 1-5 行文本，输入框向下逐行扩展
  - [x] 29.1.3 输入 6 行以上文本，输入框停止扩展，出现滚动条
  - [x] 29.1.4 滚动时遮罩层固定在底部，不随内容滚动

- [x] 29.2 **按钮交互验证**
  - [x] 29.2.1 空文本时按钮置灰（disabled），显示 Send 图标
  - [x] 29.2.2 有文本时按钮高亮（ready），可点击
  - [x] 29.2.3 提交中按钮显示 Loader2 旋转动画（pending）
  - [x] 29.2.4 点击按钮区域正常触发提交，hover 时有 scale-105 效果

- [x] 29.3 **遮罩层效果验证**
  - [x] 29.3.1 输入 5 行文本，第 4-5 行文本开始淡出
  - [x] 29.3.2 按钮上方（最后 40px 高度）完全看不到文本
  - [x] 29.3.3 切换主题时遮罩颜色自动适配（白色 ↔ 黑色渐变）
  - [x] 29.3.4 遮罩层使用 `pointer-events-none`，不阻塞按钮点击

- [x] 29.4 **主题联动验证**
  - [x] 29.4.1 点击右上角 AnimatedThemeToggler
  - [x] 29.4.2 所有组件颜色同步更新（navbar、输入框、按钮、遮罩层、背景）
  - [x] 29.4.3 无颜色闪烁或延迟（FOUC）
  - [x] 29.4.4 View Transitions 动画流畅播放（支持浏览器）
  - [x] 29.4.5 验证 Light 主题：白色背景、黑色文字、黑色按钮
  - [x] 29.4.6 验证 Dark 主题：深色背景、白色文字、白色按钮

- [x] 29.5 **响应式适配验证**
  - [x] 29.5.1 在 375px 移动端宽度下布局正常，左右各 24px 边距
  - [x] 29.5.2 在 1920px 桌面端宽度下输入框居中显示，最大宽度 768px
  - [x] 29.5.3 输入框最大宽度 `max-w-3xl` 生效
  - [x] 29.5.4 按钮在输入框右下角，不超出屏幕边界
  - [x] 29.5.5 在 DevTools 中切换不同设备尺寸时布局始终正常

- [x] 29.6 **可访问性验证**
  - [x] 29.6.1 按钮包含 `aria-label="生成视频"`
  - [x] 29.6.2 遮罩层包含 `aria-hidden="true"`
  - [x] 29.6.3 输入框支持 Tab 键聚焦
  - [x] 29.6.4 按钮支持 Enter/Space 键触发
  - [x] 29.6.5 颜色对比度符合 WCAG AA 标准

- [x] 29.7 **性能验证**
  - [x] 29.7.1 输入框高度调整无卡顿（< 16ms 每帧）
  - [x] 29.7.2 主题切换无 FOUC，所有颜色同时更新
  - [x] 29.7.3 滚动输入框时遮罩层不触发重绘

- [x] 29.8 **修复加载状态硬编码颜色**
  - [x] 29.8.1 检查 `src/app/page.tsx` 加载状态是否使用语义化类名
  - [x] 29.8.2 将 `bg-black text-white` 改为 `bg-background text-foreground`
  - [x] 29.8.3 验证加载状态在明暗主题下都正常显示

- [x] 29.9 **文档验证**
  - [x] 29.9.1 创建 `UI实现验证报告.md` 详细记录验证结果
  - [x] 29.9.2 创建 `specs/ui-behavior-fixes/spec.md` 规范文档
  - [x] 29.9.3 更新 `tasks.md` 添加验证清单
