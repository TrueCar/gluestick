const getAssetsLoader = require('../getAssetsLoader');

describe('renderer/helpers/getAssetsLoader', () => {
  it('should return code for assets loading in browser', () => {
    const snippet = getAssetsLoader({}, 'entryBundle.js', 'vendorBundle.js');
    expect(snippet.length).toBeGreaterThan(0);
    expect(snippet).toContain(
      "document.addEventListener('DOMContentLoaded', function",
    );
  });

  it('should include loadjs options', () => {
    const snippet = getAssetsLoader(
      {
        before: () => {
          console.log('before');
        },
      },
      'entryBundle.js',
      'vendorBundle.js',
    );
    expect(snippet.length).toBeGreaterThan(0);
    expect(snippet).toContain(
      "document.addEventListener('DOMContentLoaded', function",
    );
    expect(snippet).toContain(
      "document.addEventListener('DOMContentLoaded', function",
    );
    expect(snippet).toContain("console.log('before')");
  });
});
