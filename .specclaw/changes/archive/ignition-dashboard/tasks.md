# Tasks: Ignition — Launch Telemetry Dashboard

**Change:** ignition-dashboard
**Created:** 2026-09-01
**Total Tasks:** 7

## Summary

7 tasks across 2 waves. Wave 1 builds the page shell/styling and the
three independent view modules (parallelizable — no file overlaps, no
inter-dependencies). Wave 2 wires them together with the sample feed,
adds unit tests for the three parsers, and documents how to run it.

## Tasks

### Wave 1 — Shell & independent view modules

- [x] `T1` — Page shell and control-room styling
  - Files: `index.html`, `css/styles.css`
  - Estimate: small
  - Kind: impl
  - Notes: tab nav for Status Panel / Telemetry Board / Mission Log, one
    container `<div>` per view (only the active one visible), loads
    `status-panel.js`, `telemetry-board.js`, `mission-log.js`, `app.js`
    as plain (non-module) `<script>` tags in that order, plus
    `styles.css`. Dark theme; `.go`/`.no-go` classes per design.md, each
    always paired with visible "GO"/"NO-GO" text (NFR3).

- [x] `T2` — Status Panel view
  - Files: `js/status-panel.js`
  - Estimate: small
  - Kind: impl
  - Notes: `parseStatusFeed(feedText)` splits `Name|Altitude|Fuel|Stage`
    lines into `{name, altitude, fuel, stage}` records (numbers parsed
    as numbers). `renderStatusPanel(container, feedText)` renders one
    card per record with the GO/NO-GO rule from spec.md (`Stage ===
    "ABORT"` or `fuel < 10` → NO-GO/red, else GO/green), text label
    included. No dependency on the other two view files.

- [x] `T3` — Telemetry Board view
  - Files: `js/telemetry-board.js`
  - Estimate: small
  - Kind: impl
  - Notes: `parseBoardFeed(feedText)`, same record shape as T2 but its
    own independent implementation (do not import T2's parser — see
    design.md Key Decisions). `renderTelemetryBoard(container,
    feedText)` renders a table: Name, Altitude (m), Fuel (%), Stage,
    Status columns, one row per record.

- [x] `T4` — Mission Log view
  - Files: `js/mission-log.js`
  - Estimate: small
  - Kind: impl
  - Notes: `parseLogFeed(feedText)`, own independent implementation
    (same caveat as T3). `renderMissionLog(container, feedText)` renders
    one line per record: `[{altitude}m] {name} — {stage} ({fuel}% fuel)`.

### Wave 2 — Wiring, tests, docs

- [x] `T5` — Wire the app: sample feed + tab switching
  - Files: `js/app.js`
  - Estimate: small
  - Kind: impl
  - Depends: T1, T2, T3, T4
  - Notes: defines `SAMPLE_FEED` as the 5 lines from spec.md FR6 (a
    template literal or array of strings, joined as needed by each
    parser). On `DOMContentLoaded`, calls `renderStatusPanel`,
    `renderTelemetryBoard`, `renderMissionLog` against `SAMPLE_FEED` and
    wires the tab buttons from T1 to toggle which container is visible.

- [x] `T6` — Parser unit tests
  - Files: `tests/parser.test.js`
  - Estimate: small
  - Kind: test
  - Depends: T2, T3, T4
  - Notes: `node:test` + `assert`. One case per parser asserting
    `parseXFeed("Falcon-9|82.4|76|BURN")` returns `{name: "Falcon-9",
    altitude: 82.4, fuel: 76, stage: "BURN"}` (AC5). Run via `node
    --test tests/` (AC6).

- [x] `T7` — README
  - Files: `README.md`
  - Estimate: small
  - Kind: docs
  - Depends: T5
  - Notes: what this app is (one line — a specclaw demo fixture, not
    production code), how to open it (`index.html` in a browser, no
    server needed), how to run tests (`node --test tests/`).

---

## Legend

- `[ ]` Pending
- `[~]` In Progress
- `[x]` Complete
- `[!]` Failed
