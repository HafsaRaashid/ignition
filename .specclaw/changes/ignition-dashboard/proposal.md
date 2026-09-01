# Proposal: Ignition — Launch Telemetry Dashboard

**Created:** 2026-09-01
**Status:** 🟢 Approved

## Problem

We need a small, self-contained demo application to showcase specclaw's
ticket sync (Jira/Azure Boards), autonomous loop, and cross-change pattern
learning live. No such app exists yet, and a real production codebase is
too large/slow to iterate on live in front of an audience.

## Proposed Solution

Build "Ignition" — a static, dependency-free mission-control style launch
telemetry dashboard (HTML/CSS/JS, no backend). It renders a small feed of
telemetry lines (rocket name, altitude, fuel %, stage status) into a
control-room UI with red/green go/no-go indicator lights per panel.

The dashboard exposes the same telemetry feed through three independent
views, each with its own render/parse path:

- **Status Panel** (`renderStatusPanel`) — one card per rocket with a
  go/no-go light.
- **Telemetry Board** (`renderTelemetryBoard`) — a full grid of every
  metric across all rockets.
- **Mission Log** (`renderMissionLog`) — a compact scrolling log view of
  the same feed.

Each view parses the same `"Name|Altitude|Fuel|Stage"` feed format
independently — this parallel-path structure is deliberate groundwork for
a later demo of cross-change learning (a bug fixed in one view can recur
in the others).

## Scope

### In Scope
- Static `index.html` + CSS for a dark control-room look, no build step.
- A telemetry feed parser and the three render functions above.
- A small sample feed (`data/telemetry-feed.txt` or inline) with a mix of
  well-formed and edge-case lines for future test seeding.
- A handful of unit tests for the parser/render logic (plain JS, runnable
  via `node` — no test framework dependency).
- A `README.md` explaining how to open/run it locally.

### Out of Scope
- Any backend, server, database, or persistence layer.
- Real launch/telemetry data or external APIs.
- Animation/transition polish beyond basic CSS.
- Any specclaw config wiring (Jira/Azure Boards credentials, loop tuning)
  — left untouched for a live walkthrough.

## Impact

- **Files affected:** ~6 (estimated)
- **Complexity:** small
- **Risk:** low

## Open Questions

None — visual styling details are left to build-agent discretion within
the "dark control room, red/green status lights" brief above.

---

**To proceed:** Review this proposal and approve to begin planning.
