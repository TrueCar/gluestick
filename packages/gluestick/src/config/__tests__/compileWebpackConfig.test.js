/* @flow */
jest.mock('../webpack/buildEntries.js', () => () => ({}));
jest.mock('../webpack/buildServerEntries.js', () => jest.fn());

const compileWebpackConfig = require('../compileWebpackConfig');
const defaultGSConfig = require('../defaults/glueStickConfig');

const loggerMock = {
  info: jest.fn(),
  debug: jest.fn(),
  success: jest.fn(),
};

describe('config/compileWebpackConfig', () => {
  it('should return webpack config', () => {
    // $FlowIgnore
    const webpackConfig = compileWebpackConfig(loggerMock, [
      {
        overwrites: {
          // $FlowIgnore
          clientWebpackConfig: (config) => Object.assign(config, { testProp: true }),
          // $FlowIgnore
          serverWebpackConfig: (config) => Object.assign(config, { testProp: true }),
        },
      },
      {
        overwrites: {
          // $FlowIgnore
          clientWebpackConfig: (config) => Object.assign(config, { testPropNew: true }),
        },
      },
    ], {}, defaultGSConfig);
    expect(webpackConfig.universalSettings).not.toBeNull();
    expect(webpackConfig.client).not.toBeNull();
    expect(webpackConfig.server).not.toBeNull();
    expect(webpackConfig.client.testProp).toBeTruthy();
    expect(webpackConfig.server.testProp).toBeTruthy();
    expect(webpackConfig.client.testPropNew).toBeTruthy();
  });
});
