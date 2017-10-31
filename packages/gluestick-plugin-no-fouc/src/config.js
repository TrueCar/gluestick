const ExtractTextPlugin = require('extract-text-webpack-plugin');

const modifyLoader = ({ rules }, test) => {
  const styleLoader = { loader: 'style-loader' };
  const index = rules.findIndex(rule => rule.test.source === test.source);
  if (index >= 0) {
    const loaders = rules[index].use;
    // eslint-disable-next-line no-param-reassign
    rules[index].use = [styleLoader].concat(
      ExtractTextPlugin.extract({
        fallback: loaders[0],
        use: loaders.slice(1),
        remove: false,
      }),
    );
  }
};

const clientWebpackConfig = (
  filename = '[name]-[contenthash].init-no-fouc.css',
) => config => {
  if (process.env.NODE_ENV !== 'production') {
    modifyLoader(config.module, /\.(scss)$/);
    modifyLoader(config.module, /\.(css)$/);
    config.plugins.push(
      new ExtractTextPlugin({
        filename,
        allChunks: true,
      }),
    );
  }
  return config;
};

module.exports = (options = {}) => ({
  postOverwrites: {
    clientWebpackConfig: clientWebpackConfig(options.filename),
  },
});
