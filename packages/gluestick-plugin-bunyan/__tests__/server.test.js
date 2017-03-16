import gluestickPluginBunyan from '../server.js';
import type { Options } from '../server.js';

const options: Options = {
  name: 'testApp',
}

test('Bunyan plugin should return logger with all methods', () => {
  const { logger } = gluestickPluginBunyan(options);
  expect(logger).toBeDefined();
  expect(logger.success).toBeDefined();
  expect(logger.info).toBeDefined();
  expect(logger.warn).toBeDefined();
  expect(logger.debug).toBeDefined();
  expect(logger.error).toBeDefined();
});

test('Bunyan plugin should throw error when called without name param', () => {
  expect(() => gluestickPluginBunyan({})).toThrowError('options.name (string) is required');
});
