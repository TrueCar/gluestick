/* @flow */

import type { WebpackConfig, GSConfig, Logger } from '../../types';

const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const autoprefixer = require('autoprefixer');
const cssCustomProperties = require('postcss-custom-properties');
const postcssCalc = require('postcss-calc');

const progressHandler = require('./progressHandler');
const buildServerEntries = require('./buildServerEntries');
const getAliasesForApps = require('./getAliasesForApps');

module.exports = (
  logger: Logger,
  settings: Object,
  gluestickConfig: GSConfig,
  entries: Object,
  runtimeAndServerPlugins: Object[],
  {
    skipEntryGeneration,
    noProgress,
  }: { skipEntryGeneration: boolean, noProgress: boolean } = {},
): WebpackConfig => {
  const {
    buildAssetsPath,
    assetsPath,
    sourcePath,
    appsPath,
    sharedPath,
    configPath,
    nodeModulesPath,
  } = gluestickConfig;
  const appRoot: string = process.cwd();

  const outputPath: string = path.resolve(appRoot, buildAssetsPath);

  const ouputFileName = path.basename(
    settings.server.output,
    path.extname(settings.server.output),
  );

  // TODO side effect in configuration! figure out how to get rid of this thing!
  if (!skipEntryGeneration) {
    buildServerEntries(
      gluestickConfig,
      logger,
      entries,
      runtimeAndServerPlugins,
    );
  }

  return {
    context: appRoot,
    entry: {
      [ouputFileName]: settings.server.input,
    },
    resolve: {
      extensions: ['.js', '.css', '.json'],
      alias: {
        ...getAliasesForApps(gluestickConfig),
        root: appRoot,
        src: path.join(appRoot, sourcePath),
        assets: path.join(appRoot, assetsPath),
        shared: path.join(appRoot, sourcePath, sharedPath),
        config: path.join(appRoot, sourcePath, configPath),
        apps: path.join(appRoot, sourcePath, appsPath),
        compiled: path.join(appRoot, nodeModulesPath),
        'project-entries': path.join(
          appRoot,
          gluestickConfig.serverEntriesPath,
        ),
        'project-entries-config': path.join(
          appRoot,
          gluestickConfig.entriesPath,
        ),
        'entry-wrapper': path.join(appRoot, gluestickConfig.entryWrapperPath),
        'gluestick-hooks': path.join(appRoot, gluestickConfig.hooksPath),
        'redux-middlewares': path.join(
          appRoot,
          gluestickConfig.reduxMiddlewares,
        ),
        'plugins-config-path': gluestickConfig.pluginsConfigPath,
        'application-config': path.join(
          appRoot,
          gluestickConfig.sourcePath,
          gluestickConfig.configPath,
          gluestickConfig.applicationConfigPath,
        ),
      },
    },
    output: {
      path: path.dirname(settings.server.output),
      filename: '[name].js',
      chunkFilename: '[name].js',
      libraryTarget: 'commonjs2',
      pathinfo: true,
    },
    module: {
      noParse: [/cli\/helpers/],
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
                presets: ['es2015', 'react', 'stage-0'],
                babelrc: false,
              },
            },
          ],
        },
        {
          test: /\.(scss)$/,
          use: ['ignore-loader'],
        },
        {
          test: /\.(css)$/,
          use: ['ignore-loader'],
        },
        {
          test: /\.(png|jpg|gif|ico|svg)(\?v=\d+\.\d+\.\d+)?$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name]-[hash].[ext]',
                emitFile: false,
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
                emitFile: false,
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
      !noProgress && progressHandler(logger, 'server'),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      }),
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
    ].filter(Boolean),
    node: {
      net: 'empty',
      __dirname: false,
      __filename: false,
    },
    target: 'node',
    devtool: 'source-map',
    // "externals" speeds up server builds by not bundling modules that could be imported,
    // but certain server/client packages with global caches need to be bundled.
    externals: [
      nodeExternals({
        whitelist: [
          /react-universal-component/,
          /webpack-flush-chunks/,
          /universal-import/,
        ],
      }),
    ],
  };
};
