<!-- intent-skills:start -->
## Skill Loading

Before substantial work:
- Skill check: run `npx @tanstack/intent@latest list`, or use skills already listed in context.
- Skill guidance: if one local skill clearly matches the task, run `npx @tanstack/intent@latest load <package>#<skill>` and follow the returned `SKILL.md`.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

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
