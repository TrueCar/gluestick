/* @flow */
jest.mock('fs', () => ({
  readFile: jest.fn(),
  readFileSync: jest.fn(),
}));
jest.mock('path');

const path = require('path');
const fs = require('fs');
const linkAssets = require('../linkAssets');
const context = require('../../../__tests__/mocks/context').context;

const assets = {
  javascript: {
    main: 'main-js',
    vendor: 'vendor-js',
  },
  styles: {
    main: 'main-style',
    vendor: 'vendor-style',
  },
};

describe('renderer/helpers/linkAssets', () => {
  it('should return scripts and style tags', async () => {
    const { styleTags, scriptTags } = await linkAssets(
      context,
      'main',
      assets,
      {},
    );
    expect(styleTags.length).toBe(2);
    expect(scriptTags.length).toBe(1);
    expect(scriptTags[0].type).toEqual('script');
    expect(
      scriptTags[0].props.dangerouslySetInnerHTML.__html.includes('main-js'),
    ).toBeTruthy();
    expect(
      scriptTags[0].props.dangerouslySetInnerHTML.__html.includes('vendor-js'),
    ).toBeTruthy();
    expect(styleTags[0].type).toEqual('link');
  });

  it('should resolve / entry name', async () => {
    const originalENV = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const { styleTags, scriptTags } = await linkAssets(
      context,
      '/',
      assets,
      {},
    );
    expect(styleTags.length).toBe(2);
    expect(scriptTags.length).toBe(1);
    expect(scriptTags[0].type).toEqual('script');
    expect(
      scriptTags[0].props.dangerouslySetInnerHTML.__html.includes('main-js'),
    ).toBeTruthy();
    expect(
      scriptTags[0].props.dangerouslySetInnerHTML.__html.includes('vendor-js'),
    ).toBeTruthy();
    expect(styleTags[0].type).toEqual('link');
    process.env.NODE_ENV = originalENV;
  });

  it('should resolve /<name> entry name', async () => {
    const originalENV = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const { styleTags, scriptTags } = await linkAssets(
      context,
      '/main',
      assets,
      {},
    );
    expect(styleTags.length).toBe(2);
    expect(scriptTags.length).toBe(1);
    expect(scriptTags[0].type).toEqual('script');
    expect(
      scriptTags[0].props.dangerouslySetInnerHTML.__html.includes('main-js'),
    ).toBeTruthy();
    expect(
      scriptTags[0].props.dangerouslySetInnerHTML.__html.includes('vendor-js'),
    ).toBeTruthy();
    expect(styleTags[0].type).toEqual('link');
    process.env.NODE_ENV = originalENV;
  });

  it('should pass loadjs config', async () => {
    const { scriptTags } = await linkAssets(context, 'main', assets, {
      before: () => {
        console.log('LoadJSBefore');
      },
    });
    expect(scriptTags.length).toBe(1);
    expect(scriptTags[0].props.dangerouslySetInnerHTML.__html).toContain(
      "console.log('LoadJSBefore')",
    );
  });

  it('should link vendor DLL bundle', async () => {
    global.__webpack_public_path__ = null;
    path.join.mockImplementationOnce(() => 'vendor-manifest.json');
    fs.writeFileSync(
      'vendor-manifest.json',
      JSON.stringify({ name: 'vendor_hash' }),
    );
    const { scriptTags } = await linkAssets(
      context,
      '/main',
      {
        ...assets,
        javascript: {
          main: assets.javascript.main,
        },
      },
      {},
    );
    expect(scriptTags.length).toBe(1);
    expect(
      scriptTags[0].props.dangerouslySetInnerHTML.__html.includes('main-js'),
    ).toBeTruthy();
    expect(
      scriptTags[0].props.dangerouslySetInnerHTML.__html.includes(
        '/assets/dlls/vendor-hash.dll.js',
      ),
    ).toBeTruthy();
  });
});
