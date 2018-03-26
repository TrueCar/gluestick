/* @flow */

import gluestickPluginBunyan from '../server.js';
import type { Logger } from '../server.js';

describe('Bunyan plugin', () => {
  let mockLogger;
  beforeEach(() => {
    mockLogger = {
      debug: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      success: jest.fn(),
      warn: jest.fn(),
    };
  });

  it('should return logger with all methods when given a valid config', () => {
    const mockRequireModule = jest.fn();
    mockRequireModule.mockReturnValue({
      name: 'test',
      stream: process.stdout,
      level: 'warn',
    });
    const { logger }: { logger?: Logger } = gluestickPluginBunyan(
      {},
      {
        requireModule: mockRequireModule,
        defaultLogger: mockLogger,
      },
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
      {
        requireModule: mockRequireModule,
        defaultLogger: mockLogger,
      },
    );
    expect(logger).not.toBeDefined();
  });

  it('should fail with a useful message if the config contains errors', () => {
    const mockRequireModule = jest.fn();
    mockRequireModule.mockReturnValue({
      name: 'test',
      serializers: 1,
    });
    const { logger }: { logger?: Logger } = gluestickPluginBunyan(
      {},
      {
        requireModule: mockRequireModule,
        defaultLogger: mockLogger,
      },
    );
    expect(mockLogger.error.mock.calls[0][1]).toContain(
      'config file contains errors',
    );
    expect(logger).not.toBeDefined();
  });
});
