jest.mock('../webpack/buildEntries.js', () => () => ({}));
jest.mock('../webpack/buildServerEntries.js', () => jest.fn());
jest.mock('../webpack/prepareEntries.js', () => jest.fn());
jest.mock('../webpack/getAliasesForApps.js', () => () => ({}));
jest.mock('src/gluestick.hooks', () => ({
  default: {
    webpackClientConfig: (a) => a,
    webpackServerConfig: (a) => a,
  },
}), { virtual: true });

const compileWebpackConfig = require('../compileWebpackConfig');
const defaultGSConfig = require('../defaults/glueStickConfig');

const loggerMock = {
  info: jest.fn(),
  debug: jest.fn(),
  success: jest.fn(),
  error: jest.fn(),
};

const originalProcessCwd = process.cwd.bind(process);

describe('config/compileWebpackConfig', () => {
  beforeAll(() => {
    process.cwd = () => '.';
  });

  afterAll(() => {
    jest.resetAllMocks();
    process.cwd = originalProcessCwd;
  });

  it('should return webpack config', () => {
    // $FlowIgnore
    const webpackConfig = compileWebpackConfig(loggerMock, [
      {
        preOverwrites: {},
        postOverwrites: {
          clientWebpackConfig: (config) => Object.assign(config, { testProp: true }),
          serverWebpackConfig: (config) => Object.assign(config, { testProp: true }),
        },
      },
      {
        preOverwrites: {
          sharedWebpackConfig: (config) => Object.assign(config, { preTestProp: true }),
        },
        postOverwrites: {
          clientWebpackConfig: (config) => Object.assign(config, { testPropNew: true }),
        },
      },
    ], {}, defaultGSConfig);
    expect(webpackConfig.universalSettings).not.toBeNull();
    expect(webpackConfig.client).not.toBeNull();
    expect(webpackConfig.server).not.toBeNull();
    expect(webpackConfig.client.testProp).toBeTruthy();
    expect(webpackConfig.server.testProp).toBeTruthy();
    expect(webpackConfig.client.preTestProp).toBeTruthy();
    expect(webpackConfig.server.preTestProp).toBeTruthy();
    expect(webpackConfig.client.testPropNew).toBeTruthy();
  });
});
