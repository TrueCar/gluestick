import gluestickPluginBunyan from '../server.js';

test('Bunyan plugin should return logger with all methods', () => {
  const { logger } = gluestickPluginBunyan();
  expect(logger).toBeDefined();
  expect(logger.success).toBeDefined();
  expect(logger.info).toBeDefined();
  expect(logger.warn).toBeDefined();
  expect(logger.debug).toBeDefined();
  expect(logger.error).toBeDefined();
});
