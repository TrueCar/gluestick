/* @flow */
const mockLogger = () => ({
  warn: jest.fn(),
  info: jest.fn(),
  success: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
});

const plugin0Ref = () => ({
  renderMethod: () => {},
  hooks: {},
});
plugin0Ref.meta = { type: 'server', name: 'testPlugin0' };
const plugin1Ref = options => ({
  renderMethod: () => options,
  hooks: {},
});
plugin1Ref.meta = { type: 'server', name: 'testPlugin1' };
const plugin2Ref = () => {};
plugin2Ref.meta = { type: 'runtime' };
const validPlugins = [
  {
    ref: plugin0Ref,
    type: 'server',
  },
  {
    ref: plugin1Ref,
    options: { prop: true },
    type: 'server',
  },
  {
    ref: plugin2Ref,
    type: 'runtime',
  },
];

describe('plugins/serverPlugins', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should return plugins array', () => {
    jest.doMock('project-entries', () => ({
      plugins: [
        {
          ref: plugin0Ref,
          type: 'server',
        },
        {
          ref: plugin1Ref,
          options: { prop: true },
          type: 'server',
        },
        {
          ref: plugin2Ref,
          type: 'runtime',
        },
      ],
    }));
    const plugins = require('../serverPlugins');
    expect(plugins[0].name).toEqual('testPlugin0');
    expect(plugins[0].meta).toEqual(plugin0Ref.meta);
    expect(typeof plugins[0].renderMethod).toEqual('function');
    expect(plugins[0].hooks).toEqual({});
    expect(plugins[1].name).toEqual('testPlugin1');
    expect(plugins[1].meta).toEqual(plugin1Ref.meta);
    expect(typeof plugins[1].renderMethod).toEqual('function');
    expect(plugins[1].hooks).toEqual({});
    expect(plugins[1].renderMethod()).toEqual(validPlugins[1].options);
  });

  it('should fail to compile plugin - fn export', () => {
    jest.doMock('project-entries', () => ({
      plugins: [
        {
          ref: 'abc',
        },
      ],
    }));
    const logger = mockLogger();
    jest.doMock('../../logger', () => logger);
    const plugins = require('../serverPlugins');
    expect(logger.warn.mock.calls[0][0].message).toEqual(
      'Plugin at position 0 must export a function',
    );
    expect(plugins.length).toBe(0);
    expect(logger.warn.mock.calls.length).toBe(1);
  });

  it('should catch error being throw from inside plugin', () => {
    const invalidPlugin = () => {
      throw new Error('test');
    };
    invalidPlugin.meta = { type: 'server', name: 'invalidPlugin' };
    jest.doMock('project-entries', () => ({
      plugins: [
        {
          ref: invalidPlugin,
          type: 'server',
        },
      ],
    }));
    const logger = mockLogger();
    jest.doMock('../../logger', () => logger);
    const plugins = require('../serverPlugins');
    expect(plugins.length).toBe(0);
    expect(logger.warn.mock.calls.length).toBe(1);
    expect(logger.warn.mock.calls[0][0].message).toEqual(
      'invalidPlugin compilation failed: test',
    );
  });
});
