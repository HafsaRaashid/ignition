# SpecClaw — Ticket Sync, Cross-Change Learning & Autonomy

**Plugin:** `specclaw@chan4lk` **0.6.7**
**Repo:** `ignition` (local only, no remote) · branch `main`
**Runtime:** ~29 min · 3 acts

### What this demo proves

1. **Ticket Sync** — a proposal becomes a real Jira issue, and re-running never duplicates it.
2. **Autonomy** — the loop drives a red gate to green on its own, without letting the agent cheat.
3. **Cross-Change Learning** — the same bug hit three times becomes a prevention rule the repo keeps.

---

## Preflight — verify everything from scratch (~10 min, off-screen)

Run every step. Do not assume prior state; that is what this section is for.

### 1. Plugin is installed and current

```bash
claude plugin list
```

Expect `specclaw@chan4lk` · **0.6.7** · enabled.

### 2. The seeded bug is intact — do not fix it yet

```bash
grep -n 'stage.trim().toUpperCase()' js/*.js
grep -n 'Ghost-Probe' js/app.js
```

Expect exactly three unguarded call sites and one malformed feed line:

```
js/mission-log.js:16:        stage: stage.trim().toUpperCase(),
js/status-panel.js:15:        stage: stage.trim().toUpperCase(),
js/telemetry-board.js:16:        stage: stage.trim().toUpperCase(),
js/app.js:9:  'Ghost-Probe|99.1|42',
```

`Ghost-Probe|99.1|42` has 3 fields and no Stage, so `stage` is `undefined` and `.trim()` throws.
Same bug, three places. That repetition is the entire point of Act 3.

```

### 4. Reconcile STATUS.md

`STATUS.md` can list proposals whose directories no longer exist. A stale dashboard on screen in
Act 3 makes `/specclaw:auto` look broken when it is working correctly.

```bash
specclaw-reconcile .specclaw
/specclaw:status
```

Pending Proposals must read `_None._` before you pre-stage.

### 5. Confirm the autonomy switches

```bash
grep -A6 '^automation:' .specclaw/config.yaml   # auto_verify: true, max_tasks_per_run: 5
grep -A2 '^loop:' .specclaw/config.yaml         # enabled: true
grep -A3 '^build:' .specclaw/config.yaml        # test_command points at the parser suite
```

### 6. Tests pass — and the app is still broken

```bash
node --test tests/parser.test.js
```

Expect **3 pass, 0 fail**. The suite only covers well-formed lines, so it never touches the bug.

Now open `index.html` in a browser. **All three panels are blank.** Console:

```
TypeError: Cannot read properties of undefined (reading 'trim')
```

`init()` calls `renderStatusPanel` → `renderTelemetryBoard` → `renderMissionLog` in sequence.
The first one throws on `Ghost-Probe|99.1|42`, so the other two never run. One malformed line
takes down the whole dashboard.

Keep both windows open — the green test output and the dead app side by side. That contrast
is the opening beat of Act 1.

### 7. Pre-stage changes 2 and 3 — proposals only

So you never type the same story three times live:

```
/specclaw:propose  →  "the Status Panel is blank, nothing shows up"
/specclaw:propose  →  "the Telemetry Board is blank, nothing shows up"
```

Name the view and the symptom, nothing more. No file paths, no function names — let SpecClaw find
them. That it locates the right parser from a plain complaint is part of what you are showing.

Leave both at **proposed**. Do not plan or build them — `/specclaw:auto` does that live in Act 3.

### 8. Working tree is clean

```bash
git status --porcelain
```

Only `.specclaw/` bookkeeping should be dirty. `.specclaw/.env` must **not** appear.

---

## Act 1 — Ticket Sync (~7 min)

0. **Open on the broken application.** Before typing a single command:

   - Browser: `index.html` — all three panels blank, console throwing on `.trim()`
   - Terminal: `node --test tests/parser.test.js` — **3 pass, 0 fail**

   **The line:** *"The tests are green. The application is dead. One malformed line in the
   feed took out all three views, and nothing in CI would have told us."*

   That is the problem this demo starts from.

   set up jira using /auth-jira

1. **Propose change 1.**

   ```
   /specclaw:propose  →  "the Mission Log is blank, nothing shows up"
   ```

   A bug report, not a spec. No file, no function, no stack trace, no theory about the cause —
   the user does not know there is a feed, let alone a malformed row in it.

   Show the generated `.specclaw/changes/<slug>/proposal.md` — problem, solution, scope, impact.

2. **`/specclaw:issue`** → creates the Jira issue from `proposal.md`.
   Switch to Jira and show it live: summary and description came straight from the proposal.

3. **Open `.specclaw/changes/<slug>/status.md`** — the tracker link is recorded against the change.

4. **Prove idempotency.** Re-run it live:

   ```
   /specclaw:issue
   ```

   No second ticket. It recognises the existing issue and updates rather than duplicating.

   **The line:** *"The proposal is the source of truth. The ticket is a projection of it."*

---

## Act 2 — Autonomy: the loop (~10 min)

1. **`/specclaw:plan`** on change 1 → `spec.md`, `design.md`, `tasks.md`.

2. **`/specclaw:build`** → the agent guards `parseLogFeed`.

   No existing test covers malformed input, so the build writes new ones. That is worth saying
   out loud — the coverage gap is why the bug shipped.

   **Deliberately leave a gate red.** Steer it to handle only the *missing* field and not the
   *empty* one — `"BURN|1|2|"` (4 fields, stage is `""`) versus `"Ghost-Probe|99.1|42"`
   (3 fields, stage is `undefined`). It writes the test for the empty case and leaves it failing.

3. **`/specclaw:verify`** once → seeds `verify-report.md` with the known-red gate.
   Show the failing gate on screen before starting the loop.

4. **`/specclaw:loop`** → narrate each turn:

   ```
   gate eval → reflect → smallest-diff fix → reward-hack guard → re-verify → loopback
   ```

   The **reward-hack guard** is the beat that lands: it checks the agent didn't simply delete or
   weaken the failing test to reach green. `guard_action: revert-tests` reverts it if it did.

5. **Open `.specclaw/changes/<slug>/loop-log.md`** — walk it turn by turn to `all_green`.

---

## Act 3 — Cross-Change Learning (~12 min)

1. **`/specclaw:patterns list`** → empty, or 1 occurrence from change 1's build.
   Establish the "before" on screen.

2. **`/specclaw:auto`** → reads `STATUS.md`, finds changes 2 and 3 at **proposed**, and advances
   each through plan → build → verify unattended, honouring `max_tasks_per_run: 5`.
   Narrate it working the queue with no input from you.

3. **Each build hits the identical bug shape.** After each:

   ```bash
   specclaw-detect-patterns .specclaw scan <change-slug>
   ```

4. **`/specclaw:patterns list`** again → the pattern

   > *unguarded field before `.trim()` / `.toUpperCase()` on a pipe-delimited parse*

   now shows **3 occurrences**, flagged ⚠️.

5. **Promote it:**

   ```bash
   specclaw-detect-patterns .specclaw promote <pat-id>
   ```

   That writes the prevention rule to **`.specclaw/knowledge/agent-hints.md`** — in *this repo*,
   never into the plugin. Show the diff live.

   **The payoff line:** *"The plugin never changes. The repo got smarter."*

6. **Reload `index.html`.** All three panels now render, `Ghost-Probe` included.

   Act 1's fix alone was not enough — `renderStatusPanel` still threw first and blanked the page.
   Only now that all three parsers are guarded does the dashboard come back.

   **The line:** *"Same bug, three files. Fixing one changed nothing on screen."*

---

**Reset between rehearsals:**

```bash
git checkout .specclaw/STATUS.md
rm -rf .specclaw/changes/<slug>
git checkout js/           # only if a build actually modified the seeded files
```

Do **not** `git checkout .specclaw/config.yaml` — it holds your uncommitted Jira credentials.
