/* eslint-disable react/no-danger*/
const React = require('react');

const isProduction = process.env.NODE_ENV === 'production';

const getAssetPathForFile = (filename, section, webpackAssets) => {
  const assets = webpackAssets[section] || {};
  const webpackPath = assets[filename];
  return webpackPath;
};

// eslint-disable-next-line no-unused-vars
module.exports = (config, entryPoint, assets) => {
  const styleTags = [];
  const scriptTags = [];
  let key = 0;

  if (isProduction) {
    const stylesHref = getAssetPathForFile(entryPoint, 'styles', assets);
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

  const vendorScriptsHref = getAssetPathForFile('vendor', 'javascript', assets);
  scriptTags.push(
    <script key={key++} type="text/javascript" href={vendorScriptsHref} />,
  );
  const scriptsHref = getAssetPathForFile(entryPoint, 'javascript', assets);
  scriptTags.push(
    <script key={key++} type="text/javascript" href={scriptsHref} />,
  );


  return { styleTags, scriptTags };
};
