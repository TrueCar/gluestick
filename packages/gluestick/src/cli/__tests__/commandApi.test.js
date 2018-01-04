/* @flow */

jest.mock('../../plugins/prepareConfigPlugins', () => () => [
  { name: 'testPlugin' },
]);
jest.mock('../../config/compileGlueStickConfig', () => () => ({
  protocol: 'http',
}));
jest.mock('../../webpack/getWebpackConfig.js', () => () => ({
  client: {},
  server: {},
}));
jest.mock(
  'cwd/ok/package.json',
  () => ({ dependencies: { gluestick: 'x.x.x' } }),
  { virtual: true },
);
jest.mock('cwd/invalid/package.json', () => ({}), { virtual: true });

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
    expect(plugins).toEqual([{ name: 'testPlugin' }]);
  });

  it('getGluestickConfig should return gluestick config', () => {
    const plugins = [];
    expect(commandApi.getGluestickConfig(loggerMock, plugins)).toEqual({
      protocol: 'http',
    });
  });

  it('getWebpackConfig should return webpack configs', () => {
    expect(commandApi.getWebpackConfig(loggerMock, [], {}, {})).toEqual({
      client: {},
      server: {},
    });
  });

  it('getContextConfig should return object with gluestick and webpack configs', () => {
    expect(commandApi.getContextConfig(loggerMock, {})).toEqual({
      GSConfig: {
        protocol: 'http',
      },
      webpackConfig: {
        client: {},
        server: {},
      },
    });
  });
});
