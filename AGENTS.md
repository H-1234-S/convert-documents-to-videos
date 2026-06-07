<!-- intent-skills:start -->
## Skill Loading

Before implementation:

* Run `npx @tanstack/intent@latest list` to discover available skills.
* Load the most relevant skill with `npx @tanstack/intent@latest load <package>#<skill>`.
* Follow the loaded `SKILL.md` throughout the task.
* In monorepos, prefer package-specific skills over workspace-wide skills.
* If multiple skills match, choose the most specific one and load additional skills only when required.
* Do not begin implementation until skill discovery and loading are complete.

<!-- intent-skills:end -->

<!-- SUPERPOWERS-AUTO-LOADING:START -->
## Superpowers 自动加载协议

**核心原则：在所有关键决策点，必须检查并加载相关的 Superpowers 技能，将工程化最佳实践融入每个工作流。**

### 场景触发规则

以下场景**必须**自动检查并加载对应技能，不可跳过或猜测：

| 工作场景 | 触发条件 | 必须加载的技能 | 加载时机 |
|---------|---------|--------------|----------|
| **规划阶段** | 有 spec/需求，准备实现多步骤任务（3+ 步骤） | `writing-plans` | 在开始实现**之前** |
| **创意设计** | 设计新功能、架构决策、探索方案 | `brainstorming` | 在做设计决策**之前** |
| **功能实现** | 开始实现新功能或修复 bug | `test-driven-development` | 在写代码**之前** |
| **Bug/失败** | 测试失败、运行报错、行为异常、预期不符 | `systematic-debugging` | 立即暂停当前工作 |
| **多任务并行** | 2+ 个独立任务，无依赖关系 | `dispatching-parallel-agents` | 在派发任务**之前** |
| **执行计划** | 已有详细的实现计划 | `executing-plans` | 在开始执行**之前** |
| **计划中的独立任务** | 计划中有可独立执行的子任务 | `subagent-driven-development` | 在派发 subagent **之前** |
| **完成验证** | 声称"完成"、"修好"、"测试通过" | `verification-before-completion` | 在声明完成**之前** |
| **发起 PR** | 准备创建 Pull Request | `requesting-code-review` | 在创建 PR **之前** |
| **处理 Review** | 收到代码审查反馈 | `receiving-code-review` | 在修改代码**之前** |
| **合并分支** | 实现完成，准备合并到主分支 | `finishing-a-development-branch` | 在合并**之前** |
| **隔离环境** | 大型重构、实验性功能、风险较高的修改 | `using-git-worktrees` | 在开始工作**之前** |

### 强制执行规则

1. **遇到 Bug/错误必须立即停止**
   - 任何测试失败、运行时错误、异常、行为不符预期
   - **立即暂停**当前技能/工作流
   - **立即加载** `systematic-debugging` 技能
   - 完成调试后才能返回原工作流
   - **绝不猜测、绝不跳过**

2. **完成前必须验证**
   - 任何声称"完成"、"修好了"、"测试通过"的场景
   - **必须先加载** `verification-before-completion` 技能
   - 运行测试、检查回归、验证需求
   - 验证通过后才能声明完成

3. **实现前必须规划**
   - 多步骤任务（3+ 步骤）、架构性修改、跨文件修改
   - **必须先加载** `writing-plans` 或 `brainstorming` 技能
   - 获得用户批准后再开始实现

4. **技能之间的协作**
   - 当前技能遇到需要另一个技能的场景时：
     - 暂停当前技能
     - 明确告知用户"正在加载 X 技能处理 Y 场景"
     - 加载并完成所需技能
     - 返回原技能继续工作

### 红旗清单

以下想法表明你**正在违反协议**，必须停下来加载技能：

| 危险想法 | 正确做法 |
|---------|---------|
| "这个错误很简单，我直接修" | **停止** → 加载 `systematic-debugging` |
| "我知道问题在哪，改一下就好" | **停止** → 加载 `systematic-debugging` |
| "测试通过了，完成了" | **停止** → 加载 `verification-before-completion` |
| "代码写完了，可以提交" | **停止** → 加载 `verification-before-completion` |
| "我先写代码，测试稍后补" | **停止** → 加载 `test-driven-development` |
| "这几个任务我一起做" | **停止** → 检查是否需要 `dispatching-parallel-agents` |
| "我按计划一个个做" | **停止** → 加载 `executing-plans` |
| "我理解 review 意见了，开始改" | **停止** → 加载 `receiving-code-review` |

### 技能优先级

当多个技能都适用时，按以下优先级加载：

1. **流程技能**（决定如何工作）
   - `brainstorming`, `writing-plans`, `systematic-debugging`
   
2. **执行技能**（指导具体实现）
   - `test-driven-development`, `executing-plans`, `subagent-driven-development`
   
3. **验证技能**（确保质量）
   - `verification-before-completion`, `requesting-code-review`, `receiving-code-review`

### 违规后果

如果 Claude 在以下场景中**未加载**相应技能：
- 遇到错误却直接修改代码 → 用户应指出"你应该先加载 systematic-debugging"
- 声称完成却未验证 → 用户应指出"你应该先加载 verification-before-completion"
- 开始实现却未规划 → 用户应指出"你应该先加载 writing-plans"

Claude 必须：
1. 承认违反了协议
2. 立即停止当前工作
3. 加载正确的技能
4. 重新开始该阶段的工作

### 与其他指令的关系

优先级顺序：
1. **用户的显式指令**（CLAUDE.md, GEMINI.md, AGENTS.md, 直接请求） — 最高优先级
2. **本协议（Superpowers 自动加载）** — 覆盖默认系统行为
3. **默认系统提示** — 最低优先级

如果用户明确说"不要用 TDD"，则遵从用户指令。但如果用户未明确反对，**必须**遵守本协议。

<!-- SUPERPOWERS-AUTO-LOADING:END -->

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- GENERAL CODING GUIDELINES START -->
# Jo's Thought Imprint

1. Fail fast and loudly: Do not write fallback logic unless it is explicitly required.
2. Let exceptions/errors bubble up early: Do not handle errors inside business layers.
3. Valid test: Prove a bug/problem exists by failing it. Only write tests that will passprove nothing.
4. Add comments to externally exposed types, interfaces, functions, and classes, and add functional comments on key logic branches.
5. Reuse utility functions from `utils` whenever possible. If a common function does not exist but can be extracted for reuse, add it to `utils` and reuse it there.
6. When writing unit tests, mirror the source code directory structure strictly. Each unit test file must only test the corresponding source file's functionality.
7. Always use source types from the owning library/module. Do not create local duplicate types or cast values to local stand-in types just to solve TypeScript issues.
8. Avoid abstraction layers that do not simplify the code or preserve a real boundary. Prefer calling the owning module/service directly over passing broad wrapper objects through layers.
9. Do not write explicit function return types unless TypeScript cannot infer them correctly or the annotation is required to preserve a public contract.
10. Do not extract one-off helper functions unless they preserve a real boundary, hide meaningful complexity, or are expected to be reused. Prefer inlining simple single-use logic.
<!-- GENERAL CODING GUIDELINES END -->
