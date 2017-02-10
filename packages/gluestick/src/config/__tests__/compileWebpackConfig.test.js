const compileWebpackConfig = require('../compileWebpackConfig');
const defaultGSConfig = require('../defaults/glueStickConfig');

describe('config/compileWebpackConfig', () => {
  it('should return webpack config', () => {
    const webpackConfig = compileWebpackConfig([], {}, defaultGSConfig);
    expect(webpackConfig.universalSettings).not.toBeNull();
    expect(webpackConfig.client).not.toBeNull();
    expect(webpackConfig.server).not.toBeNull();
  });
});
