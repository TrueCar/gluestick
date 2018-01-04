jest.mock('fs', () => ({ statSync: jest.fn() }));

const path = require('path');
const fs = require('fs');
const eslintPlugin = require('../config');

const nodeEnv = 'test';

class Config {
  constructor(initialValue) {
    this.merge(initialValue);
  }

  merge(partialOrFunction) {
    if (typeof partialOrFunction === 'function') {
      partialOrFunction(this);
    } else {
      Object.assign(this, partialOrFunction);
    }
    return this;
  }
}

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
      const webpackClientConfig = new Config({
        plugins: [],
        module: {
          rules: [],
        },
      });
      const { client } = eslintPlugin();
      const { plugins, module: { rules } } = client(webpackClientConfig);
      expect(plugins.length).toBe(0);
      expect(rules.length).toBe(0);
    });

    it('should add loader if `enableInProduction` is set to `true`', () => {
      const webpackClientConfig = new Config({
        plugins: [],
        module: {
          rules: [],
        },
      });
      const { client } = eslintPlugin({ enableInProduction: true });
      const modifiedConfig = client(webpackClientConfig);
      expect(modifiedConfig.module.rules.length).toBe(1);
      expect(modifiedConfig.plugins.length).toBe(1);
    });
  });

  describe('in development', () => {
    beforeAll(() => {
      process.env.NODE_ENV = nodeEnv;
    });

    it('should add loader and reorder plugin', () => {
      const webpackClientConfig = new Config({
        plugins: [],
        module: {
          rules: [],
        },
      });
      const { client } = eslintPlugin();
      const modifiedConfig = client(webpackClientConfig);
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
