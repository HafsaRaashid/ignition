# Learnings: ignition-dashboard

Build learnings, spec gaps, and patterns discovered.

**Categories:** spec_gap | design_gap | pattern | best_practice | agent_issue

---

## [L1] best_practice — node --test <dir>/ (directory form) failed to discover te...

**When:** 2026-09-01 12:48 UTC
**Category:** best_practice
**Priority:** medium
**Status:** pending

### Detail
node --test <dir>/ (directory form) failed to discover tests/parser.test.js on this Node 24 / Windows setup, in both git-bash and PowerShell, with 'Cannot find module <dir>'. The explicit file path 'node --test tests/parser.test.js' works reliably.

### Action
Always invoke node --test with an explicit file (or glob) path on this machine, not a bare directory, until confirmed fixed upstream.

---
