/* @flow */

import type { WebpackConfig, GSConfig, Logger } from '../../types';

const webpack = require('webpack');
const path = require('path');
const clone = require('clone');
const DuplicatePackageChecker = require('duplicate-package-checker-webpack-plugin');
const buildEntries = require('./buildEntries');
const progressHandler = require('./progressHandler');
const ChunksPlugin = require('./ChunksPlugin');
const getAliasesForApps = require('./getAliasesForApps');
const autoprefixer = require('autoprefixer');
const cssCustomProperties = require('postcss-custom-properties');
const postcssCalc = require('postcss-calc');

const isProduction: boolean = process.env.NODE_ENV === 'production';

module.exports = (
  logger: Logger,
  configuration: WebpackConfig,
  settings: Object,
  gluestickConfig: GSConfig,
  entries: Object,
  runtimePlugins: Object[],
  {
    skipEntryGeneration,
    noProgress,
  }: { skipEntryGeneration: boolean, noProgress: boolean } = {},
): WebpackConfig => {
  const appRoot: string = process.cwd();
  const {
    buildAssetsPath,
    assetsPath,
    sourcePath,
    appsPath,
    sharedPath,
    configPath,
    nodeModulesPath,
    publicPath,
  } = gluestickConfig;
  const outputPath: string = path.resolve(appRoot, buildAssetsPath);

  // https://webpack.github.io/docs/multiple-entry-points.html
  let entry = skipEntryGeneration
    ? {}
    : buildEntries(gluestickConfig, logger, entries, runtimePlugins);
  entry = Object.keys(entry).reduce((prev, curr) => {
    return Object.assign(prev, {
      [curr]: ['babel-polyfill', entry[curr]],
    });
  }, {});

  const config = {
    context: appRoot,
    resolve: {
      extensions: ['.js', '.css', '.json'],
      alias: {
        ...getAliasesForApps(gluestickConfig),
        root: process.cwd(),
        src: path.join(process.cwd(), sourcePath),
        assets: path.join(process.cwd(), assetsPath),
        shared: path.join(process.cwd(), sourcePath, sharedPath),
        config: path.join(process.cwd(), sourcePath, configPath),
        apps: path.join(process.cwd(), sourcePath, appsPath),
        compiled: path.join(process.cwd(), nodeModulesPath),
      },
    },
    entry,
    output: {
      path: outputPath, // filesystem path for static files
      publicPath: `/${publicPath}/`.replace(/\/\//g, '/'), // network path for static files
      filename: '[name].[hash].js', // file name pattern for entry scripts
      chunkFilename: '[name].[hash].js', // file name pattern for chunk scripts
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: new RegExp(
            `(node_modules/(?!gluestick))|(${buildAssetsPath})`,
          ),
          use: [
            {
              loader: 'babel-loader',
              options: {
                plugins: ['transform-flow-strip-types'],
                presets: [['es2015', { modules: false }], 'react', 'stage-0'],
                babelrc: false,
              },
            },
          ],
        },
        {
          test: /\.(scss)$/,
          use: [
            'style-loader',
            `css-loader?importLoaders=2${isProduction ? '' : '&sourceMap'}`,
            'postcss-loader',
            `sass-loader${isProduction
              ? ''
              : '?outputStyle=expanded&sourceMap=true&sourceMapContents=true'}`,
          ],
        },
        {
          test: /\.(css)$/,
          use: [
            'style-loader',
            `css-loader?importLoaders=1${isProduction ? '' : '&sourceMap'}`,
            'postcss-loader',
          ],
        },
        {
          test: /\.(png|jpg|gif|ico|svg)(\?v=\d+\.\d+\.\d+)?$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name]-[hash].[ext]',
              },
            },
            {
              loader: 'image-webpack-loader',
              // Workaround https://github.com/tcoopman/image-webpack-loader/issues/88#issuecomment-289454242
              options: {},
            },
          ],
        },
        {
          test: /\.(woff|woff2|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name]-[hash].[ext]',
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new webpack.LoaderOptionsPlugin({
        test: /\.(scss|css)$/,
        options: {
          // A temporary workaround for `scss-loader`
          // https://github.com/jtangelder/sass-loader/issues/298
          output: {
            path: outputPath,
          },

          postcss: [
            autoprefixer({ browsers: 'last 2 version' }),
            cssCustomProperties(),
            postcssCalc(),
          ],

          // A temporary workaround for `css-loader`.
          // Can also supply `query.context` parameter.
          context: appRoot,
        },
      }),
      // Make it so *.server.js files return null in client
      new webpack.NormalModuleReplacementPlugin(
        /\.server(\.js)?$/,
        path.join(__dirname, './mocks/nullMock.js'),
      ),
      new DuplicatePackageChecker(),
      !noProgress && progressHandler(logger, 'client'),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        filename: `vendor${process.env.NODE_ENV === 'production'
          ? '-[hash]'
          : ''}.bundle.js`,
      }),
    ].filter(Boolean),
    node: {
      net: 'empty',
    },
  };

  config.plugins.push(new ChunksPlugin(clone(config)));

  return config;
};
