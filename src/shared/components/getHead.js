import React, { Component } from "react";
import serialize from "serialize-javascript";
import path from "path";
import process from "process";

var rawConfig = require(path.join(process.cwd(), "src", "config", "application"));
var {assetPath} = rawConfig[process.env.NODE_ENV] || rawConfig["development"];

// Make sure path ends in forward slash
if (assetPath.substr(-1) !== "/") {
  assetPath = assetPath + "/";
}

const isProduction = process.env.NODE_ENV === "production";

export default (config, assets) => {
  let tags = [];
  let key = 0;

  if (isProduction) {
    tags.push(<link key={key++} rel="stylesheet" type="text/css" href={`${config.assetPath}/main.css`} />);
  }
  else {
    // Resolve style flicker on page load in dev mode
    Object.keys(assets.assets).forEach(assetPath => {
      if (!assetPath.endsWith(".css")) return;

      // webpack isomorphic tools converts `node_modules` to `~` in these
      // paths. This means any css files imported directly out of a node_module
      // will not be found. Unless we swap `~` back to `node_modules`.
      assetPath = assetPath.replace("~", "node_modules");

      tags.push(<style key={key++} dangerouslySetInnerHTML={{__html: require(path.join(process.cwd(), assetPath))}} />);
    });
  }

  tags.push(
    <script key={key++} type="text/javascript" dangerouslySetInnerHTML={{__html: `window.__GS_PUBLIC_PATH__ = ${serialize(assetPath)}; window.__GS_ENVIRONMENT__ = ${serialize(process.env.NODE_ENV)}`}}></script>
  );

  return tags;
};

