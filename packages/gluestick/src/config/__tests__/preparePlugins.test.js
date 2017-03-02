/* @flow */
jest.mock('gluestick.plugins.js', () => [
  'testPlugin0',
  {
    plugin: 'testPlugin1',
    options: {
      prop: true,
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
const preparePlugins = require('../preparePlugins');

const logger = {
  warn: jest.fn(),
  info: jest.fn(),
  success: jest.fn(),
};

describe('config/preparePlugins', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return plugins array', () => {
    // $FlowIgnore
    const plugins = preparePlugins(logger, 'gluestick.plugins.js');
    expect(plugins[0].name).toEqual('testPlugin0');
    expect(plugins[1].name).toEqual('testPlugin1');
    // $FlowIgnore
    expect(plugins[0].body()).toEqual('testPlugin0');
    // $FlowIgnore
    expect(plugins[1].body()).toEqual('testPlugin1true');
  });

  it('should fail to compile plugin', () => {
    // $FlowIgnore
    const plugins = preparePlugins(logger, 'gluestick.plugins.fail.js');
    expect(plugins.length).toBe(0);
    expect(logger.warn.mock.calls.length).toBe(1);
    expect(logger.warn.mock.calls[0][0].message).toEqual(
      'testPlugin2 compilation failed: plugin must export function',
    );
  });

  it('should catch error being throw from inside plugin', () => {
    // $FlowIgnore
    const plugins = preparePlugins(logger, 'gluestick.plugins.throw.js');
    expect(plugins.length).toBe(0);
    expect(logger.warn.mock.calls.length).toBe(1);
    expect(logger.warn.mock.calls[0][0].message).toEqual(
      'testPlugin3 compilation failed: test',
    );
  });
});
