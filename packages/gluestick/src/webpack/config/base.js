/* @flow */

import type { Entries } from '../types';

const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const cssCustomProperties = require('postcss-custom-properties');
const postcssCalc = require('postcss-calc');
const Config = require('webpack-config').default;

const gluestickConfig = require('../../config/defaults/glueStickConfig');
const getAliasesForApps = require('../utils/getAliasesForApps');

module.exports = ({ entries }: { entries: string | Entries }) => {
  const {
    buildAssetsPath,
    assetsPath,
    sourcePath,
    appsPath,
    sharedPath,
    configPath,
    nodeModulesPath,
  } = gluestickConfig;

  const isProduction: boolean = process.env.NODE_ENV === 'production';
  const appRoot: string = process.cwd();
  const outputPath: string = path.resolve(appRoot, buildAssetsPath);

  return new Config().merge({
    context: appRoot,
    entry: entries,
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
            'file-loader?name=[name]-[hash].[ext]',
            {
              loader: 'image-webpack-loader',
              // Workaround https://github.com/tcoopman/image-webpack-loader/issues/88#issuecomment-289454242
              options: {},
            },
          ],
        },
        {
          test: /\.(woff|woff2|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
          use: ['file-loader?name=[name]-[hash].[ext]'],
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
    ],
    node: {
      net: 'empty',
    },
  });
};
