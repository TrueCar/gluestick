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
    const webpackConfig = compileWebpackConfig(loggerMock, [], {}, defaultGSConfig);
    expect(webpackConfig.universalSettings).not.toBeNull();
    expect(webpackConfig.client).not.toBeNull();
    expect(webpackConfig.server).not.toBeNull();
  });
});
