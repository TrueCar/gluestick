/* @flow */
jest.mock('../readPlugins.js', () => jest.fn(() => [{ name: 'testPlugin' }]));
const readRuntimePlugins = require('../readRuntimePlugins');
const readPlugins = require('../readPlugins');

const logger = {
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  success: jest.fn(),
  error: jest.fn(),
};

test('plugins/readRuntimePlugins should get list of runtime plugins', () => {
  expect(readRuntimePlugins(logger, 'plugins.js')).toEqual([
    { name: 'testPlugin' },
  ]);
  // $FlowIgnore flow doesn't know that readPlugins is mocked
  expect(readPlugins.mock.calls[0]).toEqual([logger, 'plugins.js', 'runtime']);
  expect(logger.info.mock.calls[0][0]).toContain('Including runtime plugins');
  expect(logger.info.mock.calls[0][0]).toContain('testPlugin');
});
