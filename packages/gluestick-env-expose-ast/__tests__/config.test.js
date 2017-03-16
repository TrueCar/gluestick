/* eslint-disable no-useless-escape*/
jest.mock('../detectEnvironmentVariables.js', () => jest.fn(
  (file) => {
    if (file.includes('0')) {
      return ['ENV_1', 'ENV_2'];
    }
    return file.includes('2') ? [] : ['ENV_3'];
  },
));
jest.mock('webpack', () => ({
  DefinePlugin: class {
    constructor(spec) {
      this.spec = spec;
    }
  },
}));
const expose = require('../config');

test('plugin should not expose anything', () => {
  const results = expose({ parse: 'file2' }, {});
  const clientPlugins = results.postOverwrites.clientWebpackConfig({ plugins: [] }).plugins;
  const serverPlugins = results.postOverwrites.serverWebpackConfig({ plugins: [] }).plugins;
  expect(clientPlugins.length).toBe(0);
  expect(serverPlugins.length).toBe(0);
});

test('plugin should expose from default file', () => {
  const results = expose({}, {});
  const clientPlugins = results.postOverwrites.clientWebpackConfig({ plugins: [] }).plugins;
  const serverPlugins = results.postOverwrites.serverWebpackConfig({ plugins: [] }).plugins;
  expect(clientPlugins.length).toBe(1);
  expect(serverPlugins.length).toBe(1);
});

test('plugin should expose from single file', () => {
  process.env.ENV_1 = true;
  process.env.ENV_2 = false;
  const results = expose({
    parse: 'file0',
  }, {});
  const clientPlugins = results.postOverwrites.clientWebpackConfig({ plugins: [] }).plugins;
  expect(clientPlugins.length).toBe(1);
  expect(clientPlugins[0].spec).toEqual({
    'process.env.ENV_1': '\"true\"',
    'process.env.ENV_2': '\"false\"',
  });
  const serverPlugins = results.postOverwrites.serverWebpackConfig({ plugins: [] }).plugins;
  expect(serverPlugins.length).toBe(1);
  expect(serverPlugins[0].spec).toEqual({
    'process.env.ENV_1': '\"true\"',
    'process.env.ENV_2': '\"false\"',
  });
});

test('plugin should expose from multiple files', () => {
  process.env.ENV_1 = true;
  process.env.ENV_2 = false;
  process.env.ENV_3 = 'test';
  const results = expose({
    parse: ['file0', 'file1'],
  }, {});
  const clientPlugins = results.postOverwrites.clientWebpackConfig({ plugins: [] }).plugins;
  expect(clientPlugins.length).toBe(1);
  expect(clientPlugins[0].spec).toEqual({
    'process.env.ENV_1': '\"true\"',
    'process.env.ENV_2': '\"false\"',
    'process.env.ENV_3': '\"test\"',
  });
  const serverPlugins = results.postOverwrites.serverWebpackConfig({ plugins: [] }).plugins;
  expect(serverPlugins.length).toBe(1);
  expect(serverPlugins[0].spec).toEqual({
    'process.env.ENV_1': '\"true\"',
    'process.env.ENV_2': '\"false\"',
    'process.env.ENV_3': '\"test\"',
  });
});
