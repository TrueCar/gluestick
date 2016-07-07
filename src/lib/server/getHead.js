/*eslint-disable react/no-danger*/
import React from "react";
import serialize from "serialize-javascript";
import path from "path";
import process from "process";

// Make sure path ends in forward slash
let assetPath = require(path.resolve(path.join(process.cwd(), "src", "config", "application"))).default.assetPath;
if (assetPath.substr(-1) !== "/") {
  assetPath = assetPath + "/";
}

const isProduction = process.env.NODE_ENV === "production";

// eslint-disable-next-line no-unused-vars
export default (config, entryPoint, assets) => {
  const tags = [];
  let key = 0;

  if (isProduction) {
    tags.push(<link key={key++} rel="stylesheet" type="text/css" href={`${config.assetPath}/${entryPoint}.css`} />);
  }

  tags.push(
    <script key={key++} type="text/javascript" dangerouslySetInnerHTML={{__html: `window.__GS_PUBLIC_PATH__ = ${serialize(assetPath)}; window.__GS_ENVIRONMENT__ = ${serialize(process.env.NODE_ENV)}`}}></script>
  );

  return tags;
};

