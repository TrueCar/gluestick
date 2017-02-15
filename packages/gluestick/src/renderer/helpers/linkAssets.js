/* eslint-disable react/no-danger*/
const React = require('react');
const getAssetsLoader = require('./getAssetsLoader');

const getAssetPathForFile = (filename, section, webpackAssets) => {
  const assets = webpackAssets[section] || {};
  const webpackPath = assets[filename];
  return webpackPath;
};

module.exports = ({ config, logger }, entryPoint, assets) => {
  const styleTags = [];
  const scriptTags = [];
  let key = 0;
  const entryPointName = entryPoint === '/' ? 'main' : entryPoint;

  if (process.env.NODE_ENV === 'production') {
    const stylesHref = getAssetPathForFile(entryPointName, 'styles', assets);
    styleTags.push(
      <link key={key++} rel="stylesheet" type="text/css" href={stylesHref} />,
    );
    // Need to explicitly check if there is CSS vendor bundle and include it
    const vendorStylesHref = getAssetPathForFile('vendor', 'styles', assets);
    if (vendorStylesHref) {
      styleTags.push(
        <link key={key++} rel="stylesheet" type="text/css" href={vendorStylesHref} />,
      );
    }
  }

  const vendorBundleHref = getAssetPathForFile('vendor', 'javascript', assets);
  const entryPointBundleHref = getAssetPathForFile(entryPointName, 'javascript', assets);
  const assetsLoader = getAssetsLoader({}, entryPointBundleHref, vendorBundleHref);
  scriptTags.push(
    <script
      key="script-loader"
      type="text/javascript"
      dangerouslySetInnerHTML={{ __html: assetsLoader }}
    />,
  );

  return { styleTags, scriptTags };
};
