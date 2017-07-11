/* @flow */

const pluginsFilter = require('../pluginsFilter');

const plugins = [
  // $FlowIgnore
  'test-plugin-0',
  {
    plugin: 'test-plugin-1',
  },
  {
    plugin: 'test-plugin-2',
    rootWrapper: true,
  },
];

test('Plugins filter should filter array without invertion', () => {
  expect(pluginsFilter(plugins, 'rootWrapper')).toEqual([plugins[2]]);
});

test('Plugins filter should filter array with invertion', () => {
  expect(pluginsFilter(plugins, 'rootWrapper', true)).toEqual([
    plugins[0],
    plugins[1],
  ]);
});
