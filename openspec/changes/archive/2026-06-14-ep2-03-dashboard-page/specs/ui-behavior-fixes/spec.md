# UI Behavior Fixes

**Status**: pending  
**Artifact Type**: spec  
**Dependencies**: 
- video-generation-ui
- animated-theme-toggler
- auto-resize-textarea

---

## Overview

修复和验证 GenerateTab 输入框的所有交互行为，确保用户体验符合设计规范。包括输入框扩展、按钮状态、遮罩层效果、主题联动和响应式适配。

---

## Requirements

### 1. 输入框行为

#### 1.1 初始状态
- **单行显示**：无文本时显示单行输入框
- **居中定位**：垂直和水平居中于屏幕正中间
- **容器约束**：使用 `min-h-[calcvalue>-3.5rem)]` 减去 navbar 高度

#### 1.2 文本扩展
- **1-5 行**：输入文本时输入框自动向下扩展
- **行为**：每增加一行文本，输入框高度相应增加
- **平滑动画**：高度变化应有平滑过渡（transition）

#### 1.3 滚动行为
- **触发条件**：输入第 6 行以上文本
- **行为**：输入框停止扩展，保持 6 行高度
- **滚动条**：出现垂直滚动条
- **遮罩固定**：滚动时遮罩层固定在底部不随滚动

**验证标准**：
```typescript
// 测试用例
const testCases = [
  { lines: 0, height: '56px', scrollable: false },
  { lines: 1, height: '~56px', scrollable: false },
  { lines: 3, height: '~168px', scrollable: false },
  { lines: 5, height: '~280px', scrollable: false },
  { lines: 6, height: '~336px', scrollable: false },
  { lines: 10, height: '~336px', scrollable: true },
];
```

---

### 2. 按钮交互

#### 2.1 按钮状态映射
| 状态 | 条件 | 视觉效果 | 交互行为 |
|------|------|---------|---------|
| **disabled** | `text.trim().length === 0` | 置灰，`bg-muted text-muted-foreground` | 不可点击，`cursor-not-allowed` |
| **ready** | `text.trim().length > 0 && !isPending` | 高亮，`bg-primary text-primary-foreground` | 可点击，hover 时 `scale-105` |
| **pending** | `isPending === true` | 显示 Loader2 动画 | 不可点击，`cursor-not-allowed` |

#### 2.2 图标切换动画
```tsx
<AnimatePresence mode="wait" initial={false}>
  {state === "pending" ? (
    <Loader2 className="h-5 w-5 animate-spin" />
  ) : (
    <Send className="h-5 w-5" />
  )}
</AnimatePresence>
```
- **动画参数**：`duration: 0.15s`, `opacity + scale` 变化
- **模式**：`mode="wait"` 确保图标切换不重叠

#### 2.3 点击区域
- **尺寸**：`h-10 w-10`（40px × 40px）
- **定位**：`absolute bottom-3 right-3 z-20`
- **触控目标**：符合 WCAG 2.1 最小 44px × 44px 建议（含 padding）

**验证标准**：
- ✅ 空文本时点击按钮无响应
- ✅ 有文本时点击按钮触发 `handleSubmit`
- ✅ pending 时点击按钮无响应
- ✅ 按钮区域外点击不影响输入框焦点

---

### 3. 遮罩层效果

#### 3.1 遮罩定位与尺寸
```tsx
<div className="absolute bottom-0 right-0 h-20 w-full z-10">
```
- **高度**：`h-20`（80px）= 按钮高度（40px）+ 上方 2-3 行（~40px）
- **宽度**：`w-full` 覆盖输入框全宽
- **层级**：`z-10`（位于 textarea 之上，按钮 `z-20` 之下）

#### 3.2 渐变实现
```tsx
className="bg-gradient-to-b from-transparent via-background/60 to-background"
```
| 色阶 | 位置 | 透明度 | 作用 |
|------|------|--------|------|
| `from-transparent` | 顶部（~40px） | 0% | 不影响可读性 |
| `via-background/60` | 中间（~20px） | 60% | 开始淡出 |
| `to-background` | 底部（按钮上方） | 100% | 完全遮盖 |

#### 3.3 主题适配
- **CSS 变量**：使用 `background` 变量，自动跟随 `:root` 和 `.dark` 切换
- **无需手动处理**：`next-themes` 更新 `document.documentElement.classList` 时自动生效

**验证标准**：
- ✅ 输入 5 行文本，第 4-5 行文本开始淡出
- ✅ 按钮上方（最后 40px）完全看不到文本
- ✅ 切换主题时遮罩颜色立即变化（Light: 白色 → Dark: 黑色）
- ✅ 滚动输入框时遮罩层不随内容滚动

---

### 4. 主题联动

#### 4.1 主题切换流程
```
用户点击 AnimatedThemeToggler
  ↓
setTheme("dark" | "light")
  ↓
next-themes 更新 document.documentElement.classList
  ↓
CSS 变量切换（:root → .dark）
  ↓
所有组件自动更新（bg-background, text-foreground 等）
```

#### 4.2 需要验证的组件
| 组件 | 关键类名 | 期望行为 |
|------|---------|---------|
| **AppNavbar** | `bg-background/80 backdrop-blur-xl` | 背景色半透明跟随主题 |
| **GenerateTab 容器** | 无背景色类（继承 body） | 继承 `bg-background` |
| **AutoResizeTextarea** | `bg-background text-foreground border-input` | 背景、文字、边框同步变化 |
| **FadeMask** | `via-background/60 to-background` | 渐变色跟随主题 |
| **IconButton** | `bg-primary text-primary-foreground` | 按钮主题色联动 |

#### 4.3 View Transitions API
```tsx
// AnimatedThemeToggler 内部实现
if (document.startViewTransition) {
  document.startViewTransition(() => {
    setTheme(newTheme);
  });
} else {
  setTheme(newTheme);
}
```
- **动画类型**：圆形扩散（circle wipe）
- **触发位置**：从主题切换按钮中心扩散
- **持续时间**：~300ms

**验证标准**：
- ✅ 点击主题切换器后所有组件颜色同步更新
- ✅ 无任何组件延迟变化（FOUC - Flash of Unstyled Content）
- ✅ View Transitions 动画流畅播放（支持浏览器）
- ✅ 不支持 View Transitions 的浏览器立即切换（无动画但不闪烁）

---

### 5. 响应式适配

#### 5.1 移动端（375px 宽度）
```tsx
<div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-6 py-12">
  <div className="w-full max-w-3xl">
```
- **横向边距**：`px-6`（24px）
- **纵向边距**：`py-12`（48px）
- **容器宽度**：`w-full`（375px - 48px = 327px）

**验证点**：
- ✅ 输入框左右有 24px 边距
- ✅ 按钮不超出屏幕边界
- ✅ 遮罩层覆盖输入框全宽
- ✅ 文本不换行（除非用户输入换行符）

#### 5.2 桌面端（1920px 宽度）
```tsx
<div className="w-full max-w-3xl">  {/* max-w-3xl = 768px */}
```
- **容器宽度**：最大 768px
- **居中显示**：`items-center justify-center`
- **左右留白**：(1920px - 768px) / 2 = 576px

**验证点**：
- ✅ 输入框居中显示，不占满全屏
- ✅ 最大宽度 768px，超出不扩展
- ✅ 左右留白对称

#### 5.3 Navbar 高度补偿
- **Navbar 高度**：`h-14`（56px = 3.5rem）
- **内容区偏移**：`pt-14`（MainApp 组件）
- **居中计算**：`min-h-[calc(100vh-3.5rem)]`

**验证标准**：
- ✅ 输入框垂直居中时不被 navbar 遮挡
- ✅ 滚动到顶部时内容不被 navbar 覆盖
- ✅ 在 DevTools 中切换不同设备尺寸时布局正常

---

## Implementation Notes

### 关键文件
1. **src/components/main-app/GenerateTab.tsx** - 主容器，负责状态管理和布局
2. **src/components/ui/auto-resize-textarea.tsx** - 输入框组件，处理高度调整
3. **src/components/ui/fade-mask.tsx** - 遮罩层组件
4. **src/components/ui/icon-button.tsx** - 按钮组件，处理状态切换
5. **src/components/main-app/AppNavbar.tsx** - 导航栏，包含主题切换器

### 测试覆盖
所有组件已有单元测试：
- `auto-resize-textarea.test.tsx` - 测试高度调整逻辑
- `segmented-control.test.tsx` - 测试 tab 切换
- `animated-theme-toggler.test.tsx` - 测试主题切换

### 性能考虑
- **useCallback**：`handleSubmit` 和 `adjustHeight` 使用 useCallback 避免重复创建
- **pointer-events-none**：FadeMask 不阻塞事件传递
- **CSS 变量**：主题切换仅触发 CSS 重绘，无需 React re-render

---

## Acceptance Criteria

### 功能测试
- [ ] **AC1**：输入 0-5 行文本时输入框逐行扩展，6 行以上出现滚动条
- [ ] **AC2**：空文本时按钮置灰不可点击，有文本时高亮可点击，提交中显示 Loader2
- [ ] **AC3**：遮罩层覆盖底部 80px，文本在按钮上方完全淡出
- [ ] **AC4**：点击主题切换器后所有组件颜色同步更新，无闪烁
- [ ] **AC5**：在 375px 和 1920px 宽度下布局正常，输入框居中显示

### 视觉测试
- [ ] **VC1**：Light 主题：输入框白色背景，黑色文字，黑色按钮
- [ ] **VC2**：Dark 主题：输入框深色背景，白色文字，白色按钮
- [ ] **VC3**：遮罩层渐变平滑，无明显色阶断层
- [ ] **VC4**：主题切换动画流畅（支持浏览器）

### 可访问性测试
- [ ] **A11Y1**：按钮包含 `aria-label="生成视频"`
- [ ] **A11Y2**：遮罩层包含 `aria-hidden="true"`
- [ ] **A11Y3**：输入框支持键盘操作（Tab 聚焦，Enter 提交）
- [ ] **A11Y4**：颜色对比度符合 WCAG AA 标准（通过 oklch 色彩空间保证）

### 性能测试
- [ ] **PERF1**：输入框高度调整无卡顿（< 16ms）
- [ ] **PERF2**：主题切换无 FOUC（Flash of Unstyled Content）
- [ ] **PERF3**：滚动遮罩层不触发重绘（position: absolute + pointer-events-none）

---

## Test Scenarios

### Scenario 1: 输入框扩展行为
```gherkin
Given 用户在 GenerateTab 页面
When 用户输入"第一行"
Then 输入框显示单行，高度约 56px
When 用户按 Enter 并输入"第二行"
Then 输入框扩展到两行，高度约 112px
When 用户继续输入到第 6 行
Then 输入框停止扩展，高度约 336px
When 用户继续输入第 7 行
Then 输入框高度不变，出现垂直滚动条
```

### Scenario 2: 按钮状态切换
```gherkin
Given 用户在 GenerateTab 页面
Then 按钮显示 Send 图标，状态为 disabled，颜色置灰
When 用户输入"测试文本"
Then 按钮状态变为 ready，颜色高亮
When 用户点击按钮
Then 按钮状态变为 pending，显示 Loader2 动画
When 服务器返回成功
Then 输入框清空，按钮恢复 disabled 状态，切换到 history tab
```

### Scenario 3: 遮罩层效果
```gherkin
Given 用户在 Light 主题
When 用户输入 5 行文本
Then 第 4-5 行文本开始淡出，按钮上方完全看不到文本
When 用户切换到 Dark 主题
Then 遮罩层颜色从白色渐变变为黑色渐变，文本淡出效果保持一致
When 用户输入第 7 行并滚动
Then 遮罩层固定在底部不随滚动，持续遮盖按钮上方文本
```

### Scenario 4: 主题联动
```gherkin
Given 用户在 Light 主题
Then navbar 白色半透明，输入框白色背景，按钮黑色
When 用户点击主题切换器
Then View Transitions 动画播放（圆形扩散）
And 所有组件颜色同步变为 Dark 主题
And navbar 黑色半透明，输入框深色背景，按钮白色
And 无任何组件延迟变化或闪烁
```

### Scenario 5: 响应式适配
```gherkin
Given 用户在桌面端（1920px 宽度）
Then 输入框居中显示，最大宽度 768px，左右留白对称
When 用户调整窗口到移动端宽度（375px）
Then 输入框宽度适应屏幕，左右各有 24px 边距
And 按钮位于输入框右下角，不超出屏幕
And 遮罩层覆盖输入框全宽
```

---

## Related Documentation

- **UI 实现规范**：`优化后的UI实现提示词.md`
- **验证报告**：`UI实现验证报告.md`
- **设计文档**：`openspec/changes/ep2-03-dashboard-page/design.md`
- **AutoResizeTextarea 规范**：`specs/auto-resize-textarea/spec.md`
- **主题系统规范**：`specs/theme-synchronization/spec.md`

---

## Notes

### 当前状态
根据 `UI实现验证报告.md`，所有核心功能已正确实现：
- ✅ 输入框布局与扩展逻辑
- ✅ 按钮状态管理与图标切换
- ✅ 遮罩层渐变效果
- ✅ 主题系统联动
- ✅ 响应式布局

### 已修复问题
- ✅ `src/app/page.tsx` 加载状态硬编码颜色（`bg-black` → `bg-background`）

### 待验证项
本 spec 的目的是提供完整的测试清单，确保所有交互行为在实际使用中符合预期。建议进行手动测试验证所有 Acceptance Criteria。

### 已知限制
部分 shadcn/ui 组件库组件使用硬编码颜色（如 `dialog.tsx` 的 `bg-black/10`），但不影响主应用功能。可在未来优化为 `bg-foreground/10`。
