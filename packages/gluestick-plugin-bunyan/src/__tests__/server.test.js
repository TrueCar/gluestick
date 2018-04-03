/* @flow */

import gluestickPluginBunyan from '../server.js';
import type { Logger } from '../server.js';
import invariant from 'invariant';

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
    // https://github.com/facebook/jest/issues/3764
    invariant(logger, 'logger is not optional in this test');
    expect(logger).toBeDefined();
    expect(logger.success).toBeDefined();
    expect(logger.info).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.debug).toBeDefined();
    expect(logger.error).toBeDefined();
    invariant(logger.fields, 'logger.fields is an object in this test');
    invariant(logger.fields.name, 'logger.fields.name is a string for this test');
    expect(logger.fields.name).toEqual('test');
  });

  it('should return the default logger if the config is empty', () => {
    const mockRequireModule = jest.fn();
    mockRequireModule.mockReturnValue({});
    const { logger }: { logger?: Logger } = gluestickPluginBunyan(
      {},
      {
        requireModule: mockRequireModule,
        defaultLogger: mockLogger,
      },
    );
    // https://github.com/facebook/jest/issues/3764
    invariant(logger, 'logger is not optional in this test');
    expect(logger).toBeDefined();
    invariant(logger.fields, 'logger.fields is an object in this test');
    invariant(logger.fields.name, 'logger.fields.name is a string for this test');
    expect(logger.fields.name).toEqual('default name');
  });
});
