const getAssetsLoader = require('../getAssetsLoader');

describe('renderer/helpers/getAssetsLoader', () => {
  it('should return code for assets loading in browser', () => {
    expect(getAssetsLoader({}, 'entryBundle.js', 'vendorBundle.js').length).toBeGreaterThan(0);
  });
});
