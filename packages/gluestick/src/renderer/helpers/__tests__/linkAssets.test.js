/* @flow */
const context = require('../../../__tests__/mocks/context').context;

const assets = {
  javascript: {
    main: { name: 'main.js', url: 'publicPath/main.js' },
    vendor: { name: 'vendor.js', url: 'publicPath/vendor.js' },
  },
  styles: {
    main: { name: 'main.css', url: 'publicPath/main.css' },
    vendor: { name: 'vendor.css', url: 'publicPath/vendor.css' },
  },
};

describe('renderer/helpers/linkAssets', () => {
  afterEach(() => {
    jest.resetModules();
  });

  describe('when inlining CSS', () => {
    let originalInlineCss;

    beforeEach(() => {
      originalInlineCss = context.config.GSConfig.inlineAllCss;
      context.config.GSConfig.inlineAllCss = true;
      // promisify does not work well with mocks!
      jest.mock('util', () => ({
        promisify: () => async filename => {
          if (filename === 'root/build/assets/main.css') {
            return 'main-css-contents';
          } else if (filename === 'root/build/assets/vendor.css') {
            return 'vendor-css-contents';
          }
          throw new Error(`File not found: ${filename}`);
        },
      }));
      jest.spyOn(process, 'cwd').mockImplementation(() => 'root');
    });

    afterEach(() => {
      context.config.GSConfig.inlineAllCss = originalInlineCss;
    });

    it('inlines the contents of the CSS file', async () => {
      const linkAssets = require('../linkAssets');
      const { styleTags } = await linkAssets(context, 'main', assets, {});
      expect(styleTags[0].props.dangerouslySetInnerHTML.__html).toBe(
        'main-css-contents',
      );
      expect(styleTags[1].props.dangerouslySetInnerHTML.__html).toBe(
        'vendor-css-contents',
      );
    });
  });

  describe('when not inlining CSS', () => {
    it('returns scripts and style tags', async () => {
      const linkAssets = require('../linkAssets');
      const { styleTags, scriptTags } = await linkAssets(
        context,
        'main',
        assets,
        {},
      );
      expect(styleTags.length).toBe(2);
      expect(scriptTags.length).toBe(1);
      expect(scriptTags[0].type).toEqual('script');
      expect(scriptTags[0].props.dangerouslySetInnerHTML.__html).toContain(
        'publicPath/main.js',
      );
      expect(scriptTags[0].props.dangerouslySetInnerHTML.__html).toContain(
        'publicPath/vendor.js',
      );
      expect(styleTags[0].props.href).toBe('publicPath/main.css');
      expect(styleTags[1].props.href).toBe('publicPath/vendor.css');
    });

    it('resolves entry name', async () => {
      const linkAssets = require('../linkAssets');
      const { styleTags, scriptTags } = await linkAssets(
        context,
        '/',
        assets,
        {},
      );
      expect(styleTags.length).toBe(2);
      expect(scriptTags.length).toBe(1);
      expect(scriptTags[0].type).toEqual('script');
      expect(scriptTags[0].props.dangerouslySetInnerHTML.__html).toContain(
        'publicPath/main.js',
      );
      expect(scriptTags[0].props.dangerouslySetInnerHTML.__html).toContain(
        'publicPath/vendor.js',
      );
      expect(styleTags[0].props.href).toBe('publicPath/main.css');
      expect(styleTags[1].props.href).toBe('publicPath/vendor.css');
    });

    it('resolves /<name> entry name', async () => {
      const linkAssets = require('../linkAssets');
      const { styleTags, scriptTags } = await linkAssets(
        context,
        '/main',
        assets,
        {},
      );
      expect(styleTags.length).toBe(2);
      expect(scriptTags.length).toBe(1);
      expect(scriptTags[0].type).toEqual('script');
      expect(scriptTags[0].props.dangerouslySetInnerHTML.__html).toContain(
        'publicPath/main.js',
      );
      expect(scriptTags[0].props.dangerouslySetInnerHTML.__html).toContain(
        'publicPath/vendor.js',
      );
      expect(styleTags[0].props.href).toBe('publicPath/main.css');
      expect(styleTags[1].props.href).toBe('publicPath/vendor.css');
    });

    it('passes loadjs config', async () => {
      const linkAssets = require('../linkAssets');
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
  });

  describe('vendor DLL bundle', () => {
    beforeEach(() => {
      jest.mock('fs', () => ({
        readFile: jest.fn(),
        readFileSync: () => new Buffer(JSON.stringify({ name: 'vendor_hash' })),
        writeFileSync: jest.fn(),
      }));
    });

    it('links vendor DLL bundle', async () => {
      global.__webpack_public_path__ = null;
      const linkAssets = require('../linkAssets');
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
      expect(scriptTags[0].props.dangerouslySetInnerHTML.__html).toContain(
        'main.js',
      );
      expect(scriptTags[0].props.dangerouslySetInnerHTML.__html).toContain(
        '/assets/dlls/vendor-hash.dll.js',
      );
    });
  });
});
