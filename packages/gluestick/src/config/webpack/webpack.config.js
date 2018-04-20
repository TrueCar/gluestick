/* @flow */
import type { WebpackConfig, GSConfig } from '../../types';

const path = require('path');
const getAliasesForApps = require('./getAliasesForApps');
const ExtractCssChunks = require('extract-css-chunks-webpack-plugin');
const autoprefixer = require('autoprefixer');
const cssCustomProperties = require('postcss-custom-properties');
const postcssCalc = require('postcss-calc');

const isProduction: boolean = process.env.NODE_ENV === 'production';

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
    publicPath,
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
      publicPath: `/${publicPath}/`.replace(/\/\//g, '/'),

      // file name pattern for entry scripts
      filename: '[name].[hash].js',

      // file name pattern for chunk scripts
      chunkFilename: '[name].[hash].js',
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
                plugins: ['universal-import', 'transform-flow-strip-types'],
                presets: ['es2015', 'react', 'stage-0'],
                babelrc: false,
              },
            },
          ],
        },
        {
          test: /\.(s?css)$/,
          use: ExtractCssChunks.extract({
            use: [
              {
                loader: `css-loader`,
                options: {
                  sourceMap: !!isProduction,
                },
              },
              {
                loader: 'postcss-loader',
                options: {
                  ident: 'postcss',
                  plugins: () => [
                    autoprefixer({ browsers: 'last 2 version' }),
                    cssCustomProperties(),
                    postcssCalc(),
                  ],
                },
              },
              {
                loader: 'sass-loader',
                options: {
                  outputStyle: 'expanded',
                  sourceMap: !!isProduction,
                  sourceMapContents: true,
                },
              },
            ],
          }),
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

    plugins: [new ExtractCssChunks()],
    node: {
      net: 'empty',
    },
  };

  return configuration;
};
