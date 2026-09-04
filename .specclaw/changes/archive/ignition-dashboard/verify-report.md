# Verify Report: ignition-dashboard

**Date:** 2026-09-03
**Verifier:** specclaw:verify (strict QA pass)

## Summary

The app is dead on arrival in a real browser. `js/app.js`'s `SAMPLE_FEED`
contains a 6th, malformed line (`'Ghost-Probe|99.1|42'`, missing the
`Stage` field) that FR6 does not authorize. All three parsers normalize
`stage` with an unguarded `stage.trim().toUpperCase()`, which throws on
that line's `undefined` stage. The exception aborts `initApp` before any
view renders and before `initTabs` runs, so all three views are empty and
tab switching never initializes. Unit tests pass only because they feed
each parser a single well-formed line directly, never the full
`SAMPLE_FEED` array — so they never exercise the defect.

## Acceptance Criteria

- **AC1 — NOT MET.** "opening `index.html` shows all three views, switchable
  via tabs, all populated from the FR6 sample feed." Real browser load at
  `http://localhost:8731/` shows the header and tab buttons render, but
  all three view containers are empty. `initApp` throws inside
  `renderStatusPanel` (see console trace below) before `renderTelemetryBoard`,
  `renderMissionLog`, or `initTabs` ever execute — so tabs are unwired too.

- **AC2 — NOT MET.** "Status Panel shows 5 cards; Artemis-Lite and Zephyr
  show NO-GO ... the other three show GO." Zero cards render — the
  container is empty per direct browser observation, a direct consequence
  of the AC1 failure.

- **AC3 — NOT MET.** "Telemetry Board shows a 5-row table matching FR6
  exactly." Zero rows render — the container is empty, same root cause
  (execution never reaches `renderTelemetryBoard`).

- **AC4 — NOT MET.** "Mission Log shows 5 lines in the FR5 format." Zero
  lines render — the container is empty, same root cause (execution never
  reaches `renderMissionLog`).

- **AC5 — MET.** `parseStatusFeed("Falcon-9|82.4|76|BURN")`,
  `parseBoardFeed(...)`, and `parseLogFeed(...)` each return
  `{ name: "Falcon-9", altitude: 82.4, fuel: 76, stage: "BURN" }`, verified
  by `tests/parser.test.js`. `node --test tests/parser.test.js` reported
  3 tests, 3 pass, 0 fail. Note this AC only exercises a single well-formed
  line per parser — it does not exercise the full `SAMPLE_FEED`, which is
  why it stays green despite the app being broken.

- **AC6 — MET.** `node --test tests/parser.test.js` exits 0 (confirmed:
  exit code 0, 3/3 pass). The AC's own text already documents that the
  directory form `node --test tests/` doesn't work on this setup and
  specifies the explicit-file-path form instead — that form was used and
  passed as specified.

- **AC7 — NOT MET.** "no console errors on load in a browser." A real
  browser load produced an uncaught exception on load:
  ```
  [EXCEPTION] TypeError: Cannot read properties of undefined (reading 'trim')
      at js/status-panel.js:15:22
      at Array.map (<anonymous>)
      at parseStatusFeed (js/status-panel.js:9:6)
      at renderStatusPanel (js/status-panel.js:25:19)
      at HTMLDocument.initApp (js/app.js:33:3)
  ```

**Verdict:** FAIL

## Root Cause

Commit `24feeb0` ("seed: legacy defect") introduced two changes together:

1. `js/app.js` — appended a 6th line to `SAMPLE_FEED`:
   `'Ghost-Probe|99.1|42'`, which has only 3 pipe-delimited fields
   (`Stage` is missing). This directly violates **FR6**, which requires
   the sample feed to contain "exactly these 5 well-formed lines" (and
   lists them verbatim — `Ghost-Probe` is not among them).
2. `js/status-panel.js:15`, `js/telemetry-board.js:16`, and
   `js/mission-log.js:16` — each parser normalizes stage via
   `stage.trim().toUpperCase()` with no guard for a missing/undefined
   `stage`. On the short line, `stage` is `undefined`, so `.trim()`
   throws.

**On the Edge Cases / FR6 interaction:** the spec's Edge Cases section
says malformed feed lines are "explicitly out of scope for this change"
and that "no defensive handling ... is required" in the parsers. That
clause is real and it does excuse the parsers themselves from adding
guard code for malformed input — the unguarded `.trim()` calls are not,
by themselves, a spec violation. But that clause governs defensive
*handling inside the parsers*; it says nothing about what `app.js` may
ship in `SAMPLE_FEED`. FR6 is an independent, explicit, enumerated
requirement ("exactly these 5 well-formed lines") that the shipped
`SAMPLE_FEED` violates outright by carrying a 6th, malformed line. The
Edge Cases clause cannot be read to sanction an FR6 breach — it excuses
*how a parser reacts* to malformed input it might see, not *whether
app.js may feed it malformed input in the first place*. The FR6 breach
is the actual defect; the parsers' lack of defensive handling is a
faithful (and spec-sanctioned) implementation choice that only becomes
harmful because FR6 was violated.

## Failed Criteria

- **AC1 (FR1, FR7)** — `js/app.js:9` — remove the non-conforming
  `'Ghost-Probe|99.1|42'` line from `SAMPLE_FEED` so it matches FR6's
  exact 5-line feed.
- **AC2 (FR3)** — downstream of the above; also depends on
  `js/status-panel.js:15` not throwing once the feed is FR6-compliant.
- **AC3 (FR4)** — downstream of the above; also depends on
  `js/telemetry-board.js:16`.
- **AC4 (FR5)** — downstream of the above; also depends on
  `js/mission-log.js:16`.
- **AC7** — downstream of the above; the console exception at
  `js/status-panel.js:15:22` (propagating from `js/app.js:33:3`) must not
  occur on load.

Fixing `js/app.js:9` (the FR6 violation) alone is sufficient to clear
AC1–AC4 and AC7, since the three parsers correctly handle every
well-formed FR6 line as-is (proven by AC5/AC6). No change to the parsers
is required or implied by this report.

## Measurement Coverage

**Measured (real evidence):**
- Unit tests: `node --test tests/parser.test.js` run manually from repo
  root — exit code 0, 3/3 pass (AC5, AC6).
- Browser load: `index.html` served at `http://localhost:8731/` and
  loaded in real Chrome, with console monitored — all three view
  containers observed empty, one uncaught `TypeError` captured with full
  stack trace (AC1–AC4, AC7).
- Source/git inspection: `js/app.js`, `js/status-panel.js`,
  `js/telemetry-board.js`, `js/mission-log.js`, and commit `24feeb0`
  read directly to establish root cause and confirm FR6 non-compliance.

**Not measured / gaps to report honestly:**
- **specclaw `tests` gate:** `.specclaw/config.yaml` has
  `build.test_command`, `build.lint_command`, and `build.build_command`
  all empty. The configured gate therefore runs nothing and is trivially
  green — it provides no real signal. All test evidence above came from
  manually invoking the AC6 command, not from a configured gate.
- **E2E tier:** `build.e2e_command` is unset (`e2e_state: not_configured`).
  There is no automated e2e coverage for this change. This is reported as
  a **skip**, not a pass — the manual browser check above is real evidence
  but is not a substitute for a configured, repeatable e2e gate.
- **Code review:** `workflow.code_review` is `false` in config, so no
  code-review pass was run as part of this verification.
