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

describe('gluestick no-fouc plugin', () => {
  describe('in production', () => {
    it('should do nothing', () => {
      process.env.NODE_ENV = 'production';
      const webpackClientConfig = {
        plugins: [],
        module: {
          rules: [
            {
              test: /\.(css)$/,
              use: [],
            },
          ],
        },
      };
      const { postOverwrites } = noFoucPlugin();
      expect(postOverwrites.clientWebpackConfig(webpackClientConfig)).toEqual(
        webpackClientConfig,
      );
      expect(ExtractTextWebpackPlugin.calledTimes()).toBe(0);
      process.env.NODE_ENV = nodeEnv;
    });
  });

  describe('in development', () => {
    beforeEach(() => {
      process.env.NODE_ENV = nodeEnv;
    });

    it('should modify scss/css rules and add a plugin', () => {
      const webpackClientConfig = {
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
      };
      const { postOverwrites } = noFoucPlugin();
      const modifiedConfig = postOverwrites.clientWebpackConfig(
        webpackClientConfig,
      );
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

    it('shuld use provided filename from options', () => {
      const filename = 'my-filename.css';
      const { postOverwrites } = noFoucPlugin({ filename });
      expect(
        postOverwrites.clientWebpackConfig({
          plugins: [],
          module: { rules: [] },
        }).plugins[0].opts.filename,
      ).toEqual(filename);
    });
  });
});
