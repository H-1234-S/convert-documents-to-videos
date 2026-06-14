## Context

当前应用已有完整的认证体系（better-auth）、project creation API（ep2-01）、project list/detail query API（ep2-02）和 Aceternity UI 组件（WavyBackground、FocusCards），但首页 `/` 仍为脚手架占位页。需要实现认证态分流首页，让未登录用户看到 Landing 首屏，登录用户看到三 Tab 功能主页。

**约束：**
- 必须使用已有组件 WavyBackground（`src/components/ui/wavy-background.tsx`）和 FocusCards（`src/components/ui/focus-cards.tsx`），不做封装
- 路由结构保持 `/` 单路由 + 条件渲染，不创建 `/dashboard` 子路由
- delete/retry mutation 为轻量版，完整级联逻辑留给 ep2-05
- 所有 UI 组件放在 `src/components/` 下，按功能分目录（landing/、main-app/）
- shadcn/ui 组件已在项目中使用，新增需要时通过 `npx shadcn@latest add` 添加

## Goals / Non-Goals

**Goals:**
- `/` 路由根据认证状态渲染不同内容（Landing / MainApp），并防止闪屏
- Landing 首屏：WavyBackground + 登录/注册按钮（极简设计）
- Main App：三 Tab 导航（生成视频 / 历史记录 / 订阅升级）+ 用户菜单
- 生成视频 Tab：可提交文本创建项目，防重复提交，成功后自动切到历史 Tab
- 历史记录 Tab：FocusCards 展示项目，状态视觉区分，10 秒轮询，空/错/骨架状态
- 订阅 Tab：静态定价卡片展示
- 轻量 delete/retry mutation 端点
- 视频播放占位页 `/projects/[id]/play`

**Non-Goals:**
- 不实现完整 Landing 页（Footer、Feature 区、动画）→ ep6-04
- 不实现实际视频播放器 → ep6-03
- 不实现配置面板（参数可调）→ ep2-04 或后续
- 不实现完整级联删除 / resume 重试 / 取消检查点 → ep2-05
- 不实现实际支付 / 订阅逻辑
- 不实现 Tab 状态在 URL 中的持久化（v1 用 useState）
- 不实现历史记录的筛选/搜索/无限滚动

## Decisions

### Decision 1: 路由结构 — `/` 单路由条件渲染 vs `/dashboard` 子路由

**选择：** `/` 单路由 + `useSession()` 条件渲染

**理由：**
- 避免 302 重定向闪烁 — 用户感知"一个首页，两种面貌"
- 不需要中间件或路由守卫 — 纯客户端逻辑
- better-auth 的 `useSession()` 提供 `isPending` 状态，天然支持闪屏防护
- 后续若需要 `/dashboard` 独立路由，可在此基础上添加

**替代方案：** `/` 重定向到 `/dashboard`（已拒绝 — 会造成闪烁，增加不必要的网络往返）

### Decision 2: 闪屏防护 — `isPending` 全屏 Loader

**选择：** `isPending` 阶段渲染全屏 Loader（深色背景 + Loader2 spinner）

**理由：**
- 避免两种闪屏：(1) session 缓存恢复时 Landing 闪现 → MainApp；(2) session 过期时 MainApp 闪现 → Landing
- `isPending` 在 better-auth 中通常少于 500ms，Loader 持续时间极短
- 深色背景（`bg-black`）与 Landing 的黑色 WavyBackground 无缝衔接

**注意：** `isPending` 覆盖首次进入（无缓存）和缓存恢复两种场景。首次进入可能耗时较长（网络请求），但这是 better-auth 的行为，我们不做额外优化。

### Decision 3: Tab 状态管理 — `useState` vs URL search params

**选择：** `useState`，不写入 URL

**理由：**
- v1 不需要 bookmark 特定 Tab
- URL params 会增加不必要的复杂度（状态同步、SSR 考虑）
- 后续若需要，可无缝升级到 `useSearchParams`

### Decision 4: 历史记录轮询 — `refetchInterval` vs WebSocket/SSE

**选择：** `refetchInterval: 10_000`（TanStack Query 轮询）

**理由：**
- 10 秒间隔对服务器压力最小（每用户 0.1 QPS）
- TanStack Query 原生支持，零额外代码
- 生成中项目 10 秒内状态变化就会被捕捉，对用户体验足够
- WebSocket/SSE 引入额外基础设施复杂度，v1 不必要
- 注意：TanStack Query 在 Tab 不可见时也会轮询——这是可接受的，简单方案优先

### Decision 5: 历史记录布局 — FocusCards 网格 vs 极简列表

**选择：** 极简列表布局（单行文字 + 状态标签 + Hover 操作栏）

**理由：**
- **保持设计系统一致性**：FocusCards 的彩色占位图（amber/blue/emerald/violet/pink）会破坏全局黑白色系，与 Landing 首屏的极简美学冲突
- **视觉重心平衡**：Landing 首屏已是视觉高潮（动态背景 + 巨大标题），MainApp 功能区应收敛为信息主导，避免视觉过载
- **信息效率优先**：列表布局让用户快速扫描标题、状态、时长、日期，符合"任务管理"而非"作品展示"的工具属性
- **状态色使用灰度系**：completed (#171717 黑色)、in-progress (#737373 中灰)、failed (#404040 深灰)、cancelled (#a3a3a3 浅灰)，延续黑白主题
- **交互克制**：Hover 显示操作栏（播放/删除/重试），界面默认整洁，操作在需要时出现

**设计原则：克制的表现力**
- Landing 视觉主导 → 传达品牌调性（高级、简洁、现代）
- MainApp 信息主导 → 传达产品态度（专注、高效、专业）
- 两者通过相同的底层设计语言统一（黑白色系、字重层级、4pt 网格、主题响应）但视觉强度不同

**替代方案：** FocusCards 网格布局（已拒绝 — 彩色占位图破坏色系一致性，大图卡片与首屏风格冲突）

### Decision 6: Delete 确认 — 直接删除 vs AlertDialog

**选择：** 直接删除（无二次确认弹窗），失败 toast 提示

**理由：**
- 极简优先，减少操作步骤
- 卡片操作栏空间有限（每张卡片紧凑布局）
- 删除是软删除（status="deleted"），非破坏性操作，数据可恢复
- 若用户反馈误删，ep2-05 可加 AlertDialog

### Decision 7: Mutation 签名契约 — 与 ep2-05 共享

**选择：** 两 Change 共享相同 mutation 输入/输出签名，ep2-05 保证向后兼容

**理由：**
- 一方先合并入 main 不影响另一方
- ep2-05 增强内部逻辑时（级联删除、resume 重试）不改变 tRPC schema
- 前端代码无需因 ep2-05 而修改

### Decision 8: GenerateTab 配置参数 — v1 硬编码 vs 配置面板

**选择：** v1 全部硬编码（`aspectRatio: "16:9"`, `targetDurationSec: 120`, `voiceProvider: "minimax"` 等）

**理由：**
- 极简优先，降低初期 UI 复杂度
- 配置面板需要独立的设计考量（布局、预设管理、校验）→ ep2-04 或后续
- 前端代码在 GenerateTab 中集中硬编码，后续提取为配置面板时修改点清晰

### Decision 9: 设计系统一致性 — 从 Landing 到 MainApp 的统一语言

**原则：克制的表现力**

Landing 首屏建立品牌调性：
- **动态背景**：WavyBackground Canvas 动画，主题响应（亮模式 rgb(250,250,250) + 浅灰波浪，暗模式 rgb(10,10,10) + 深灰波浪）
- **视觉层次**：波浪不透明度 0.4 + 模糊 8px + 线宽 80px，形成背景 → 波浪 → 文字三层分离
- **巨大标题**：text-7xl md:text-9xl font-bold (700)，副标题 font-light (300)，极致字重对比
- **大量留白**：屏幕正中居中，四周大量空白
- **传达调性**：高级、简洁、现代

MainApp 功能区延续设计语言但降低视觉强度：
- **相同的黑白色系**：无彩色干扰，状态色使用灰度系（#171717 / #737373 / #404040）
- **相同的字重层级**：Bold (700) / Normal (400) / Light (300) 三级层级
- **相同的留白节奏**：4pt 网格系统（gap-4, py-6, space-y-6），一致的呼吸感
- **相同的主题响应**：所有组件支持 dark: 变体，全局主题切换无遗漏
- **从动态到静态**：去除动态背景，使用静态背景 + 细边框
- **从视觉到信息**：降低字号，提升信息密度，操作优先
- **微妙的动效**：Tab 滑块用 Spring 物理动画（stiffness: 380, damping: 30），Hover 用 transition-colors（非过度动效）
- **传达态度**：专注、高效、专业

**核心设计 Token**：
- 色系：achromatic（纯黑白灰）
- 字体：Geist（本地字体，100-900 全字重）
- 圆角：0.5rem
- 间距：4pt 网格（4/8/12/16/24/32px）
- 动画：150-300ms，Spring 物理曲线
- 主题：完整的 light/dark 支持

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|---------|
| WavyBackground 在 Safari 上 canvas 模糊 | 组件已内置 Safari 检测 + `filter: blur()` 回退；实现后在 Safari 实测 |
| 列表布局信息密度可能过高 | 使用充足垂直间距（py-6）和细边框分隔，保持视觉呼吸感 |
| 黑白色系可能导致状态区分度不足 | 用灰度值建立明确层级（completed: #171717, in-progress: #737373, failed: #404040），配合文字标签和 hover 反馈 |
| `refetchInterval: 10_000` 对服务器压力 | 每活跃用户 0.1 QPS；100 并发用户 = 10 QPS，完全可接受 |
| 闪屏（session 缓存恢复时间不可控） | `isPending` 阻塞渲染；better-auth 中通常 <500ms |
| 防重复不彻底（键盘 Enter 快速触发） | 三重保护：`useMutation.isPending` + Button `disabled` + Textarea `disabled` |
| Tab 数量增长导致移动端溢出 | v1 仅 3 Tab（≈240px < 375px）；未来 >3 时用 `overflow-x: auto` |
| shadcn Skeleton/Badge 组件可能不存在 | Pre-flight 检查：若不存在则 `npx shadcn@latest add skeleton badge` |
| 主题切换时 WavyBackground 颜色不响应 | 使用 MutationObserver 监听 `.dark` class 变化，触发 Canvas 重绘（已在 wavy-background.tsx 实现） |

### Decision 10: 生成输入框设计 — OpenAI 风格 vs 传统大文本框

**选择：** OpenAI ChatGPT 风格输入框（单行起始 + 自动扩展 + 图标按钮 + 渐变遮罩）

**理由：**
- **渐进式展开**：从单行开始，随内容增长逐行扩展至 10 行上限，适应短到长的不同输入场景
- **视觉克制**：未输入时占用空间极小（~56px），不会在空状态下视觉喧宾夺主
- **现代交互范式**：OpenAI、Gemini 等现代 AI 产品的标准模式，用户熟悉度高
- **图标语言统一**：去除文字按钮，改用图标（Send/ArrowUp/Loader2），符合极简设计系统
- **空间效率**：按钮内嵌在输入框右下角，节省垂直空间，避免额外的按钮行
- **渐变遮罩防重叠**：底部右侧渐变遮罩确保文字在接近按钮区域时自然淡出，避免视觉冲突

**设计细节：**
- **起始状态**：1 行高度（~56px），rounded-2xl/rounded-3xl 现代圆角
- **扩展行为**：逐行扩展至最大 10 行，超出显示滚动条
- **按钮状态**：
  - 空输入：禁用状态，Send 图标，muted color
  - 有内容：激活状态，Send 图标，primary background，circular (rounded-full)
  - 提交中：Loader2 旋转动画，禁用状态
- **按钮位置**：absolute 定位在输入框右下角（bottom-2 right-2），z-index 浮在上层
- **输入框内边距**：pr-12/pr-14（右侧）和 pb-12/pb-14（底部）为按钮预留空间
- **渐变遮罩**：
  - 位置：absolute 定位在按钮区域，覆盖约 80-100px 范围
  - 渐变方向：从透明到背景色（bg-gradient-to-l from-background via-background/80 to-transparent）
  - 功能：文字接近按钮区域时自然淡出，避免文字与按钮视觉重叠
  - 主题响应：使用 CSS 变量（from-background），自动适配 light/dark 模式
  - 交互透明：pointer-events-none，不阻挡按钮点击
- **字符计数**：隐藏或移至输入框外部下方，保持输入区域视觉纯净
- **可访问性**：
  - 按钮 aria-label="生成视频"（图标无文字需标签）
  - 键盘导航支持：Tab 聚焦按钮，Enter/Space 触发提交
  - 最小触摸目标 40x40px（移动端友好）

**与设计系统的一致性：**
- **延续黑白色系**：按钮使用 primary 色（仍为黑白系），图标单色
- **延续圆角语言**：输入框 rounded-2xl，按钮 rounded-full，统一现代感
- **延续动效节奏**：扩展动画 150-200ms，图标切换 100-150ms，与 Tab 切换动画一致
- **延续留白节奏**：输入框与其他元素间距使用 4pt 网格（space-y-6）
- **延续主题响应**：渐变遮罩、边框、图标颜色全部主题响应

**替代方案：** 传统大文本框 + 文字按钮（已拒绝 — 空状态视觉占用大，文字按钮增加视觉噪声，不符合极简原则）

**Trade-off：**
- ✅ 视觉更简洁、现代，符合 AI 产品标准范式
- ✅ 空间效率更高，按钮内嵌节省垂直空间
- ✅ 图标语言降低视觉噪声，保持极简
- ⚠️ 需要渐变遮罩处理文字与按钮重叠问题（已通过 CSS 渐变 + pointer-events-none 解决）
- ⚠️ 图标按钮需要 aria-label 确保可访问性（已在设计中明确）
