/* @flow */
const compileGluestickConfig = require('../compileGlueStickConfig');
const defaultConfig = require('../defaults/glueStickConfig');

describe('config/compileGluestickConfig', () => {
  it('should return default config', () => {
    expect(compileGluestickConfig([])).toEqual(defaultConfig);
  });

  it('should throw error', () => {
    const errorMessage = 'Invalid plugins argument';
    expect(() => {
      // $FlowIgnore
      compileGluestickConfig();
    }).toThrowError(errorMessage);
    expect(() => {
      // $FlowIgnore
      compileGluestickConfig(null);
    }).toThrowError(errorMessage);
    expect(() => {
      // $FlowIgnore
      compileGluestickConfig('string');
    }).toThrowError(errorMessage);
    expect(() => {
      // $FlowIgnore
      compileGluestickConfig(1);
    }).toThrowError(errorMessage);
    expect(() => {
      // $FlowIgnore
      compileGluestickConfig({});
    }).toThrowError(errorMessage);
  });

  it('should return overwriten config', () => {
    // $FlowIgnore
    expect(compileGluestickConfig([
      // $FlowIgnore
      {
        name: 'testPlugin',
        body: {
          overwriteGluestickConfig: (config) => {
            return Object.assign(config, { protocol: 'https' });
          },
        },
      },
      // $FlowIgnore
      {
        name: 'testPlugin',
        body: {
          overwriteGluestickConfig: (config) => {
            return Object.assign(config, { host: 'test' });
          },
        },
      },
    ])).toEqual({ ...defaultConfig, protocol: 'https', host: 'test' });
  });
});
