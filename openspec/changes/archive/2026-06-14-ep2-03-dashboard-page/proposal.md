## Why

当前应用首页是一个脚手架占位页，缺乏登录后用户可用的功能入口。用户完成认证后无法立即看到"生成视频"、"查看历史"等核心操作界面，导致产品体验不完整。此变更在 `/` 路由实现认证态分流——未登录展示 Landing 首屏，登录后展示三 Tab 主页（生成视频 / 历史记录 / 订阅升级），并提供轻量级的项目删除和重试 mutation，让用户端到端地完成"创建→查看→管理"的基本闭环。

## What Changes

- 首页 `/` 路由改为认证态分流：`isPending` 全屏 Loading（防闪屏）、未登录展示 Landing 波浪背景、已登录展示三 Tab 主页
- 新增 Landing 首屏：Aceternity WavyBackground 全屏波浪背景（主题响应式）+ 右上角登录/注册按钮 + AnimatedThemeToggler
- 新增 Main App 导航栏：三 Tab 居中导航（生成视频 / 历史记录 / 订阅升级）+ Spring 物理滑块动画 + 用户头像下拉菜单
- 新增"生成视频"Tab：极简大文本框 + 右下角"生成"按钮，调用 `project.createAndGenerate`，成功后自动切换到历史 Tab
- 新增"历史记录"Tab：极简列表布局展示项目，单行文字（标题 + 状态标签 + 时长 + 日期），Hover 显示操作栏，状态视觉区分用灰度系，10 秒自动轮询，空/错/骨架状态全覆盖
- 新增"订阅升级"Tab：三张纯展示定价卡片（免费版/专业版/企业版），无支付逻辑
- 新增 `project.delete` mutation：权限校验 + 软删除（后续 ep2-05 增强为完整级联删除）
- 新增 `generation.retry` mutation：权限校验 + 重建 Job + Inngest 事件（后续 ep2-05 增强为 resume 模式）
- 新增 `/projects/[id]/play` 视频播放占位页
- 设计系统优化：WavyBackground 添加主题响应逻辑（MutationObserver 监听 `.dark` class），字体系统升级到 geist npm 包（本地加载 100-900 全字重），全局黑白色系统一

## Capabilities

### New Capabilities

- `landing-page`: Landing hero page with WavyBackground animation (theme-responsive with MutationObserver), AnimatedThemeToggler, and auth entry points for unauthenticated users
- `dashboard-shell`: Auth-gated routing with flash prevention, main app navigation bar with Spring physics slider animation, tab system, and user menu for authenticated users
- `video-generation-ui`: Generate Tab with minimalist large textarea, bottom-right submit button, anti-double-submit protection, auto-redirect to history on success
- `project-history-ui`: History Tab with minimalist list layout (title + status label + duration + date per row), hover-revealed action bar, status differentiation via grayscale colors, polling, skeleton/empty/error states
- `subscription-ui`: Subscribe Tab with three static pricing cards (免费版/专业版/企业版, no payment integration)
- `project-actions`: Lightweight project delete (soft delete) and generation retry mutations with permission checks
- `video-playback-page`: Placeholder video playback page at `/projects/[id]/play`
- `design-system`: Unified black-white achromatic design language with theme responsiveness, Geist font system (local npm package, full weight range 100-900), 4pt spacing grid, Spring animation physics

### Modified Capabilities

<!-- None - this change consumes existing APIs without changing their requirements -->

## Impact

- 修改 `src/app/page.tsx`：替换脚手架为认证态分流逻辑
- 修改 `src/app/layout.tsx`：切换到 geist npm 包本地字体（localFont），加载 100-900 全字重
- 新增 11 个前端组件（LandingHero, AppNavbar, UserMenu, GenerateTab, HistoryTab, HistoryCardActions, SubscribeTab, MainApp, VideoCardSkeleton, EmptyState, ErrorState）
- 修改 `src/components/ui/wavy-background.tsx`：添加主题响应逻辑（MutationObserver + 动态颜色函数），增强波浪强度参数（opacity 0.4, blur 8px, width 80px）
- 修改 `src/server/routers/project.ts`：追加 `delete`、`retry` mutation
- 修改 `src/server/services/project.service.ts`：追加 `deleteProject`、`retryGeneration`
- 新增 `src/app/(protected)/projects/[id]/play/page.tsx`
- 依赖 ep2-02 的 `project.list` / `project.getById` API 和 ep2-01 的 `project.createAndGenerate`
- 使用已有组件：WavyBackground（优化后）、AnimatedThemeToggler、shadcn UI（Button, Textarea, Avatar, DropdownMenu, Card, Skeleton, Badge）
- 与 ep2-05 共享 delete/retry mutation 签名契约，ep2-05 保证向后兼容
- 新增依赖：`framer-motion` (Tab 滑块动画), `geist` npm 包（本地字体）
