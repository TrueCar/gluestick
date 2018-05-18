/* @flow */

import type { Context } from '../../types';

const React = require('react');
const path = require('path');
const fs = require('fs');
// $FlowIgnore promisify is not available in this version of Flow
const { promisify } = require('util');
const getAssetsLoader = require('./getAssetsLoader');

const readFileAsync = promisify(fs.readFile); // (A)

// available in webpack-compiled code
declare var __webpack_public_path__: string; // eslint-disable-line camelcase

const getAssetPathForFile = (
  filename: string,
  section: string,
  webpackAssets: Object,
): string => {
  const assets: Object = webpackAssets[section] || {};
  const webpackPath: string = assets[filename];
  return webpackPath;
};

const filterEntryName = (name: string): string => {
  if (name === '/') {
    return 'main';
  }
  const match = /\/(.*)/.exec(name);
  return match ? match[1] : name;
};

const getBundleName = ({ config }): string => {
  const manifestFilename: string =
    process.env.GS_VENDOR_MANIFEST_FILENAME || '';
  const { buildDllPath } = config.GSConfig;
  const manifestPath: string = path.join(
    process.cwd(),
    buildDllPath,
    manifestFilename,
  );
  // Can't require it, because it will throw an error on server
  const { name } = JSON.parse(fs.readFileSync(manifestPath).toString());
  const publicPath: string = __webpack_public_path__ || '/assets/'; // eslint-disable-line camelcase
  return `${publicPath}dlls/${name.replace('_', '-')}.dll.js`;
};

// Cache contents of CSS files to avoid hitting the filesystem
const cache = {};

const memoizedRead = async (publicPath: string, filePath: string) => {
  const localPath = path.join(
    process.cwd(),
    'build',
    'assets',
    filePath.replace(publicPath, ''),
  );

  if (cache[localPath]) {
    return cache[localPath];
  }

  const contents = await readFileAsync(localPath);
  cache[localPath] = contents.toString();
  return cache[localPath];
};

module.exports = async function linkAssets(
  { config }: Context,
  entryPoint: string,
  assets: Object,
  loadjsConfig: Object,
) {
  const styleTags: Object[] = [];
  const scriptTags: Object[] = [];
  let key: number = 0;
  const entryPointName: string = filterEntryName(entryPoint);

  const stylesHref: ?string = getAssetPathForFile(
    entryPointName,
    'styles',
    assets,
  );
  if (stylesHref) {
    if (config.GSConfig.inlineAllCss) {
      console.log(config.webpackConfig.client.publicPath);
      console.log(config.GSConfig.publicPath);
      // console.log(process.env.ASSET_URL);
      const contents = await memoizedRead(
        config.webpackConfig.client.output.publicPath,
        stylesHref,
      );
      styleTags.push(
        <style dangerouslySetInnerHTML={{ __html: contents.toString() }} />,
      );
    } else {
      styleTags.push(
        <link key={key++} rel="stylesheet" type="text/css" href={stylesHref} />,
      );
    }
  }
  const vendorStylesHref: ?string = getAssetPathForFile(
    'vendor',
    'styles',
    assets,
  );
  if (vendorStylesHref) {
    if (config.webpackConfig.client.output.publicPath) {
      const contents = await memoizedRead(
        config.GSConfig.publicPath,
        vendorStylesHref,
      );

      styleTags.push(
        <style dangerouslySetInnerHTML={{ __html: contents.toString() }} />,
      );
    } else {
      styleTags.push(
        <link
          key={key++}
          rel="stylesheet"
          type="text/css"
          href={vendorStylesHref}
        />,
      );
    }
  }

  const vendorBundleHref: string =
    getAssetPathForFile('vendor', 'javascript', assets) ||
    getBundleName({ config });
  const entryPointBundleHref: string = getAssetPathForFile(
    entryPointName,
    'javascript',
    assets,
  );
  const assetsLoader: string = getAssetsLoader(
    { before: () => {}, ...loadjsConfig },
    entryPointBundleHref,
    vendorBundleHref,
  );
  scriptTags.push(
    <script
      key="script-loader"
      type="text/javascript"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: assetsLoader }}
    />,
  );

  return { styleTags, scriptTags };
};
