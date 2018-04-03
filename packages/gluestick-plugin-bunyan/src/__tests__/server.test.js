/* @flow */

import invariant from 'invariant';
import gluestickPluginBunyan from '../server.js';

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
    const { logger } = gluestickPluginBunyan(
      {},
      {
        requireModule: mockRequireModule,
        defaultLogger: mockLogger,
      },
    );
    invariant(
      logger && logger.fields && logger.fields.name,
      'logger.fields.name is required',
    );
    expect(logger.fields.name).toEqual('test');
    expect(logger.success).toBeDefined();
    expect(logger.info).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.debug).toBeDefined();
    expect(logger.error).toBeDefined();
  });

  it('should return the default logger if the config is empty', () => {
    const mockRequireModule = jest.fn();
    mockRequireModule.mockReturnValue({});
    const { logger } = gluestickPluginBunyan(
      {},
      {
        requireModule: mockRequireModule,
        defaultLogger: mockLogger,
      },
    );
    invariant(
      logger && logger.fields && logger.fields.name,
      'logger.fields.name is required',
    );
    expect(logger.fields.name).toEqual('default name');
  });
});
