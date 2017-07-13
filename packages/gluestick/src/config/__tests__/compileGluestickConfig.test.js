/* @flow */
jest.mock('../../utils', () => ({ requireModule: v => require(v) }));
jest.mock(
  'cwd/src/gluestick.config.js',
  () => config => ({ ...config, buildStaticPath: 'test' }),
  { virtual: true },
);
const compileGluestickConfig = require('../compileGlueStickConfig');
const defaultConfig = require('../defaults/glueStickConfig');

const logger = require('../../__tests__/mocks/context').commandApi.getLogger();

describe('config/compileGluestickConfig', () => {
  it('should return default config', () => {
    expect(compileGluestickConfig(logger, [])).toEqual(defaultConfig);
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
    const originalProcessCwd = process.cwd.bind(process);
    // $FlowIgnore
    process.cwd = () => 'cwd';
    expect(
      compileGluestickConfig(logger, [
        // $FlowIgnore
        {
          name: 'testPlugin',
          postOverwrites: {
            gluestickConfig: config => {
              return { ...config, protocol: 'https' };
            },
          },
        },
        // $FlowIgnore
        {
          name: 'testPlugin',
          postOverwrites: {
            gluestickConfig: config => {
              return { ...config, host: 'test' };
            },
          },
        },
      ]),
    ).toEqual({
      ...defaultConfig,
      protocol: 'https',
      host: 'test',
      buildStaticPath: 'test',
    });
    // $FlowIgnore
    process.cwd = originalProcessCwd;
  });
});
