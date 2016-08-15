/*eslint-disable react/no-danger*/
import React from "react";
import serialize from "serialize-javascript";
import process from "process";
import getAssetPath from "../lib/getAssetPath";
import getAssetPathForFile from "../lib/getAssetPathForFile";

const isProduction = process.env.NODE_ENV === "production";

// eslint-disable-next-line no-unused-vars
export default (config, entryPoint, assets) => {
  const tags = [];
  let key = 0;
  const assetPath = getAssetPath(config);

  if (isProduction) {
    tags.push(<link key={key++} rel="stylesheet" type="text/css" href={getAssetPathForFile(`${entryPoint}`, "styles")} />);
  }

  tags.push(
    <script key={key++} type="text/javascript" dangerouslySetInnerHTML={{__html: `window.__GS_PUBLIC_PATH__ = ${serialize(assetPath)}; window.__GS_ENVIRONMENT__ = ${serialize(process.env.NODE_ENV)}`}}></script>
  );

  return tags;
};

