/* @flow */
jest.mock('../../utils', () => ({ requireModule: v => require(v) }));
jest.mock('../webpack/buildEntries.js', () => () => ({}));
jest.mock('../webpack/buildServerEntries.js', () => jest.fn());
jest.mock('../webpack/prepareEntries.js', () => jest.fn());
jest.mock('../webpack/getAliasesForApps.js', () => () => ({}));
jest.mock(
  'src/webpack.hooks.js',
  () => ({
    webpackClientConfig: config => Object.assign(config, { mutated: true }),
    webpackServerConfig: config => Object.assign(config, { mutated: true }),
  }),
  { virtual: true },
);
jest.mock('src/config/application.js', () => ({}), { virtual: true });

const compileWebpackConfig = require('../compileWebpackConfig');
const defaultGSConfig = require('../defaults/glueStickConfig');

const loggerMock = require('../../__tests__/mocks/context').commandApi.getLogger();

const originalProcessCwd = process.cwd.bind(process);
const compileMockedWebpackConfig = () =>
  compileWebpackConfig(
    loggerMock,
    [
      {
        name: 'test',
        meta: {},
        preOverwrites: {},
        postOverwrites: {
          clientWebpackConfig: config =>
            Object.assign(config, { testProp: true }),
          serverWebpackConfig: config =>
            Object.assign(config, { testProp: true }),
        },
      },
      {
        name: 'test',
        meta: {},
        preOverwrites: {
          sharedWebpackConfig: config =>
            Object.assign(config, { preTestProp: true }),
        },
        postOverwrites: {
          clientWebpackConfig: config =>
            Object.assign(config, { testPropNew: true }),
        },
      },
    ],
    defaultGSConfig,
  );

describe('config/compileWebpackConfig', () => {
  beforeAll(() => {
    // $FlowIgnore
    process.cwd = () => '.';
  });

  afterAll(() => {
    // $FlowIgnore
    process.cwd = originalProcessCwd;
  });

  it('should return webpack config', () => {
    const webpackConfig = compileMockedWebpackConfig();

    expect(webpackConfig.universalSettings).not.toBeNull();
    expect(webpackConfig.client).not.toBeNull();
    expect(webpackConfig.server).not.toBeNull();
    expect(webpackConfig.client.testProp).toBeTruthy();
    expect(webpackConfig.server.testProp).toBeTruthy();
    expect(webpackConfig.client.preTestProp).toBeTruthy();
    expect(webpackConfig.server.preTestProp).toBeTruthy();
    expect(webpackConfig.client.testPropNew).toBeTruthy();
  });

  it('should mutate webpack config when hooks are present', () => {
    const webpackConfig = compileMockedWebpackConfig();

    expect(webpackConfig.client.mutated).toBeTruthy();
    expect(webpackConfig.server.mutated).toBeTruthy();
  });
});
