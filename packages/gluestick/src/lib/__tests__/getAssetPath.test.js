import getAssetPath from '../getAssetPath';

describe('lib/getAssetPath', () => {
  const MOCK_CONFIG_NO_TRAILING_SLASH = {
    assetPath: 'assets',
  };

  const MOCK_CONFIG_WITH_TRAILING_SLASH = {
    assetPath: 'assets/',
  };

  it('should return the assetPath from a config object', () => {
    const assetPath = getAssetPath(MOCK_CONFIG_WITH_TRAILING_SLASH);
    expect(assetPath).toEqual('assets/');
  });

  it("should add a slash if assetPath doesn't have one", () => {
    const assetPath = getAssetPath(MOCK_CONFIG_NO_TRAILING_SLASH);
    expect(assetPath).toEqual('assets/');
  });
});
