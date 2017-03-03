/* @flow */

import type { Context } from '../../types';

type ExternalAsset = {
  type: string;
  href?: string;
  content?: string;
}

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

const createExternalStyleTag = (asset: ExternalAsset, key: number) => {
  if (asset.href) {
    return <link key={key} rel="stylesheet" type={asset.type} href={asset.href} />;
  } else if (asset.content) {
    return <style>{`${asset.content}`}</style>;
  }
  return {};
};

const createExternalScriptTag = (asset: ExternalAsset, key: number) => {
  if (asset.href) {
    return <script key={key} type={asset.type} src={asset.href} />;
  } else if (asset.content) {
    return (<script
      key={key}
      type={asset.type}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: asset.content }}
    />);
  }
  return {};
};

module.exports = (
  { config, logger }: Context, entryPoint: string, assets: Object, externalAssets?: ExternalAsset[],
): { styleTags: Object[], scriptTags: Object[] } => {
  const styleTags: Object[] = [];
  const scriptTags: Object[] = [];
  let key: number = 0;
  const entryPointName: string = filterEntryName(entryPoint);

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

  // Add external assets
  if (externalAssets) {
    externalAssets.forEach((asset) => {
      if (asset.type === 'text/css') {
        styleTags.push(createExternalStyleTag(asset, key++));
      } else if (asset.type === 'text/javascript') {
        scriptTags.push(createExternalScriptTag(asset, key++));
      }
    });
  }

  return { styleTags, scriptTags };
};
