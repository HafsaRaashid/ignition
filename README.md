# Ignition — Launch Telemetry Dashboard

A small, dependency-free "mission control" dashboard built with
[specclaw](https://github.com/PasanGunathilaka/specclaw). It's a demo
fixture — not production software — used to show specclaw's ticket sync,
autonomous loop, and cross-change pattern-learning features live.

## Run it

Just open `index.html` in a browser. No server, no build step, no
install.

## Run the tests

```
node --test tests/parser.test.js
```

Requires Node.js (no other dependencies). Note: use the explicit file
path, not `node --test tests/` — directory-based test discovery didn't
find the file on the Node 24/Windows setup this was built on.

## What it is

Three views over the same hardcoded telemetry feed
(`Name|Altitude|Fuel|Stage`), switchable via tabs:

- **Status Panel** — one card per rocket with a GO/NO-GO indicator.
- **Telemetry Board** — a full table of every metric.
- **Mission Log** — a compact log-line view.

Each view parses the feed with its own independent function
(`js/status-panel.js`, `js/telemetry-board.js`, `js/mission-log.js`) —
this is intentional duplication, not an oversight. It's the seam later
demo changes use to introduce and fix the same defect across all three
views. See `.specclaw/changes/ignition-dashboard/spec.md` and
`design.md` for the full rationale.
