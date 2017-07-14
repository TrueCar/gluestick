/* eslint-disable no-useless-escape*/
jest.mock('../detectEnvironmentVariables.js', () =>
  jest.fn(file => {
    if (file.includes('0')) {
      return ['ENV_1', 'ENV_2'];
    }
    return file.includes('2') ? [] : ['ENV_3'];
  }),
);
jest.mock('webpack', () => ({
  DefinePlugin: class {
    constructor(spec) {
      this.spec = spec;
    }
  },
}));
const expose = require('../config');

describe('gluestick-env-expose-ast plugin', () => {
  describe('when exposing in compilation', () => {
    it('should not expose anything', () => {
      const results = expose({ parse: 'file2' }, {});
      const clientPlugins = results.postOverwrites.clientWebpackConfig({
        plugins: [],
      }).plugins;
      const serverPlugins = results.postOverwrites.serverWebpackConfig({
        plugins: [],
      }).plugins;
      expect(clientPlugins.length).toBe(0);
      expect(serverPlugins.length).toBe(0);
    });

    it('should expose from default file', () => {
      const results = expose({}, {});
      const clientPlugins = results.postOverwrites.clientWebpackConfig({
        plugins: [],
      }).plugins;
      const serverPlugins = results.postOverwrites.serverWebpackConfig({
        plugins: [],
      }).plugins;
      expect(clientPlugins.length).toBe(1);
      expect(serverPlugins.length).toBe(1);
    });

    it('should expose from single file', () => {
      process.env.ENV_1 = true;
      process.env.ENV_2 = false;
      const results = expose(
        {
          parse: 'file0',
        },
        {},
      );
      const clientPlugins = results.postOverwrites.clientWebpackConfig({
        plugins: [],
      }).plugins;
      expect(clientPlugins.length).toBe(1);
      expect(clientPlugins[0].spec).toEqual({
        'process.env.ENV_1': '"true"',
        'process.env.ENV_2': '"false"',
      });
      const serverPlugins = results.postOverwrites.serverWebpackConfig({
        plugins: [],
      }).plugins;
      expect(serverPlugins.length).toBe(1);
      expect(serverPlugins[0].spec).toEqual({
        'process.env.ENV_1': '"true"',
        'process.env.ENV_2': '"false"',
      });
    });

    it('should expose from multiple files', () => {
      process.env.ENV_1 = true;
      process.env.ENV_2 = false;
      process.env.ENV_3 = 'test';
      const results = expose(
        {
          parse: ['file0', 'file1'],
        },
        {},
      );
      const clientPlugins = results.postOverwrites.clientWebpackConfig({
        plugins: [],
      }).plugins;
      expect(clientPlugins.length).toBe(1);
      expect(clientPlugins[0].spec).toEqual({
        'process.env.ENV_1': '"true"',
        'process.env.ENV_2': '"false"',
        'process.env.ENV_3': '"test"',
      });
      const serverPlugins = results.postOverwrites.serverWebpackConfig({
        plugins: [],
      }).plugins;
      expect(serverPlugins.length).toBe(1);
      expect(serverPlugins[0].spec).toEqual({
        'process.env.ENV_1': '"true"',
        'process.env.ENV_2': '"false"',
        'process.env.ENV_3': '"test"',
      });
    });
  });

  describe('when exposing in runtime', () => {
    it('should add babel plugin', () => {
      const results = expose(
        {
          parse: 'file0',
          exposeRuntime: true,
        },
        {},
      );
      const config = results.postOverwrites.clientWebpackConfig({
        module: {
          rules: [
            {
              test: /\.js$/,
              use: [
                {
                  loader: 'babel-loader',
                  options: {
                    plugins: [],
                  },
                },
              ],
            },
          ],
        },
      });
      expect(config).toEqual({
        module: {
          rules: [
            {
              test: /\.js$/,
              use: [
                {
                  loader: 'babel-loader',
                  options: {
                    plugins: [require.resolve('babel-plugin-gluestick')],
                  },
                },
              ],
            },
          ],
        },
      });
    });

    it('should define array of var to expose and pass it to server build', () => {
      const results = expose(
        {
          parse: 'file0',
          exposeRuntime: true,
        },
        {},
      );
      const serverPlugins = results.postOverwrites.serverWebpackConfig({
        plugins: [],
      }).plugins;
      expect(serverPlugins.length).toBe(1);
      expect(serverPlugins[0].spec).toEqual({
        'process.env.ENV_VARIABLES': JSON.stringify(['ENV_1', 'ENV_2']),
      });
    });
  });
});
