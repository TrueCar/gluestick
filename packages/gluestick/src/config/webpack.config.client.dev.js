const webpack = require('webpack');
const baseConfiguration = require('./webpack.config.client');

const WEBPACK_DEV_SERVER_PORT = 3001;

const configuration = baseConfiguration({ development: true, css_bundle: true });

// configuration.devtool = 'inline-eval-cheap-source-map'

configuration.plugins.push(
  // environment variables
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('development'),
      BABEL_ENV: JSON.stringify('development/client'),
    },
    REDUX_DEVTOOLS: false, // enable/disable redux-devtools
  }),

  // faster code reload on changes
  new webpack.HotModuleReplacementPlugin(),

  // prints more readable module names in the browser console on HMR updates
  new webpack.NamedModulesPlugin(),

  // // extracts common javascript into a separate file (works)
  // new webpack.optimize.CommonsChunkPlugin('common', 'common.[hash].js')
);

// enable webpack development server
configuration.entry.main = [
  `webpack-hot-middleware/client?path=http://localhost:${WEBPACK_DEV_SERVER_PORT}/__webpack_hmr`,
  //'react-hot-loader/patch',
  configuration.entry.main,
];

// network path for static files: fetch all statics from webpack development server
configuration.output.publicPath = `http://localhost:${WEBPACK_DEV_SERVER_PORT}${configuration.output.publicPath}`;

// https://github.com/webpack/webpack/issues/3486
configuration.performance = { hints: false };

export default configuration;
