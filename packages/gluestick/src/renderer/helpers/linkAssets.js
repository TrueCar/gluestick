/* @flow */

import type { ChunksInfo, Context } from '../../types';

const React = require('react');
const path = require('path');
const fs = require('fs');
// $FlowIgnore promisify is not available in this version of Flow
const { promisify } = require('util');
const getAssetsLoader = require('./getAssetsLoader');

const readFileAsync = promisify(fs.readFile); // (A)

// available in webpack-compiled code
declare var __webpack_public_path__: string; // eslint-disable-line camelcase

const getAssetsForFile = (
  filename: string,
  section: string,
  webpackAssets: ChunksInfo,
) => {
  return webpackAssets[section] && webpackAssets[section][filename];
};

const filterEntryName = (name: string): string => {
  if (name === '/') {
    return 'main';
  }
  const match = /\/(.*)/.exec(name);
  return match ? match[1] : name;
};

const getBundleName = ({ config }): string => {
  const manifestFilename = process.env.GS_VENDOR_MANIFEST_FILENAME || '';
  const { buildDllPath } = config.GSConfig;
  const manifestPath = path.join(process.cwd(), buildDllPath, manifestFilename);
  // Can't require it, because it will throw an error on server
  const { name } = JSON.parse(fs.readFileSync(manifestPath).toString());
  const publicPath: string = __webpack_public_path__ || '/assets/'; // eslint-disable-line camelcase
  return `${publicPath}dlls/${name.replace('_', '-')}.dll.js`;
};

// Cache contents of CSS files to avoid hitting the filesystem
const cache = {};

const memoizedRead = async (publicPath: string, name: string) => {
  if (cache[name]) {
    return cache[name];
  }

  const localPath = path.join(process.cwd(), 'build', 'assets', name);
  const contents = await readFileAsync(localPath);

  cache[name] = contents.toString();
  return cache[name];
};

module.exports = async function linkAssets(
  { config }: Context,
  entryPoint: string,
  assets: Object,
  loadjsConfig: Object,
) {
  const styleTags = [];
  const scriptTags = [];
  let key = 0;
  const entryPointName = filterEntryName(entryPoint);

  const styles = getAssetsForFile(entryPointName, 'styles', assets);
  if (styles) {
    if (config.GSConfig.inlineAllCss) {
      const contents = await memoizedRead(
        // $FlowIgnore
        config.webpackConfig.client.output.publicPath,
        styles.name,
      );
      styleTags.push(
        <style dangerouslySetInnerHTML={{ __html: contents.toString() }} />,
      );
    } else {
      styleTags.push(
        <link key={key++} rel="stylesheet" type="text/css" href={styles.url} />,
      );
    }
  }
  const vendorStyles = getAssetsForFile('vendor', 'styles', assets);
  if (vendorStyles) {
    if (config.webpackConfig.client.output.publicPath) {
      const contents = await memoizedRead(
        config.GSConfig.publicPath,
        vendorStyles.name,
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
          href={vendorStyles.url}
        />,
      );
    }
  }

  const vendorBundleHref =
    getAssetsForFile('vendor', 'javascript', assets).url ||
    getBundleName({ config });
  const entryPointBundleHref = getAssetsForFile(
    entryPointName,
    'javascript',
    assets,
  );
  const assetsLoader = getAssetsLoader(
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
