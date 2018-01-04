/* @flow */

require('./sharedMocks');

jest.mock('glob', () => ({
  sync: jest.fn(() => ['path/to/main/entry.js']),
}));
jest.mock('fs-extra');

// $FlowIgnore
const entries = require('entries.json');
const buildClientEntrypoints = require('../buildClientEntrypoints');
const defaultGSConfig = require('../../../config/defaults/glueStickConfig');
const generate = require('gluestick-generators').default;

describe('webpack/utils/buildClientEntrypoints', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should build all client entries', () => {
    // $FlowIgnore
    expect(buildClientEntrypoints(defaultGSConfig, {}, entries, [])).toEqual({
      main: `./${defaultGSConfig.clientEntryInitPath}/main`,
      home: `./${defaultGSConfig.clientEntryInitPath}/home`,
    });
    // $FlowIgnore
    expect(generate.mock.calls[0][0]).toEqual({
      generatorName: 'clientEntryInit',
      entityName: 'main',
      options: {
        component: 'path/to/main/component',
        routes: 'path/to/main/routes',
        reducers: 'path/to/main/reducers',
        config: `${defaultGSConfig.configPath}/${defaultGSConfig.applicationConfigPath}`,
        clientEntryInitPath: defaultGSConfig.clientEntryInitPath,
        plugins: [],
        enableErrorOverlay: true,
      },
    });
    // $FlowIgnore
    expect(generate.mock.calls[1][0]).toEqual({
      generatorName: 'clientEntryInit',
      entityName: 'home',
      options: {
        component: 'path/to/home/component',
        routes: 'path/to/home/routes',
        reducers: 'path/to/home/reducers',
        config: 'path/to/home/config',
        clientEntryInitPath: defaultGSConfig.clientEntryInitPath,
        plugins: [],
        enableErrorOverlay: true,
      },
    });
  });

  it('should build only a signle client entry', () => {
    const homeEntry = Object.keys(entries)
      .filter(k => k === '/home')
      .reduce((acc, key) => ({ ...acc, [key]: entries[key] }), {});
    // $FlowIgnore
    expect(buildClientEntrypoints(defaultGSConfig, {}, homeEntry, [])).toEqual({
      home: `./${defaultGSConfig.clientEntryInitPath}/home`,
    });
    // $FlowIgnore
    expect(generate.mock.calls[0][0]).toEqual({
      generatorName: 'clientEntryInit',
      entityName: 'home',
      options: {
        component: 'path/to/home/component',
        routes: 'path/to/home/routes',
        reducers: 'path/to/home/reducers',
        config: 'path/to/home/config',
        clientEntryInitPath: defaultGSConfig.clientEntryInitPath,
        plugins: [],
        enableErrorOverlay: true,
      },
    });
  });
});
