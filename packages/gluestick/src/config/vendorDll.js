const path = require('path');
const webpack = require('webpack');

const isValid = ({ logger, config }) => {
  // @TODO
  return false;
};

const getConfig = ({ logger, config }) => {
  // do we need loaders??
  return {
    extensions: ['.js', '.css', '.json'],
    entry: {
      vendor: [path.join(process.cwd(), 'src/vendor.js')],
    },
    output: {
      path: path.join(process.cwd(), 'build/assets'),
      filename: '[name].dll.js',
      library: '[name]_[hash]',
    },
    plugins: [
      new webpack.DllPlugin({
        // The manifest we will use to reference the libraries
        path: path.join('vendor', '[name]-manifest.json'),
        name: '[name]-[hash]',
      }),
    ],
  };
};

module.exports = {
  isValid,
  getConfig,
};
