/* @flow */

require('./sharedMocks');

// $FlowIgnore
const entries = require('entries.json');
const path = require('path');
const buildServerEntrypoints = require('../buildServerEntrypoints');
const defaultGSConfig = require('../../../config/defaults/glueStickConfig');
const generate = require('gluestick-generators').default;

describe('webpack/utils/buildServerEntrypoints', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should build server entries definition file', () => {
    // $FlowIgnore
    buildServerEntrypoints(defaultGSConfig, {}, entries, []);
    // $FlowIgnore
    expect(generate.mock.calls[0][0]).toEqual({
      generatorName: 'serverEntries',
      entityName: path.basename(defaultGSConfig.serverEntriesPath),
      options: {
        serverEntriesPath: path.dirname(defaultGSConfig.serverEntriesPath),
        entries: [
          {
            path: '/',
            name: 'main',
            component: 'path/to/main/component',
            routes: 'path/to/main/routes',
            reducers: 'path/to/main/reducers',
          },
          {
            path: '/home',
            name: 'home',
            config: 'path/to/home/config',
            component: 'path/to/home/component',
            routes: 'path/to/home/routes',
            reducers: 'path/to/home/reducers',
          },
        ],
        plugins: [],
      },
    });
  });
});
