# Spec: Ignition — Launch Telemetry Dashboard

**Change:** ignition-dashboard
**Created:** 2026-09-01
**Status:** 🟢 Ready

## Overview

A static, zero-dependency, zero-backend web page that renders a hardcoded
launch telemetry feed into three independent views — Status Panel,
Telemetry Board, Mission Log — each with its own dedicated parser for the
feed, rather than a single shared parsing module. This duplication is
intentional (see Notes) and is core to why this app exists: it is a demo
fixture for showing specclaw fix an identical defect across three
call sites and promote it to a learned pattern.

**Feed format:** each line is `Name|Altitude|Fuel|Stage`, pipe-delimited.
`Altitude` is meters (number). `Fuel` is percent, 0–100 (number). `Stage`
is one of `BURN`, `COAST`, `STAGE-SEP`, `ABORT`.

**GO/NO-GO rule** (used identically by all three views): a rocket is
**NO-GO** (red) if `Stage === "ABORT"` OR `Fuel < 10`; otherwise **GO**
(green).

## Requirements

### Functional Requirements

- **FR1:** `index.html` shows three views — Status Panel, Telemetry
  Board, Mission Log — switchable via a tab control. All three read from
  the same in-memory sample feed (defined once in `js/app.js`, not
  fetched over the network).
- **FR2:** Each view parses the feed via its own dedicated function —
  `parseStatusFeed` (in `js/status-panel.js`), `parseBoardFeed` (in
  `js/telemetry-board.js`), `parseLogFeed` (in `js/mission-log.js`) —
  each independently splitting `Name|Altitude|Fuel|Stage` into a record
  `{ name, altitude, fuel, stage }`. No shared parser module.
- **FR3 — Status Panel:** one card per rocket, showing name, and a
  GO/NO-GO indicator that is both a color (green/red) and a text label
  ("GO"/"NO-GO") — never color alone.
- **FR4 — Telemetry Board:** one table row per rocket with columns Name,
  Altitude (m), Fuel (%), Stage, Status (GO/NO-GO, same rule as FR3).
- **FR5 — Mission Log:** one line per rocket, format
  `[{altitude}m] {name} — {stage} ({fuel}% fuel)`, e.g.
  `[82.4m] Falcon-9 — BURN (76% fuel)`.
- **FR6:** the sample feed (in `js/app.js`) contains exactly these 5
  well-formed lines:
  ```
  Falcon-9|82.4|76|BURN
  Starhopper|140.2|54|COAST
  Artemis-Lite|12.8|8|ABORT
  Comet-One|301.5|61|STAGE-SEP
  Zephyr|45.0|4|BURN
  ```
  (Artemis-Lite is NO-GO via `ABORT`; Zephyr is NO-GO via low fuel despite
  `BURN`; the other three are GO — giving visible red/green contrast.)
- **FR7:** opening `index.html` directly in a browser (via `file://`, no
  server, no build step) renders all three views correctly.

### Non-Functional Requirements

- **NFR1:** no external libraries, frameworks, or CDN scripts — vanilla
  HTML/CSS/JS, plain (non-module) `<script>` tags.
- **NFR2:** no backend, server, network fetch, or persistence of any
  kind.
- **NFR3:** dark, high-contrast "control room" visual style; GO/NO-GO
  always carries a text label alongside color (accessibility).
- **NFR4:** parser functions are unit-testable via Node's built-in
  `node:test` + `assert` — no test framework dependency. `node --test
  tests/` runs them.

## Acceptance Criteria

- **AC1:** opening `index.html` shows all three views, switchable via
  tabs, all populated from the FR6 sample feed. `[real]`
- **AC2:** Status Panel shows 5 cards; Artemis-Lite and Zephyr show
  NO-GO (red + "NO-GO" text); the other three show GO (green + "GO"
  text). `[real]`
- **AC3:** Telemetry Board shows a 5-row table matching FR6 exactly,
  including a Status column applying the same GO/NO-GO rule. `[real]`
- **AC4:** Mission Log shows 5 lines in the FR5 format, one per FR6
  rocket. `[real]`
- **AC5:** `parseStatusFeed("Falcon-9|82.4|76|BURN")` (and the
  equivalent `parseBoardFeed` / `parseLogFeed` calls) each return `{
  name: "Falcon-9", altitude: 82.4, fuel: 76, stage: "BURN" }` —
  verified by unit tests in `tests/parser.test.js`. `[real]`
- **AC6:** `node --test tests/parser.test.js` exits 0. `[real]`
  (the directory form `node --test tests/` failed to discover the file
  on the Node 24/Windows setup this was built on — the explicit file
  path is used everywhere instead.)
- **AC7:** no console errors on load in a browser. `[real]`

## Edge Cases

- **Malformed feed lines are explicitly out of scope for this change.**
  All three parsers assume well-formed `Name|Altitude|Fuel|Stage` input
  matching FR6 — no defensive handling of missing fields, extra
  delimiters, or non-numeric values is required here. This is
  intentional: later demo changes will introduce and then fix exactly
  this class of defect (see Notes).
- An empty feed (no lines) renders each view's container empty, without
  throwing.

## Dependencies

None — greenfield change, no external services, no other specclaw
changes.

## Notes

This app exists to be used *live* in a specclaw feature demo (ticket
sync, autonomous loop, cross-change pattern learning), not as production
software. The three-independent-parsers design (FR2) is deliberate: a
future change will seed the same missing-input-validation defect into
one parser, fix it via `/specclaw:loop`, then have the identical defect
"discovered" in the other two parsers to demonstrate `/specclaw:patterns`
recording 3 occurrences and promoting a prevention rule. Do not
consolidate the three parsers into a shared module — that would remove
the seam the later demo needs.

No specclaw config (Jira/Azure Boards sync, loop tuning, test/lint/build
commands) is wired by this change — that is left for a live walkthrough.
