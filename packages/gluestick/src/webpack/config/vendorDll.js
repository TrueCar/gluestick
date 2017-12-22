/* @flow */

import type { CLIContext, ConfigPlugin } from '../../types';

const path = require('path');
const fs = require('fs');
const Config = require('webpack-config').default;
const webpack = require('webpack');
const sha1 = require('sha1');
const progressHandler = require('../plugins/progressHandler');
const applyConfigPlugins = require('../utils/applyConfigPlugins');
const { requireModule } = require('../../utils');

const manifestFilename: string = 'vendor-manifest.json';
// Need to set env variable, so that server can access it
process.env.GS_VENDOR_MANIFEST_FILENAME = manifestFilename;

function getVendorSource(config: Config): string {
  return fs
    .readFileSync(path.join(process.cwd(), config.GSConfig.vendorSourcePath))
    .toString();
}

function getDependenciesHash(
  vendorEntryParts: string[],
  vendorSource: string,
): string {
  const projectPackage = require(path.join(process.cwd(), 'package.json'));
  const projectDependencies = {
    ...projectPackage.devDependencies,
    ...projectPackage.dependencies,
  };
  return sha1(
    Object.keys(projectDependencies)
      .filter(name => {
        return (
          vendorEntryParts.find(part => part.includes(name)) ||
          vendorSource.includes(name)
        );
      })
      .map(name => `${name}@${projectDependencies[name]}`)
      .join('|'),
  );
}

function isValid({ logger, config }: CLIContext): boolean {
  const { buildDllPath }: { buildDllPath: string } = config.GSConfig;

  // Check if manifest exists
  const vendorDllBundleManifestPath: string = path.join(
    process.cwd(),
    buildDllPath,
    manifestFilename,
  );
  let manifestContent: string;
  try {
    manifestContent = require(vendorDllBundleManifestPath);
  } catch (e) {
    logger.info('Vendor DLL manifest does not exist, recompiling');
    return false;
  }

  // Check if DLL bundle itself exists
  const vendorDllBundlePath: string = path.join(
    process.cwd(),
    config.GSConfig.buildDllPath,
    `${manifestContent.name.replace('_', '-')}.dll.js`,
  );
  if (!fs.existsSync(vendorDllBundlePath)) {
    logger.info('Vendor DLL bundle does not exist, recompiling');
    return false;
  }

  // Check if manifest has validation metadata, if doesn't, it means bundle is not valid, since
  // we cannot perform other checks
  if (!manifestContent.validationMetadata) {
    logger.info('Validation metadata is not defined, recompiling');
    return false;
  }

  // Compare elements from vendor entry array stored in manifest against config
  // which would be used to build DLL bundle
  const vendorEntryParts: string[] =
    manifestContent.validationMetadata.entryParts;
  // $FlowIgnore `entry.vendor` is an array
  const currentEntryParts: string[] = config.webpackConfig.vendor.entry.vendor;
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
  const vendorSourceHash: string =
    manifestContent.validationMetadata.sourceHash;
  const vendorSource: string = getVendorSource(config);
  if (vendorSourceHash !== sha1(vendorSource)) {
    logger.info('Vendor source hash mismatch, recompiling');
    return false;
  }

  // Check if dependencies version from project `package.json` has changed
  const dependenciesHash: string =
    manifestContent.validationMetadata.dependenciesHash;
  if (
    getDependenciesHash(vendorEntryParts, vendorSource) !== dependenciesHash
  ) {
    logger.info('Vendor dependencies hash mismatch, recompiling');
    return false;
  }

  logger.success('Vendor DLL bundle is valid, skipping recompilation');
  return true;
}

function injectValidationMetadata({ logger, config }: CLIContext): void {
  const { buildDllPath }: { buildDllPath: string } = config.GSConfig;

  const manifestPath: string = path.join(
    process.cwd(),
    buildDllPath,
    manifestFilename,
  );
  const manifestContent = JSON.parse(fs.readFileSync(manifestPath).toString());

  // $FlowIgnore `entry.vendor` is an array
  const entryParts = config.webpackConfig.vendor.entry.vendor;
  const vendorSource = getVendorSource(config);
  const dependenciesHash = getDependenciesHash(entryParts, vendorSource);

  manifestContent.validationMetadata = {
    entryParts,
    sourceHash: sha1(vendorSource),
    dependenciesHash,
  };

  logger.info('Updating vendor DLL validation metadata');

  fs.writeFileSync(manifestPath, JSON.stringify(manifestContent, null, '  '));
}

function getConfig(
  { logger, config }: CLIContext,
  plugins: ConfigPlugin[],
  noProgress: boolean,
): Object {
  // TODO: check if loaders are necessary, bundle CSS/SASS
  const appRoot: string = process.cwd();
  const buildDllPath: string = path.join(
    process.cwd(),
    config.GSConfig.buildDllPath,
  );
  const vendorSourcePath: string = path.join(
    process.cwd(),
    config.GSConfig.vendorSourcePath,
  );
  if (!fs.existsSync(vendorSourcePath)) {
    logger.fatal(
      `${vendorSourcePath} does not exist, consider running 'gluestick auto-upgrade' ` +
        'or create the file manually',
    );
  }

  const baseConfig = new Config().merge({
    devtool: 'cheap-source-map',
    context: appRoot,
    resolve: {
      extensions: ['.js', '.json'],
    },
    entry: {
      vendor: [vendorSourcePath],
    },
    output: {
      path: buildDllPath,
      filename: '[name]-[hash].dll.js',
      library: '[name]_[hash]', // or libraryTarget
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      }),
      new webpack.DllPlugin({
        // The manifest we will use to reference the libraries
        path: path.join(
          buildDllPath,
          manifestFilename.replace('vendor', '[name]'),
        ),
        name: '[name]_[hash]',
      }),
    ]
      .concat(noProgress ? [] : [progressHandler(logger, 'vendor')])
      .concat(
        process.env.NODE_ENV === 'production'
          ? []
          : [
              new webpack.optimize.UglifyJsPlugin({
                compress: {
                  warnings: false,
                },
              }),
            ],
      ),
    bail: true,
  });

  let webpackConfigHooks = {};
  try {
    webpackConfigHooks = requireModule(
      path.join(process.cwd(), config.GSConfig.webpackConfigPath),
    );
  } catch (e) {
    logger.fatal(e);
  }

  return applyConfigPlugins({
    type: 'vendor',
    phase: 'post',
    plugins,
    config: (webpackConfigHooks.vendor || (v => v))(
      applyConfigPlugins({
        type: 'vendor',
        phase: 'pre',
        config: baseConfig,
        plugins,
      }),
    ),
  }).toObject();
}

module.exports = {
  isValid,
  getConfig,
  injectValidationMetadata,
  manifestFilename,
};
