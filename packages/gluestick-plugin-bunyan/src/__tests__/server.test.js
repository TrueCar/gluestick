/* @flow */

import gluestickPluginBunyan from '../server.js';
import type { Logger } from '../server.js';

describe('Bunyan plugin', () => {
  it('should return logger with all methods when given a valid config', () => {
    const mockRequireModule = jest.fn();
    mockRequireModule.mockReturnValue({
      name: 'test',
      stream: process.stdout,
      level: 'warn',
    });
    const { logger }: { logger?: Logger } = gluestickPluginBunyan(
      {},
      { requireModule: mockRequireModule },
    );
    if (!logger) {
      // Force a failure for Flow: https://github.com/facebook/jest/issues/3764
      expect(false).toBeTruthy();
      return;
    }
    expect(logger).toBeDefined();
    expect(logger.success).toBeDefined();
    expect(logger.info).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.debug).toBeDefined();
    expect(logger.error).toBeDefined();
  });

  it('should return logger with all methods when given an empty config', () => {
    const mockRequireModule = jest.fn();
    mockRequireModule.mockReturnValue({});
    const { logger }: { logger?: Logger } = gluestickPluginBunyan(
      {},
      { requireModule: mockRequireModule },
    );
    expect(logger).not.toBeDefined();
  });
});
