/* @flow */
jest.mock('../../lib/utils.js', () => ({
  requireWithInterop: (val) => {
    switch(val) {
      case 'throw-0':
        return {};
      case 'throw-1':
        return [11];
      case 'plugin-1/config.js':
      case 'plugin-3/config.js':
        return jest.fn();
      case 'decl':
        return [
          'plugin-1',
          {
            plugin: 'plugin-2',
          },
          {
            plugin: 'plugin-3',
          },
        ];
    }
  },
}));

const readPlugins = require('../readPlugins');

const logger = {
  error: jest.fn(),
};

describe('plugins/readPlugin', () => {
  beforeEach(() => {
    logger.error.mockReset();
  });

  xit('should throw error if plugins decl is invalid', () => {
    // $FlowIgnore
    expect(readPlugins(logger, 'throw-0', 'config')).toEqual([]);
    expect(logger.error.mock.calls[0])
      .toEqual([new Error('Invalid plugins configuration: must be an array')]);
  });

  xit('should throw error if plugin decl is invalid', () => {
    // $FlowIgnore
    expect(readPlugins(logger, 'throw-1', 'config')).toEqual([]);
    expect(logger.error.mock.calls[0])
      .toEqual([new Error('Invalid plugin declaration element: 11')]);
  });

  it('should read plugins', () => {
    // $FlowIgnore
    const results = readPlugins(logger, 'decl', 'config');
    expect(results.length).toBe(2);
    expect(results[0].name).toEqual('plugin-1');
    expect(results[0].meta).toEqual({ type: 'config' });
    expect(results[0].options).toEqual({});
    expect(results[1].name).toEqual('plugin-3');
    expect(results[1].meta).toEqual({ type: 'config' });
    expect(results[1].options).toEqual({});
  });
});
