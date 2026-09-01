// Telemetry Board view. Owns its own feed parser — deliberately not
// shared with status-panel.js or mission-log.js. See design.md Key
// Decisions.

function parseBoardFeed(feedText) {
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

function isBoardGo(record) {
  return record.stage !== 'ABORT' && record.fuel >= 10;
}

function renderTelemetryBoard(container, feedText) {
  const records = parseBoardFeed(feedText);
  const rows = records
    .map((record) => {
      const go = isBoardGo(record);
      return `
        <tr>
          <td>${record.name}</td>
          <td>${record.altitude}</td>
          <td>${record.fuel}</td>
          <td>${record.stage}</td>
          <td class="${go ? 'go' : 'no-go'}">${go ? 'GO' : 'NO-GO'}</td>
        </tr>
      `;
    })
    .join('');

  container.innerHTML = `
    <table class="telemetry-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Altitude (m)</th>
          <th>Fuel (%)</th>
          <th>Stage</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseBoardFeed, isBoardGo, renderTelemetryBoard };
}
