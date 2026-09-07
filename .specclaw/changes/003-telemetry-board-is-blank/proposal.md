# Proposal: Telemetry Board renders blank on malformed feed line

**Created:** 2026-09-07
**Status:** 🟡 Draft

## Problem

The Telemetry Board shows an empty table — no rows at all — and the browser
console reports `TypeError: Cannot read properties of undefined (reading
'trim')`.

Tracing it: `parseBoardFeed` in `js/telemetry-board.js` destructures each
pipe-delimited feed line into `name`, `altitude`, `fuel`, `stage` and calls
`stage.trim().toUpperCase()` unconditionally, with no guard on any of the
four fields. The sample feed includes a line with only three fields
(`Ghost-Probe|99.1|42` — no Stage), so `stage` comes back `undefined` and
the `.trim()` call throws. `init()` renders Status Panel first, so today
that view's own identical bug already halts the page before Telemetry
Board's parser even runs — but Telemetry Board carries the same unguarded
`.trim()` call independently, and will throw on its own the moment Status
Panel's copy of this bug is fixed.

## Proposed Solution

Guard the field access in `parseBoardFeed` the same way: index into the
split fields rather than destructure, default `name`/`stage` to an empty
string before normalising so a missing field can't reach `.trim()`
undefined, and default numeric fields (`altitude`, `fuel`) to a safe
fallback rather than `NaN`. Treat a missing/blank Stage as an explicit
`UNKNOWN` sentinel and make `isBoardGo` treat `UNKNOWN` as NO-GO.

## Scope

### In Scope
- `parseBoardFeed` in `js/telemetry-board.js` — guard all four field
  accesses against short/malformed lines.
- `isBoardGo` — treat the `UNKNOWN` sentinel as NO-GO.
- Regression tests in `tests/parser.test.js` for malformed/short rows.

### Out of Scope
- `js/status-panel.js` and `js/mission-log.js` — same bug shape, but each
  view owns its own parser and each is tracked as its own change.
- Any shared/unified feed parser across the three views.
- Changes to the feed format itself.

## Impact

- **Files affected:** 2 (estimated)
- **Complexity:** small
- **Risk:** low

## Open Questions

- Should a row with an `UNKNOWN` stage render distinctly in the table (e.g.
  a visibly different row style), or is folding it into NO-GO enough for now?

---

**To proceed:** Review this proposal and approve to begin planning.
