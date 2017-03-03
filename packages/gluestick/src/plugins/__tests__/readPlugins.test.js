jest.mock('../../lib/utils.js', () => ({
  requireWithInterop: (val) => {
    if (val === 'throw-0') {
      return {};
    } else if (val === 'throw-1') {
      return [11];
    } else if (val === 'throw-2') {
      return [{ name: 'name' }];
    } else if (val === 'plugin-1' || val === 'plugin-3') {
      const fn = jest.fn();
      fn.meta = {
        type: 'config',
      };
      return fn;
    } else if (val === 'plugin-2') {
      const fn = jest.fn();
      fn.meta = {
        type: 'runtime',
      };
      return fn;
    }
    return [
      'plugin-1',
      {
        plugin: 'plugin-2',
      },
      {
        plugin: 'plugin-3',
      },
    ];
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

  it('should throw error if plugins decl is invalid', () => {
    expect(readPlugins(logger, 'throw-0', '')).toEqual([]);
    expect(logger.error.mock.calls[0])
      .toEqual([new Error('Invalid plugins configuration: must be an array')]);
  });

  it('should throw error if plugin decl is invalid', () => {
    expect(readPlugins(logger, 'throw-1', '')).toEqual([]);
    expect(logger.error.mock.calls[0])
      .toEqual([new Error('Invalid plugin declaration element: 11')]);
  });

  it('should read plugins', () => {
    const results = readPlugins(logger, 'abc', 'config');
    expect(results.length).toBe(2);
    expect(results[0].name).toEqual('plugin-1');
    expect(results[0].meta).toEqual({ type: 'config' });
    expect(results[0].options).toEqual({});
    expect(results[1].name).toEqual('plugin-3');
    expect(results[1].meta).toEqual({ type: 'config' });
    expect(results[1].options).toEqual({});
  });
});
