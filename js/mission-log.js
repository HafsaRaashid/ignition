// Mission Log view. Owns its own feed parser — deliberately not shared
// with status-panel.js or telemetry-board.js. See design.md Key
// Decisions.

function parseLogFeed(feedText) {
  return feedText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, altitude, fuel, stage] = line.split('|');
      return {
        name,
        altitude: Number(altitude),
        fuel: Number(fuel),
        stage,
      };
    });
}

function renderMissionLog(container, feedText) {
  const records = parseLogFeed(feedText);
  container.innerHTML = records
    .map(
      (record) =>
        `<div class="log-line">[${record.altitude}m] ${record.name} — ${record.stage} (${record.fuel}% fuel)</div>`
    )
    .join('');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseLogFeed, renderMissionLog };
}
