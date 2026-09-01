// Status Panel view. Owns its own feed parser — deliberately not shared
// with telemetry-board.js or mission-log.js. See design.md Key Decisions.

function parseStatusFeed(feedText) {
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

function isStatusGo(record) {
  return record.stage !== 'ABORT' && record.fuel >= 10;
}

function renderStatusPanel(container, feedText) {
  const records = parseStatusFeed(feedText);
  container.innerHTML = records
    .map((record) => {
      const go = isStatusGo(record);
      return `
        <div class="status-card">
          <h3>${record.name}</h3>
          <div class="indicator ${go ? 'go' : 'no-go'}">${go ? 'GO' : 'NO-GO'}</div>
          <div class="detail">${record.stage} · ${record.fuel}% fuel</div>
        </div>
      `;
    })
    .join('');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseStatusFeed, isStatusGo, renderStatusPanel };
}
