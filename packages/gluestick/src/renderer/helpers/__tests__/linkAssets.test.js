const linkAssets = require('../linkAssets');

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
  it('should return only script tag in development', () => {
    const {
      styleTags,
      scriptTags,
    } = linkAssets({}, 'main', assets, {});
    expect(styleTags.length).toBe(0);
    expect(scriptTags.length).toBe(1);
    expect(scriptTags[0].type).toEqual('script');
    expect(scriptTags[0].props.dangerouslySetInnerHTML.__html.includes('main-js')).toBeTruthy();
    expect(scriptTags[0].props.dangerouslySetInnerHTML.__html.includes('vendor-js')).toBeTruthy();
  });

  it('should return scripts and style tags in production', () => {
    const originalENV = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const {
      styleTags,
      scriptTags,
    } = linkAssets({}, 'main', assets, {});
    expect(styleTags.length).toBe(2);
    expect(scriptTags.length).toBe(1);
    expect(scriptTags[0].type).toEqual('script');
    expect(scriptTags[0].props.dangerouslySetInnerHTML.__html.includes('main-js')).toBeTruthy();
    expect(scriptTags[0].props.dangerouslySetInnerHTML.__html.includes('vendor-js')).toBeTruthy();
    expect(styleTags[0].type).toEqual('link');
    process.env.NODE_ENV = originalENV;
  });

  it('should resolve / entry name', () => {
    const originalENV = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const {
      styleTags,
      scriptTags,
    } = linkAssets({}, '/', assets, {});
    expect(styleTags.length).toBe(2);
    expect(scriptTags.length).toBe(1);
    expect(scriptTags[0].type).toEqual('script');
    expect(scriptTags[0].props.dangerouslySetInnerHTML.__html.includes('main-js')).toBeTruthy();
    expect(scriptTags[0].props.dangerouslySetInnerHTML.__html.includes('vendor-js')).toBeTruthy();
    expect(styleTags[0].type).toEqual('link');
    process.env.NODE_ENV = originalENV;
  });

  it('should resolve /<name> entry name', () => {
    const originalENV = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const {
      styleTags,
      scriptTags,
    } = linkAssets({}, '/main', assets, {});
    expect(styleTags.length).toBe(2);
    expect(scriptTags.length).toBe(1);
    expect(scriptTags[0].type).toEqual('script');
    expect(scriptTags[0].props.dangerouslySetInnerHTML.__html.includes('main-js')).toBeTruthy();
    expect(scriptTags[0].props.dangerouslySetInnerHTML.__html.includes('vendor-js')).toBeTruthy();
    expect(styleTags[0].type).toEqual('link');
    process.env.NODE_ENV = originalENV;
  });

  it('should pass loadjs config', () => {
    const {
      scriptTags,
    } = linkAssets({}, 'main', assets, {
      before: () => { console.log('LoadJSBefore'); },
    });
    expect(scriptTags.length).toBe(1);
    expect(scriptTags[0].props.dangerouslySetInnerHTML.__html)
      .toContain('console.log(\'LoadJSBefore\')');
  });
});
