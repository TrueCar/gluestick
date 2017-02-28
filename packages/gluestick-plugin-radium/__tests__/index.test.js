jest.mock('app.js', () => ({
  protocol: 'http',
  host: '0.0.0.0',
  port: '7777',
  assetPort: '7778',
  test: true,
}), { virtual: true });
jest.mock('add.js', () => ({
  additionalAliases: {
    aliasName: ['alias'],
  },
  additionalLoaders: ['loader'],
  plugins: ['plugin'],
  vendor: ['vendor'],
}), { virtual: true });

const path = require('path');

const originalPathJoin = path.join.bind(path);
const pluginFactory = require('../');

describe('plugin', () => {
  let plugin;

  beforeEach(() => {
    path.join = jest.fn(
      (...values) => {
        if (values.findIndex(val => val.includes('application')) > -1) {
          return 'app.js';
        }
        return 'add.js';
      },
    );
    plugin = pluginFactory();
  });

  afterAll(() => {
    path.join = originalPathJoin;
  });

  it('should overwrite fluestick config', () => {
    const gsConfig = { ports: {} };
    plugin.overwriteGluestickConfig(gsConfig);
    expect(gsConfig).toEqual({
      protocol: 'http',
      host: '0.0.0.0',
      ports: {
        client: '7777',
        server: '7778',
      },
    });
  });

  it('should overwrite client webpack config', () => {
    const webpackConfig = {
      resolve: { alias: {} },
      module: { rules: [] },
      plugins: [],
      entry: {},
    };
    plugin.overwriteClientWebpackConfig(webpackConfig);
    expect(webpackConfig.resolve.alias.aliasName).toEqual('add.js');
    expect(webpackConfig.module.rules).toEqual(['loader']);
    expect(webpackConfig.plugins).toEqual(['plugin']);
    expect(webpackConfig.entry.vendor).toEqual(['vendor']);
  });

  it('should overwrite server webpack config', () => {
    const webpackConfig = {
      resolve: { alias: {} },
      module: { rules: [] },
      plugins: [],
      entry: {},
    };
    plugin.overwriteServerWebpackConfig(webpackConfig);
    expect(webpackConfig.resolve.alias.aliasName).toEqual('add.js');
    expect(webpackConfig.module.rules).toEqual(['loader']);
    expect(webpackConfig.plugins).toEqual(['plugin']);
    expect(webpackConfig.entry.vendor).toBeUndefined();
  });
});
