/* @flow */

import type { WebpackConfig, GSConfig } from '../../types';

const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const cssCustomProperties = require('postcss-custom-properties');
const postcssCalc = require('postcss-calc');
const getAliasesForApps = require('./getAliasesForApps');

module.exports = (gluestickConfig: GSConfig): WebpackConfig => {
  const appRoot: string = process.cwd();
  const {
    buildAssetsPath,
    assetsPath,
    sourcePath,
    appsPath,
    sharedPath,
    configPath,
    nodeModulesPath,
  } = gluestickConfig;
  const outputPath: string = path.resolve(appRoot, buildAssetsPath);

  const configuration: WebpackConfig = {
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

    output: {
      // filesystem path for static files
      path: outputPath,

      // network path for static files
      publicPath: '/assets/',

      // file name pattern for entry scripts
      filename: '[name].[chunkhash].js',

      // file name pattern for chunk scripts
      chunkFilename: '[name].[hash].js',
    },

    module: {
      rules: [{
        test: /\.js$/,
        exclude: new RegExp(`(node_modules/(?!gluestick))|(${buildAssetsPath})`),
        use: [{
          loader: 'babel-loader',
          options: {
            plugins: [
              'transform-decorators-legacy',
              'transform-flow-strip-types',
            ],
            presets: [
              'react',
              'es2015',
              'stage-0',
            ],
            babelrc: false,
          },
        }],
      },
      {
        test: /\.(scss)$/,
        use: [
          'style-loader',
          'css-loader?importLoaders=2&sourceMap',
          'postcss-loader',
          'sass-loader?outputStyle=expanded&sourceMap=true&sourceMapContents=true',
        ],
      },
      {
        test: /\.(css)$/,
        use: [
          'style-loader',
          'css-loader?importLoaders=2&sourceMap',
          'postcss-loader',
        ],
      },
      {
        test: /\.(png|jpg|gif|ico|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          'file-loader?name=[name]-[hash].[ext]',
          'image-webpack-loader',
        ],
      },
      {
        test: /\.(woff|woff2|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          'file-loader?name=[name]-[hash].[ext]',
        ],
      },
      {
        test: /\.(svg)$/,
        use: [
          'svg-react-loader',
        ],
      }],
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
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        filename: `vendor${process.env.NODE_ENV === 'production' ? '-[hash]' : ''}.bundle.js`,
      }),
    ],

    bail: true,
    node: {
      fs: 'empty',
      net: 'empty',
    },
  };

  return configuration;
};
