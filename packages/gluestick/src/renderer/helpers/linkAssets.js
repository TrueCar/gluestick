/* @flow */

import type { Context } from '../../types';

const React = require('react');
const path = require('path');
const fs = require('fs');
const getAssetsLoader = require('./getAssetsLoader');

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
  // $FlowIgnore Server is compiled by webpack, so then we have access to webpack's public path
  const publicPath: string = __webpack_public_path__ || '/assets/'; // eslint-disable-line
  return `${publicPath}dlls/${name.replace('_', '-')}.dll.js`;
};

module.exports = (
  { config, logger }: Context,
  entryPoint: string,
  assets: Object,
  loadjsConfig: Object,
): { styleTags: Object[], scriptTags: Object[] } => {
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
    styleTags.push(
      <link key={key++} rel="stylesheet" type="text/css" href={stylesHref} />,
    );
  }
  const vendorStylesHref: ?string = getAssetPathForFile(
    'vendor',
    'styles',
    assets,
  );
  if (vendorStylesHref) {
    styleTags.push(
      <link
        key={key++}
        rel="stylesheet"
        type="text/css"
        href={vendorStylesHref}
      />,
    );
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
