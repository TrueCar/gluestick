/* @flow */

import type { Context } from '../../types';

const React = require('react');
const getAssetsLoader = require('./getAssetsLoader');

const getAssetPathForFile = (filename: string, section: string, webpackAssets: Object): string => {
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

module.exports = (
  { config, logger }: Context, entryPoint: string, assets: Object, loadjsConfig: Object,
): { styleTags: Object[], scriptTags: Object[] } => {
  const styleTags: Object[] = [];
  const scriptTags: Object[] = [];
  let key: number = 0;
  const entryPointName: string = filterEntryName(entryPoint);

  const stylesHref: ?string = getAssetPathForFile(entryPointName, 'styles', assets);
  if (stylesHref) {
    styleTags.push(
      <link key={key++} rel="stylesheet" type="text/css" href={stylesHref} />,
    );
  }
  const vendorStylesHref: ?string = getAssetPathForFile('vendor', 'styles', assets);
  if (vendorStylesHref) {
    styleTags.push(
      <link key={key++} rel="stylesheet" type="text/css" href={vendorStylesHref} />,
    );
  }

  const vendorBundleHref: string = getAssetPathForFile('vendor', 'javascript', assets);
  const entryPointBundleHref: string = getAssetPathForFile(entryPointName, 'javascript', assets);
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
