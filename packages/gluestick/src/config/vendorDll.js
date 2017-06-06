const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

const manifestFilename: string = 'vendor-manifest.json';

const isValid = ({ logger, config }) => {
  // @TODO
  return false;
};

const getConfig = ({ logger, config }) => {
  // do we need loaders??
  const appRoot: string = process.cwd();
  const buildDllPath: string = path.join(process.cwd(), config.GSConfig.buildDllPath);
  const { vendorSourcePath }: { vendorSourcePath: string } = config.GSConfig;
  return {
    context: appRoot,
    resolve: {
      extensions: ['.js', '.css', '.json'],
    },
    entry: {
      vendor: [path.join(process.cwd(), vendorSourcePath)],
    },
    output: {
      path: buildDllPath,
      filename: '[name]-[hash].dll.js',
      library: '[name]_[hash]', // or libraryTarget
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      new webpack.DllPlugin({
        // The manifest we will use to reference the libraries
        path: path.join(buildDllPath, manifestFilename.replace('vendor', '[name]')),
        name: '[name]_[hash]',
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
        },
      }),
    ],
    bail: true,
  };
};

const getBundleName = ({ config }): string => {
  const { buildDllPath } = config.GSConfig;
  const manifestPath: string = path.join(process.cwd(), buildDllPath, manifestFilename);
  // Can't require it, because it will throw an error on server
  const { name } = JSON.parse(fs.readFileSync(manifestPath));
  // It will be used by server thus compiled by webpack, so then we have access to
  // webpack's public path
  const publicPath: string = __webpack_public_path__ || '/assets/'; // eslint-disable-line
  return `${publicPath}dlls/${name.replace('_', '-')}.dll.js`;
};

module.exports = {
  isValid,
  getConfig,
  getBundleName,
  manifestFilename,
};
