/* @flow */
jest.mock('fs');

const createWebpackStats = require('../createWebpackStats');
const fs = require('fs');

test('config/createWebpackStats should create stats file', () => {
  fs.writeFileSync = jest.fn();
  createWebpackStats(
    'stats',
    {
      toJson: options => options,
    },
    {
      verbose: true,
    },
  );
  expect(fs.writeFileSync.mock.calls[0][0].includes('stats.json')).toBeTruthy();
  expect(fs.writeFileSync.mock.calls[0][1]).toEqual('{"verbose":true}');
});
