/* @flow */
import type { ServerPlugin } from '../../types';

const prepareServerPlugins = require('../prepareServerPlugins');

const logger = {
  warn: jest.fn(),
  info: jest.fn(),
  success: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
};

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

describe('plugins/prepareServerPlugins', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return plugins array', () => {
    const plugins: ServerPlugin[] = prepareServerPlugins(logger, validPlugins);
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
    const plugins: ServerPlugin[] = prepareServerPlugins(logger, [
      // $FlowIgnore
      {
        ref: 'abc',
      },
    ]);
    expect(plugins.length).toBe(0);
    expect(logger.warn.mock.calls.length).toBe(1);
    expect(logger.warn.mock.calls[0][0].message).toEqual(
      'Plugin at position 0 must export a function',
    );
  });

  it('should catch error being throw from inside plugin', () => {
    const invalidPlugin = () => {
      throw new Error('test');
    };
    invalidPlugin.meta = { type: 'server', name: 'invalidPlugin' };
    const plugins: ServerPlugin[] = prepareServerPlugins(logger, [
      {
        ref: invalidPlugin,
        type: 'server',
      },
    ]);
    expect(plugins.length).toBe(0);
    expect(logger.warn.mock.calls.length).toBe(1);
    expect(logger.warn.mock.calls[0][0].message).toEqual(
      'invalidPlugin compilation failed: test',
    );
  });
});
