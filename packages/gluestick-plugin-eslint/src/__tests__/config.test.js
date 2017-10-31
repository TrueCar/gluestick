jest.mock('fs', () => ({ statSync: jest.fn() }));

const path = require('path');
const fs = require('fs');
const eslintPlugin = require('../config');

const nodeEnv = 'test';

describe('gluestick eslint plugin', () => {
  it('ReorderLintWarningsPlugin should sort warnings and errors from newest to oldest', done => {
    fs.statSync.mockImplementation(resource => {
      switch (resource) {
        case 'A':
          return { mtime: 2000 };
        case 'B':
          return { mtime: 1500 };
        case 'C':
          return { mtime: 1000 };
        default:
          return {};
      }
    });
    const reorderPlugin = new eslintPlugin.ReorderLintWarningsPlugin();
    const compilation = {
      warnings: [
        {
          module: {
            resource: 'B',
          },
        },
        {
          module: {
            resource: 'A',
          },
        },
        {
          module: {
            resource: 'C',
          },
        },
      ],
      errors: [
        {
          module: {
            resource: 'B',
          },
        },
        {
          module: {
            resource: 'A',
          },
        },
      ],
    };
    const doneCb = () => {
      expect(compilation.warnings[0].module.resource).toEqual('A');
      expect(compilation.warnings[1].module.resource).toEqual('B');
      expect(compilation.warnings[2].module.resource).toEqual('C');
      expect(compilation.errors[0].module.resource).toEqual('A');
      expect(compilation.errors[1].module.resource).toEqual('B');
      done();
    };
    const compiler = {
      plugin: (evn, callback) => {
        callback(compilation, doneCb);
      },
    };
    reorderPlugin.apply(compiler);
  });

  describe('in production', () => {
    beforeAll(() => {
      process.env.NODE_ENV = 'production';
    });

    afterAll(() => {
      process.env.NODE_ENV = nodeEnv;
    });

    it('should do nothing', () => {
      const webpackClientConfig = {
        plugins: [],
        module: {
          rules: [],
        },
      };
      const { postOverwrites } = eslintPlugin();
      expect(postOverwrites.clientWebpackConfig(webpackClientConfig)).toEqual(
        webpackClientConfig,
      );
    });

    it('should add loader if `enableInProduction` is set to `true`', () => {
      const webpackClientConfig = {
        plugins: [],
        module: {
          rules: [],
        },
      };
      const { postOverwrites } = eslintPlugin({ enableInProduction: true });
      const modifiedConfig = postOverwrites.clientWebpackConfig(
        webpackClientConfig,
      );
      expect(modifiedConfig.module.rules.length).toBe(1);
      expect(modifiedConfig.plugins.length).toBe(1);
    });
  });

  describe('in development', () => {
    beforeAll(() => {
      process.env.NODE_ENV = nodeEnv;
    });

    it('should add loader and reorder plugin', () => {
      const webpackClientConfig = {
        plugins: [],
        module: {
          rules: [],
        },
      };
      const { postOverwrites } = eslintPlugin();
      const modifiedConfig = postOverwrites.clientWebpackConfig(
        webpackClientConfig,
      );
      expect(modifiedConfig.plugins[0].constructor.name).toEqual(
        'ReorderLintWarningsPlugin',
      );
      expect(modifiedConfig.module.rules).toEqual([
        {
          enforce: 'pre',
          test: /\.js$/,
          exclude: /node_modules|gluestick/,
          loader: 'eslint-loader',
          options: {
            configFile: path.join(process.cwd(), '.eslintrc'),
          },
        },
      ]);
    });
  });
});
