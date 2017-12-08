/* @flow */

const webpack = require('webpack');

module.exports = (baseConfig, { devServerHost, devServerPort }) =>
  baseConfig
    .merge({
      devtool: 'cheap-module-eval-source-map',
      plugins: [
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify('development'),
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(),
        new webpack.LoaderOptionsPlugin({
          test: /\.(scss|css)$/,
          debug: true,
        }),
      ],
      // https://github.com/webpack/webpack/issues/3486
      performance: { hints: false },
    })
    .merge(config => {
      // eslint-disable-next-line no-param-reassign
      config.output.publicPath = `http://${devServerHost}:${devServerPort}${config
        .output.publicPath}`;

      // eslint-disable-next-line no-param-reassign
      config.entry = Object.keys(config.entry).reduce((prev, curr) => {
        return Object.assign(prev, {
          [curr]: [
            'eventsource-polyfill',
            'react-hot-loader/patch',
            `webpack-hot-middleware/client?path=http://${devServerHost}:${devServerPort}/__webpack_hmr`,
            'webpack/hot/only-dev-server',
          ].concat(config.entry[curr]),
        });
      }, {});
    });
