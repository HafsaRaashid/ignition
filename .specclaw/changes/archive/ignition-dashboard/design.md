# Design: Ignition — Launch Telemetry Dashboard

**Change:** ignition-dashboard
**Created:** 2026-09-01

## Technical Approach

Plain HTML/CSS/JS, no build tooling, no dependencies. `index.html` loads
four scripts in order as classic (non-module) `<script>` tags —
`status-panel.js`, `telemetry-board.js`, `mission-log.js`, `app.js` —
each attaching its functions to the global scope. `app.js` owns the
sample feed (an in-memory array of strings, not fetched — keeps the page
fully working over `file://`) and wires a simple tab control that shows
one view container at a time, calling each view's `render*` function
against the same feed on load.

Classic scripts (not ES modules) are used specifically so the page works
when opened directly via `file://` — ES module imports are blocked by
CORS under `file://` in most browsers with no server involved, and this
app must run with zero server.

## Architecture

```
index.html
├── css/styles.css          — dark control-room theme, .go / .no-go colors
├── js/status-panel.js      — parseStatusFeed(), renderStatusPanel(el, lines)
├── js/telemetry-board.js   — parseBoardFeed(),  renderTelemetryBoard(el, lines)
├── js/mission-log.js       — parseLogFeed(),    renderMissionLog(el, lines)
└── js/app.js               — SAMPLE_FEED, tab wiring, calls the three render*()
```

Each `js/*-panel.js` / `*-board.js` / `*-log.js` file is self-contained:
its own parser, its own GO/NO-GO computation, its own render function.
None import from or call into each other. This is the one deliberate
piece of duplication in the codebase — see Key Decisions.

## File Changes Map

| File | Action | Description |
|------|--------|-------------|
| `index.html` | create | Page shell: tab nav (Status / Board / Log), three view containers, loads the four scripts + stylesheet |
| `css/styles.css` | create | Dark control-room theme; `.go`/`.no-go` classes (color + are always paired with visible text) |
| `js/status-panel.js` | create | `parseStatusFeed(feedText)` → array of `{name, altitude, fuel, stage}`; `renderStatusPanel(container, feedText)` renders one card per record with GO/NO-GO |
| `js/telemetry-board.js` | create | `parseBoardFeed(feedText)`; `renderTelemetryBoard(container, feedText)` renders the 5-column table |
| `js/mission-log.js` | create | `parseLogFeed(feedText)`; `renderMissionLog(container, feedText)` renders the log lines |
| `js/app.js` | create | `SAMPLE_FEED` constant (FR6's 5 lines), tab-switch logic, calls all three `render*()` on `DOMContentLoaded` |
| `tests/parser.test.js` | create | `node:test` + `assert` cases for `parseStatusFeed`, `parseBoardFeed`, `parseLogFeed` against AC5 |
| `README.md` | create | What this is, how to open it (`index.html` in a browser), how to run tests (`node --test tests/`) |

## Data Model Changes

No persistence. The only "model" is the parsed record shape, produced
independently by each of the three parsers:

```js
{ name: string, altitude: number, fuel: number, stage: string }
```

## API Changes

None — no backend, no network calls.

## Key Decisions

- **Three independent parsers instead of one shared module.** Normally
  this would be flagged as duplication to refactor away. Here it is
  intentional and documented (see spec.md Notes): it is the seam later
  demo changes use to show the same defect fixed three times and a
  pattern promoted after the third occurrence. A future change
  consolidating these three functions would remove that seam.
- **Classic scripts, not ES modules.** Keeps `file://` usage working with
  zero server — a demo-day requirement (nothing to fail to start).
- **Sample feed inlined in `app.js`, not fetched from a file.** Same
  `file://` reasoning — a `fetch()` of a local file is blocked by CORS
  under `file://` in most browsers.
- **`node:test` over a test framework.** Zero install, zero
  `package.json` dependency tree — `node --test tests/` just works on
  any machine with Node installed, which keeps the demo repo lightweight.
- **GO/NO-GO carries a text label, not just color.** Cheap accessibility
  win, and it also gives `/specclaw:verify` / future tests a text
  assertion to check instead of parsing CSS.

## Risks & Mitigations

- **Risk:** a future build agent "cleans up" the duplicated parsers into
  a shared module, silently removing the seam the demo depends on. —
  **Mitigation:** spec.md and this file both call it out explicitly as
  an intentional decision, not an oversight.
- **Risk:** malformed feed input isn't handled (see spec.md Edge Cases)
  — but that's by design for this change; not a risk to mitigate here.
