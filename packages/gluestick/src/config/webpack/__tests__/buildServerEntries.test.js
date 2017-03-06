/* @flow */
require('./sharedMocks');

// $FlowIgnore
const entries = require('entries.json');
const path = require('path');
const buildServerEntries = require('../buildServerEntries');
const defaultGSConfig = require('../../defaults/glueStickConfig');
const generate = require('../../../generator');

describe('config/webpack/buildSeverEntries', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should build server entries definition file', () => {
    // $FlowIgnore
    buildServerEntries(
      defaultGSConfig,
      {},
      entries,
      [],
    );
    // $FlowIgnore
    expect(generate.mock.calls[0]).toEqual([{
      generatorName: 'serverEntries',
      entityName: path.basename(defaultGSConfig.serverEntriesPath),
      options: {
        serverEntriesPath: path.dirname(defaultGSConfig.serverEntriesPath),
        entries: [{
          path: '/',
          name: 'main',
          component: 'path/to/main/component',
          routes: 'path/to/main/routes',
          reducers: 'path/to/main/reducers',
        }, {
          path: '/home',
          name: 'home',
          component: 'path/to/home/component',
          routes: 'path/to/home/routes',
          reducers: 'path/to/home/reducers',
        }],
        plugins: [],
      },
    }, {}]);
  });
});
