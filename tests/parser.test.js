const test = require('node:test');
const assert = require('node:assert/strict');

const { parseStatusFeed } = require('../js/status-panel.js');
const { parseBoardFeed } = require('../js/telemetry-board.js');
const { parseLogFeed } = require('../js/mission-log.js');

const SAMPLE_LINE = 'Falcon-9|82.4|76|BURN';
const EXPECTED = { name: 'Falcon-9', altitude: 82.4, fuel: 76, stage: 'BURN' };

test('parseStatusFeed parses a well-formed line', () => {
  const [record] = parseStatusFeed(SAMPLE_LINE);
  assert.deepEqual(record, EXPECTED);
});

test('parseBoardFeed parses a well-formed line', () => {
  const [record] = parseBoardFeed(SAMPLE_LINE);
  assert.deepEqual(record, EXPECTED);
});

test('parseLogFeed parses a well-formed line', () => {
  const [record] = parseLogFeed(SAMPLE_LINE);
  assert.deepEqual(record, EXPECTED);
});
