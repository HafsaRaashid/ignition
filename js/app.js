// Sample telemetry feed — inlined (not fetched) so the page works over
// file:// with no server. See design.md Key Decisions.
const SAMPLE_FEED = [
  'Falcon-9|82.4|76|BURN',
  'Starhopper|140.2|54|COAST',
  'Artemis-Lite|12.8|8|ABORT',
  'Comet-One|301.5|61|STAGE-SEP',
  'Zephyr|45.0|4|BURN',
  'Ghost-Probe|99.1|42',
].join('\n');

function initTabs() {
  const buttons = document.querySelectorAll('.tab-button');
  const views = document.querySelectorAll('.view');

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.dataset.target;

      buttons.forEach((b) => {
        b.classList.toggle('active', b === button);
        b.setAttribute('aria-selected', b === button ? 'true' : 'false');
      });

      views.forEach((view) => {
        view.classList.toggle('active', view.id === targetId);
      });
    });
  });
}

function initApp() {
  renderStatusPanel(document.getElementById('status-panel'), SAMPLE_FEED);
  renderTelemetryBoard(document.getElementById('telemetry-board'), SAMPLE_FEED);
  renderMissionLog(document.getElementById('mission-log'), SAMPLE_FEED);
  initTabs();
}

document.addEventListener('DOMContentLoaded', initApp);
