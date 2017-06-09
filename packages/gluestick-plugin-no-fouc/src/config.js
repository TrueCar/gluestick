const ExtractTextPlugin = require('extract-text-webpack-plugin');

const clientWebpackConfig = config => {
  if (process.env.NODE_ENV !== 'production') {
    const scssLoaders = config.module.rules[1].use;
    const styleLoader = { loader: 'style-loader' };
    config.module.rules[1].use = [styleLoader].concat(ExtractTextPlugin.extract({
      fallback: scssLoaders[0],
      use: scssLoaders.slice(1),
      remove: false,
    }));
    const cssLoaders = config.module.rules[2].use;
    config.module.rules[2].use = [styleLoader].concat(ExtractTextPlugin.extract({
      fallback: cssLoaders[0],
      use: cssLoaders.slice(1),
      remove: false,
    }));
    config.plugins.push(
      new ExtractTextPlugin({
        filename: '[name]-[contenthash].fouc-reducer.css',
        allChunks: true
      })
    );
  };
  return config;
};

module.exports = () => ({
  postOverwrites: {
    clientWebpackConfig,
  },
});
