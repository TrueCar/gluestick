/* @flow */

jest.mock('../../plugins/prepareConfigPlugins', () => () => [
  { name: 'testPlugin' },
]);
jest.mock('../../config/compileGlueStickConfig', () => () => ({
  protocol: 'http',
}));
jest.mock('../../config/compileWebpackConfig.js', () => () => ({
  client: {},
  server: {},
  universalSettings: {},
}));
jest.mock(
  'cwd/ok/package.json',
  () => ({ dependencies: { gluestick: 'x.x.x' } }),
  { virtual: true },
);
jest.mock('cwd/invalid/package.json', () => ({}), { virtual: true });

const path = require('path');
const commandApi = require('../commandApi');

const loggerMock = require('../../__tests__/mocks/context').commandApi.getLogger();

describe('cli/commandApi', () => {
  it('getOptions should return options object', () => {
    expect(commandApi.getOptions(['test', 'test', { client: true }])).toEqual({
      client: true,
    });
  });

  it('getLogger should return logger instance', () => {
    const logger = commandApi.getLogger();
    expect(logger).toBeDefined();
    expect(Object.keys(logger).length).toBeGreaterThan(0);
  });

  it('isGluestickProject should check if cwd is a gluestick project', () => {
    expect(commandApi.isGluestickProject('cwd/ok')).toBeTruthy();
    expect(commandApi.isGluestickProject('cwd/invalud')).toBeFalsy();
  });

  it('getPlugins should return array of plugins', () => {
    const plugins = commandApi.getPlugins(loggerMock);
    expect(plugins.pluginsConfigPath).toBeDefined();
    expect(Array.from(plugins)).toEqual([{ name: 'testPlugin' }]);
  });

  it('getGluestickConfig should return gluestick config', () => {
    const plugins = [];
    // $FlowIgnore pass additional data as a property
    plugins.pluginsConfigPath = 'pluginsConfigPath';
    expect(commandApi.getGluestickConfig(loggerMock, plugins)).toEqual({
      protocol: 'http',
      pluginsConfigPath: 'pluginsConfigPath',
    });
  });

  it('getWebpackConfig should return webpack configs', () => {
    expect(commandApi.getWebpackConfig(loggerMock, [], {}, {})).toEqual({
      client: {},
      server: {},
      universalSettings: {},
    });
  });

  it('getContextConfig should return object with gluestick and webpack configs', () => {
    expect(commandApi.getContextConfig(loggerMock, {})).toEqual({
      GSConfig: {
        protocol: 'http',
        pluginsConfigPath: path.join(process.cwd(), 'src/gluestick.plugins.js'),
      },
      webpackConfig: {
        client: {},
        server: {},
        universalSettings: {},
      },
    });
  });
});
