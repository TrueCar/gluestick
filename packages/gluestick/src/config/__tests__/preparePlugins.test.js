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
jest.mock('testPlugin0', () => () => {
  return () => 'testPlugin0';
}, { virtual: true });
jest.mock('testPlugin1', () => (options) => {
  return () => `testPlugin1${options.prop}`;
}, { virtual: true });
const path = require('path');
const preparePlugins = require('../preparePlugins');

const originalPath = path.join.bind({});

describe('config/preparePlugins', () => {
  beforeEach(() => {
    path.join = jest.fn(
      (...values) => {
        if (values.indexOf('gluestick.plugins')) {
          return 'gluestick.plugins.js';
        }
        return values[0];
      },
    );
  });

  const logger = {
    warn: jest.fn(),
    info: jest.fn(),
    success: jest.fn(),
  };

  afterEach(() => {
    jest.resetAllMocks();
    path.join = originalPath;
  });

  it('should return plugins array', () => {
    // $FlowIgnore
    const plugins = preparePlugins(logger);
    expect(plugins[0].name).toEqual('testPlugin0');
    expect(plugins[1].name).toEqual('testPlugin1');
    // $FlowIgnore
    expect(plugins[0].body()).toEqual('testPlugin0');
    // $FlowIgnore
    expect(plugins[1].body()).toEqual('testPlugin1true');
  });
});
