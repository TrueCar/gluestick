const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const sha1 = require('sha1');
const progressHandler = require('./webpack/progressHandler');

const manifestFilename: string = 'vendor-manifest.json';

const getVendorSource = config => {
  return fs.readFileSync(path.join(process.cwd(), config.GSConfig.vendorSourcePath));
};

const getDependenciesHash = (config, vendorEntryParts, vendorSource) => {
  const projectPackage = require(path.join(process.cwd(), 'package.json'));
  const projectDependencies = {
    ...projectPackage.devDependencies,
    ...projectPackage.dependencies,
  };
  return sha1(
    Object.keys(projectDependencies)
      .filter((name) => {
        return (
          vendorEntryParts.find((part) => part.includes(name)) ||
          vendorSource.includes(name)
        );
      })
      .map((name) => `${name}@${projectDependencies[name]}`)
      .join('|'),
  );
};

const isValid = ({ logger, config }, vendorWebpackConfig) => {
  const { buildDllPath }: { buildDllPath: string } = config.GSConfig;

  // Check if manifest exists
  const vendorDllBundleManifestPath = path.join(process.cwd(), buildDllPath, manifestFilename);
  let manifestContent;
  try {
    manifestContent = require(vendorDllBundleManifestPath);
  } catch (e) {
    logger.info('Vendor DLL manifest does not exists, recompiling');
    return false;
  }

  // Check if DLL bundle itself exists
  const vendorDllBundlePath = path.join(
    process.cwd(),
    config.GSConfig.buildDllPath,
    `${manifestContent.name.replace('_', '-')}.dll.js`,
  );
  if (!fs.existsSync(vendorDllBundlePath)) {
    logger.info('Vendor DLL bundle does not exists, recompiling');
    return false;
  }

  // Check if manifest has validation metadata, if doesn't, it means bundle is not valid, since
  // we cannot perform other checks
  if (!manifestContent.validationMetadata) {
    logger.info('Validation metadata are not defined, recompiling');
    return false;
  }

  // Compare elements from vendor entry array stored in manifest against config
  // which would be used to build DLL bundle
  const vendorEntryParts: string[] = manifestContent.validationMetadata.entryParts;
  const currentEntryParts: string[] = vendorWebpackConfig.entry.vendor;
  if (
    !Array.isArray(vendorEntryParts) ||
    vendorEntryParts.length !== currentEntryParts.length ||
    !vendorEntryParts.every((v, i) => v === currentEntryParts[i]) ||
    !currentEntryParts.every((v, i) => v === vendorEntryParts[i])
  ) {
    logger.info('Vendor DLL entry parts mismatch, recompiling');
    return false;
  }

  // Check if vendor source file's hash is the same as stored in manifest
  const vendorSourceHash: string = manifestContent.validationMetadata.sourceHash;
  const vendorSource: string = getVendorSource(config);
  if (vendorSourceHash !== sha1(vendorSource)) {
    logger.info('Vendor source hash mismatch, recompiling');
    return false;
  }

  // Check if dependencies version from project `package.json` has changed
  const dependenciesHash: string = manifestContent.validationMetadata.dependenciesHash;
  if (getDependenciesHash(config, vendorEntryParts, vendorSource) !== dependenciesHash) {
    logger.info('Vendor dependencies hash mismatch, recompiling');
    return false;
  }

  logger.success('Vendor DLL bundle is valid, bailing from recompilation');
  return true;
};

const injectValidationMetadata = ({ config }, vendorWebpackConfig) => {
  const { buildDllPath }: { vendorSourcePath: string } = config.GSConfig;
  const manifestPath = path.join(process.cwd(), buildDllPath, manifestFilename);
  const manifestContent = JSON.parse(fs.readFileSync(manifestPath));
  const entryParts = vendorWebpackConfig.entry.vendor;
  const vendorSource = getVendorSource(config);
  const dependenciesHash = getDependenciesHash(config, entryParts, vendorSource);
  manifestContent.validationMetadata = {
    entryParts,
    sourceHash: sha1(vendorSource),
    dependenciesHash,
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifestContent, null, '  '));
};

const getConfig = ({ logger, config }) => {
  // do we need loaders??
  const appRoot: string = process.cwd();
  const buildDllPath: string = path.join(process.cwd(), config.GSConfig.buildDllPath);
  const { vendorSourcePath }: { vendorSourcePath: string } = config.GSConfig;
  return {
    context: appRoot,
    resolve: {
      extensions: ['.js', '.json'],
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
      progressHandler(logger, 'vendor'),
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
  injectValidationMetadata,
  manifestFilename,
};
