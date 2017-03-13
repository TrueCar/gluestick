/* eslint-disable no-useless-escape*/
jest.mock('../detectEnvironmentVariables.js', () => jest.fn(
  (file) => file.includes('0') ? ['ENV_1', 'ENV_2'] : ['ENV_3'],
));
jest.mock('webpack', () => ({
  DefinePlugin: class {
    constructor(spec) {
      this.spec = spec;
    }
  },
}));
const expose = require('../config');

test('plugin should expose from default file', () => {
  const results = expose({}, {});
  const clientPlugins = results.overwriteClientWebpackConfig({ plugins: [] }).plugins;
  const serverPlugins = results.overwriteServerWebpackConfig({ plugins: [] }).plugins;
  expect(clientPlugins.length).toBe(1);
  expect(serverPlugins.length).toBe(1);
});

test('plugin should expose from single file', () => {
  process.env.ENV_1 = true;
  process.env.ENV_2 = false;
  const results = expose({
    parse: 'file0',
  }, {});
  const clientPlugins = results.overwriteClientWebpackConfig({ plugins: [] }).plugins;
  expect(clientPlugins.length).toBe(1);
  expect(clientPlugins[0].spec).toEqual({
    'process.env.ENV_1': '\"true\"',
    'process.env.ENV_2': '\"false\"',
  });
  const serverPlugins = results.overwriteServerWebpackConfig({ plugins: [] }).plugins;
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
  const clientPlugins = results.overwriteClientWebpackConfig({ plugins: [] }).plugins;
  expect(clientPlugins.length).toBe(1);
  expect(clientPlugins[0].spec).toEqual({
    'process.env.ENV_1': '\"true\"',
    'process.env.ENV_2': '\"false\"',
    'process.env.ENV_3': '\"test\"',
  });
  const serverPlugins = results.overwriteServerWebpackConfig({ plugins: [] }).plugins;
  expect(serverPlugins.length).toBe(1);
  expect(serverPlugins[0].spec).toEqual({
    'process.env.ENV_1': '\"true\"',
    'process.env.ENV_2': '\"false\"',
    'process.env.ENV_3': '\"test\"',
  });
});
