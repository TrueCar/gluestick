/* @flow */

import type { Context } from '../../types';

const React = require('react');
const getAssetsLoader = require('./getAssetsLoader');

const getAssetPathForFile = (filename: string, section: string, webpackAssets: Object): string => {
  const assets: Object = webpackAssets[section] || {};
  const webpackPath: string = assets[filename];
  return webpackPath;
};

module.exports = (
  { config, logger }: Context, entryPoint: string, assets: Object,
): { styleTags: Object[], scriptTags: Object[] } => {
  const styleTags: Object[] = [];
  const scriptTags: Object[] = [];
  let key: number = 0;
  const entryPointName: string = entryPoint === '/' ? 'main' : entryPoint;

  if (process.env.NODE_ENV === 'production') {
    const stylesHref: string = getAssetPathForFile(entryPointName, 'styles', assets);
    styleTags.push(
      <link key={key++} rel="stylesheet" type="text/css" href={stylesHref} />,
    );
    // Need to explicitly check if there is CSS vendor bundle and include it
    const vendorStylesHref: string = getAssetPathForFile('vendor', 'styles', assets);
    if (vendorStylesHref) {
      styleTags.push(
        <link key={key++} rel="stylesheet" type="text/css" href={vendorStylesHref} />,
      );
    }
  }

  const vendorBundleHref: string = getAssetPathForFile('vendor', 'javascript', assets);
  const entryPointBundleHref: string = getAssetPathForFile(entryPointName, 'javascript', assets);
  const assetsLoader: string = getAssetsLoader({}, entryPointBundleHref, vendorBundleHref);
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
