jest.mock('extract-text-webpack-plugin', () => {
  let calledTimes = 0;
  class ExtractTestWebpackPlugin {
    constructor(opts) {
      this.opts = opts;
      calledTimes++;
    }
  }
  ExtractTestWebpackPlugin.extract = v => v;
  ExtractTestWebpackPlugin.calledTimes = () => calledTimes;
  return ExtractTestWebpackPlugin;
});

const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const noFoucPlugin = require('../config');

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

describe('gluestick no-fouc plugin', () => {
  describe('in production', () => {
    it('should do nothing', () => {
      process.env.NODE_ENV = 'production';
      const webpackClientConfig = new Config({
        plugins: [],
        module: {
          rules: [
            {
              test: /\.(css)$/,
              use: [],
            },
          ],
        },
      });
      const { client } = noFoucPlugin();
      const { plugins, module: { rules } } = client(webpackClientConfig);
      expect(plugins.length).toBe(0);
      expect(rules.length).toBe(1);
      expect(ExtractTextWebpackPlugin.calledTimes()).toBe(0);
      process.env.NODE_ENV = nodeEnv;
    });
  });

  describe('in development', () => {
    beforeEach(() => {
      process.env.NODE_ENV = nodeEnv;
    });

    it('should modify scss/css rules and add a plugin', () => {
      const webpackClientConfig = new Config({
        plugins: [],
        module: {
          rules: [
            {
              test: /\.(scss)$/,
              use: ['style-loader', 'css-loader', 'sass-loader'],
            },
            {
              test: /\.(css)$/,
              use: ['style-loader', 'css-loader'],
            },
          ],
        },
      });
      const { client } = noFoucPlugin();
      const modifiedConfig = client(webpackClientConfig);
      expect(modifiedConfig.plugins.length).toBe(1);
      expect(modifiedConfig.plugins[0].opts.filename).toBeDefined();
      expect(modifiedConfig.plugins[0].opts.allChunks).toBeTruthy();
      expect(modifiedConfig.module.rules[0].use).toEqual([
        { loader: 'style-loader' },
        {
          fallback: 'style-loader',
          remove: false,
          use: ['css-loader', 'sass-loader'],
        },
      ]);
      expect(modifiedConfig.module.rules[1].use).toEqual([
        { loader: 'style-loader' },
        {
          fallback: 'style-loader',
          remove: false,
          use: ['css-loader'],
        },
      ]);
    });

    it('should use provided filename from options', () => {
      const filename = 'my-filename.css';
      const { client } = noFoucPlugin({ filename });
      expect(
        client(
          new Config({
            plugins: [],
            module: { rules: [] },
          }),
        ).plugins[0].opts.filename,
      ).toEqual(filename);
    });
  });
});
