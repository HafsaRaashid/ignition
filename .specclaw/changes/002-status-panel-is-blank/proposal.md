# Proposal: Status Panel renders blank on malformed feed line

**Created:** 2026-09-07
**Status:** 🟡 Draft

## Problem

The Status Panel shows no cards at all — the container is empty, and the
browser console reports `TypeError: Cannot read properties of undefined
(reading 'trim')`.

Tracing it: `parseStatusFeed` in `js/status-panel.js` destructures each
pipe-delimited feed line into `name`, `altitude`, `fuel`, `stage` and calls
`stage.trim().toUpperCase()` unconditionally. The sample feed includes a
line with only three fields (`Ghost-Probe|99.1|42` — no Stage), so `stage`
comes back `undefined` and the `.trim()` call throws. Because `init()` calls
`renderStatusPanel` before the other two views, the uncaught exception halts
the whole render sequence — Telemetry Board and Mission Log never get a
chance to run either, so all three panels end up blank even though only
Status Panel's parser is at fault.

## Proposed Solution

Guard the field access in `parseStatusFeed` so a missing (or blank) Stage
field resolves to an explicit `UNKNOWN` sentinel instead of leaving it
`undefined`, and treat `UNKNOWN` as NO-GO in `isStatusGo` rather than letting
it slip through as neither ABORT nor a real stage. Same malformed input,
no crash, and the row still renders with an honest status instead of being
silently dropped.

## Scope

### In Scope
- `parseStatusFeed` in `js/status-panel.js` — guard the Stage (and other)
  field access against short/malformed lines.
- `isStatusGo` — treat the `UNKNOWN` sentinel as NO-GO.
- Regression tests in `tests/parser.test.js` for malformed/short rows.

### Out of Scope
- `js/telemetry-board.js` and `js/mission-log.js` — same bug shape, but
  each view owns its own parser and is out of scope for this change.
- Any shared/unified feed parser across the three views.
- Changes to the feed format itself.

## Impact

- **Files affected:** 2 (estimated)
- **Complexity:** small
- **Risk:** low

## Open Questions

- Should a row with an `UNKNOWN` stage render distinctly in the UI (e.g. a
  visibly different card style), or is folding it into NO-GO enough for now?

---

**To proceed:** Review this proposal and approve to begin planning.
