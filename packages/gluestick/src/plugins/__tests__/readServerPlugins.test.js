/* @flow */
jest.mock('../readPlugins.js', () => jest.fn(() => [{ name: 'testPlugin' }]));
const readServerlugins = require('../readServerPlugins');
const readPlugins = require('../readPlugins');

const logger = {
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  success: jest.fn(),
  error: jest.fn(),
};

test('plugins/readServerPlugins should get list of server plugins', () => {
  expect(readServerlugins(logger, 'plugins.js')).toEqual([
    { name: 'testPlugin' },
  ]);
  // $FlowIgnore flow doesn't know that readPlugins is mocked
  expect(readPlugins.mock.calls[0]).toEqual([logger, 'plugins.js', 'server']);
  expect(logger.info.mock.calls[0][0]).toContain('Including server plugins');
  expect(logger.info.mock.calls[0][0]).toContain('testPlugin');
});
