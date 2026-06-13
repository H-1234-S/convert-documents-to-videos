---
name: openspec-apply-change
description: Implement tasks from an OpenSpec change. Use when the user wants to start implementing, continue implementation, or work through tasks.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.4.0"
---

Implement tasks from an OpenSpec change.

**Input**: Optionally specify a change name. If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

**Steps**

1. **Select the change**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context if the user mentioned a change
   - Auto-select if only one active change exists
   - If ambiguous, run `openspec list --json` to get available changes and use the **AskUserQuestion tool** to let the user select

   Always announce: "Using change: <name>" and how to override (e.g., `/opsx:apply <other>`).

2. **Check status to understand the schema**
   ```bash
   openspec status --change "<name>" --json
   ```
   Parse the JSON to understand:
   - `schemaName`: The workflow being used (e.g., "spec-driven")
   - `planningHome`, `changeRoot`, and `actionContext`: planning scope and edit constraints
   - Which artifact contains the tasks (typically "tasks" for spec-driven, check status for others)

3. **Get apply instructions**

   ```bash
   openspec instructions apply --change "<name>" --json
   ```

   This returns:
   - `contextFiles`: artifact ID -> array of concrete file paths (varies by schema - could be proposal/specs/design/tasks or spec/tests/implementation/docs)
   - Progress (total, complete, remaining)
   - Task list with status
   - Dynamic instruction based on current state

   **Handle states:**
   - If `state: "blocked"` (missing artifacts): show message, suggest using openspec-continue-change
   - If `state: "all_done"`: congratulate, suggest archive
   - Otherwise: proceed to implementation

   **Workspace guard:** If status JSON reports `actionContext.mode: "workspace-planning"` and `allowedEditRoots` is empty, explain that full workspace apply is not supported in this slice. Treat linked repos and folders as read-only context, ask the user to select an affected area through an explicit implementation workflow, and STOP before editing files.

4. **Read context files**

   Read every file path listed under `contextFiles` from the apply instructions output.
   The files depend on the schema being used:
   - **spec-driven**: proposal, specs, design, tasks
   - Other schemas: follow the contextFiles from CLI output

5. **Show current progress**

   Display:
   - Schema being used
   - Progress: "N/M tasks complete"
   - Remaining tasks overview
   - Dynamic instruction from CLI

---

## 🛑 CHECKPOINT: BEFORE STARTING IMPLEMENTATION

**You are about to enter Step 6 (Implementation). STOP HERE.**

**Execute this mandatory checklist:**

```
[ ] Count remaining tasks (N = ?)
[ ] If N >= 3 independent tasks → Load `dispatching-parallel-agents` skill
[ ] If following a detailed plan → Load `executing-plans` skill  
[ ] For EACH task about to implement → Load `test-driven-development` skill
[ ] Confirm: No code will be written before tests are written
```

**Only proceed to Step 6 after completing this checklist.**

---

6. **Implement tasks (loop until done or blocked)**

   **⚠️ MANDATORY CHECK BEFORE ANY IMPLEMENTATION:**
   
   **STOP. You MUST check and load applicable Superpowers skills BEFORE writing ANY code:**
   
   1. **Count remaining tasks:**
      - If 3+ independent tasks exist → **INVOKE `dispatching-parallel-agents` skill NOW**
      - If following a detailed plan with subtasks → **INVOKE `executing-plans` skill NOW**
   
   2. **For each task you're about to implement:**
      - If implementing new functionality or fixing bugs → **INVOKE `test-driven-development` skill NOW**
      - **Write the test FIRST, then implement**
   
   **Do NOT proceed with implementation until you have loaded and followed the appropriate skill.**
   
   ---
   
   After loading required skills, for each pending task:
   - Show which task is being worked on
   - **Apply TDD workflow if implementing features** (write test first, then code)
   - Make the code changes required
   - Keep changes minimal and focused
   - Mark task complete in the tasks file: `- [ ]` → `- [x]`
   - Continue to next task

   **Pause and invoke skills if:**
   - Task is unclear → ask for clarification
   - Implementation reveals a design issue → suggest updating artifacts
   - **Bug/test failure/unexpected behavior encountered → STOP and invoke `systematic-debugging` skill**
   - **Runtime error or exception → STOP and invoke `systematic-debugging` skill**
   - User interrupts
   
   **After resolving issues via skills:**
   - Return to this workflow
   - Continue from where you paused

7. **On completion or pause, show status**

   Display:
   - Tasks completed this session
   - Overall progress: "N/M tasks complete"
   - If all done: **Invoke `verification-before-completion` skill, then suggest archive**
   - If paused: explain why and wait for guidance
   
   **Before claiming completion:**
   - Run tests to verify all passing
   - Check for regressions
   - Verify the implementation matches requirements

**Output During Implementation**

```
## Implementing: <change-name> (schema: <schema-name>)

Working on task 3/7: <task description>
[...implementation happening...]
✓ Task complete

Working on task 4/7: <task description>
[...implementation happening...]
✓ Task complete
```

**Output On Completion**

```
## Implementation Complete

**Change:** <change-name>
**Schema:** <schema-name>
**Progress:** 7/7 tasks complete ✓

### Completed This Session
- [x] Task 1
- [x] Task 2
...

All tasks complete! Ready to archive this change.
```

**Output On Pause (Issue Encountered)**

```
## Implementation Paused

**Change:** <change-name>
**Schema:** <schema-name>
**Progress:** 4/7 tasks complete

### Issue Encountered
<description of the issue>

**Options:**
1. <option 1>
2. <option 2>
3. Other approach

What would you like to do?
```

**Guardrails**
- Keep going through tasks until done or blocked
- Always read context files before starting (from the apply instructions output)
- If task is ambiguous, pause and ask before implementing
- If implementation reveals issues, pause and suggest artifact updates
- Keep code changes minimal and scoped to each task
- Update task checkbox immediately after completing each task
- **CRITICAL: On any error, bug, or test failure → immediately invoke `systematic-debugging` skill**
- **CRITICAL: Before claiming "done" → invoke `verification-before-completion` skill**
- Use contextFiles from CLI output, don't assume specific file names

**Superpowers Integration**
This skill integrates with the Superpowers skill system:
- **Pre-implementation**: Check for `test-driven-development`, `dispatching-parallel-agents`, `executing-plans`
- **During implementation**: Auto-invoke `systematic-debugging` on any error/failure
- **Post-implementation**: Auto-invoke `verification-before-completion` before marking complete
- **Never guess or skip skill invocation** - if a scenario matches, the skill MUST be loaded

**Fluid Workflow Integration**

This skill supports the "actions on a change" model:

- **Can be invoked anytime**: Before all artifacts are done (if tasks exist), after partial implementation, interleaved with other actions
- **Allows artifact updates**: If implementation reveals design issues, suggest updating artifacts - not phase-locked, work fluidly
