const compileGluestickConfig = require('../compileGlueStickConfig');
const defaultConfig = require('../defaults/glueStickConfig');

describe('config/compileGluestickConfig', () => {
  it('should return default config', () => {
    expect(compileGluestickConfig([])).toEqual(defaultConfig);
  });

  it('should throw error', () => {
    const errorMessage = 'Invalid plugins argument';
    expect(() => {
      compileGluestickConfig();
    }).toThrowError(errorMessage);
    expect(() => {
      compileGluestickConfig(null);
    }).toThrowError(errorMessage);
    expect(() => {
      compileGluestickConfig('string');
    }).toThrowError(errorMessage);
    expect(() => {
      compileGluestickConfig(1);
    }).toThrowError(errorMessage);
    expect(() => {
      compileGluestickConfig({});
    }).toThrowError(errorMessage);
  });

  it('should return overwriten config', () => {
    expect(compileGluestickConfig([{
      name: 'testPlugin',
      body: {
        GSConfig: {
          protocol: 'https',
        },
      },
    }])).toEqual({ ...defaultConfig, protocol: 'https' });
  });
});
