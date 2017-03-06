/* @flow */
import type { ConfigPlugin } from '../../types';

jest.mock('gluestick-plugins.js', () => [
  {
    name: 'testPlugin0',
    meta: {
      type: 'config',
    },
    overwrites: {
      gluestickConfig: () => 'gluestickConfig',
      clientWebpackConfig: () => 'clientWebpackConfig',
      serverWebpackConfig: () => 'serverWebpackConfig',
    },
  },
  {
    name: 'testPlugin1',
    meta: {
      type: 'config',
    },
    overwrites: {
      gluestickConfig: () => 'gluestickConfig',
      clientWebpackConfig: () => 'clientWebpackConfig',
      serverWebpackConfig: () => 'serverWebpackConfig',
    },
  },
], { virtual: true });
jest.mock('gluestick.plugins.fail.js', () => [
  'testPlugin2',
], { virtual: true });
jest.mock('gluestick.plugins.throw.js', () => [
  'testPlugin3',
], { virtual: true });
jest.mock('testPlugin0', () => () => {
  return () => 'testPlugin0';
}, { virtual: true });
jest.mock('testPlugin1', () => (options) => {
  return () => `testPlugin1${options.prop}`;
}, { virtual: true });
jest.mock('testPlugin2', () => 'string', { virtual: true });
jest.mock('testPlugin3', () => () => { throw new Error('test'); }, { virtual: true });

jest.mock('../readPlugins.js', () => (logger, value) => {
  if (value === 'default') {
    return [
      {
        name: 'testPlugin0',
        meta: {
          type: 'config',
        },
        body: () => ({
          overwriteGluestickConfig: () => 'gluestickConfig',
          overwriteClientWebpackConfig: () => 'clientWebpackConfig',
          overwriteServerWebpackConfig: () => 'serverWebpackConfig',
        }),
      },
      {
        name: 'testPlugin1',
        meta: {
          type: 'config',
        },
        body: () => ({
          overwriteGluestickConfig: () => 'gluestickConfig',
          overwriteClientWebpackConfig: () => 'clientWebpackConfig',
          overwriteServerWebpackConfig: () => 'serverWebpackConfig',
        }),
      },
    ];
  } else if (value === 'fail') {
    return [
      {
        name: 'testPlugin0',
        meta: {
          type: 'config',
        },
        body: 'string',
      },
    ];
  } else if (value === 'throw') {
    return [
      {
        name: 'testPlugin0',
        meta: {
          type: 'config',
        },
        body: () => {
          throw new Error('test');
        },
      },
    ];
  }
  return [];
});
const prepareConfigPlugins = require('../prepareConfigPlugins');

const logger = {
  warn: jest.fn(),
  info: jest.fn(),
  success: jest.fn(),
};

describe('plugins/prepareConfigPlugins', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return plugins array', () => {
    // $FlowIgnore
    const plugins: ConfigPlugin[] = prepareConfigPlugins(logger, 'default');
    expect(plugins[0].name).toEqual('testPlugin0');
    expect(plugins[1].name).toEqual('testPlugin1');
    // $FlowIgnore
    expect(plugins[0].overwrites.gluestickConfig()).toEqual('gluestickConfig');
    // $FlowIgnore
    expect(plugins[0].overwrites.clientWebpackConfig()).toEqual('clientWebpackConfig');
    // $FlowIgnore
    expect(plugins[0].overwrites.serverWebpackConfig()).toEqual('serverWebpackConfig');
    // $FlowIgnore
    expect(plugins[1].overwrites.gluestickConfig()).toEqual('gluestickConfig');
    // $FlowIgnore
    expect(plugins[1].overwrites.clientWebpackConfig()).toEqual('clientWebpackConfig');
    // $FlowIgnore
    expect(plugins[1].overwrites.serverWebpackConfig()).toEqual('serverWebpackConfig');
  });

  it('should fail to compile plugin', () => {
    // $FlowIgnore
    const plugins: ConfigPlugin[] = prepareConfigPlugins(logger, 'fail');
    expect(plugins.length).toBe(0);
    expect(logger.warn.mock.calls.length).toBe(1);
    expect(logger.warn.mock.calls[0][0].message).toEqual(
      'testPlugin0 compilation failed: plugin must export function',
    );
  });

  it('should catch error being throw from inside plugin', () => {
    // $FlowIgnore
    const plugins: ConfigPlugin[] = prepareConfigPlugins(logger, 'throw');
    expect(plugins.length).toBe(0);
    expect(logger.warn.mock.calls.length).toBe(1);
    expect(logger.warn.mock.calls[0][0].message).toEqual(
      'testPlugin0 compilation failed: test',
    );
  });
});
