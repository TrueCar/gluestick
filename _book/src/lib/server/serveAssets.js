import express from "express";
import deepMerge from "deepmerge";

import _loadServerConfig from "./loadServerConfig";

export const DEFAULT_ASSETS_CONFIG = {
  options: {
    maxAge: 315360000000
  },
  path: "/assets",
  buildFolder: "build"
};

export default function serveAssets (app, loadServerConfig=_loadServerConfig, staticMiddleware=express.static) {
  const serverConfig = loadServerConfig();
  let config = DEFAULT_ASSETS_CONFIG;

  if (serverConfig.assets) {
    config = deepMerge(config, serverConfig.assets);
  }

  app.use(config.path, staticMiddleware(config.buildFolder, config.options));
}

