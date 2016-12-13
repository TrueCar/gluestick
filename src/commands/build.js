import { rm, ls } from "shelljs";
import fs from "fs-extra";
import path from "path";
import webpack from "webpack";
import getWebpackConfig from "../config/getWebpackClientConfig";

import { getLogger } from "../lib/server/logger";
import getAssetPath from "../lib/getAssetPath";
const LOGGER = getLogger();

module.exports = function() {
  const appRoot = process.cwd();
  const appConfigFilePath = path.join(appRoot, "src", "config", "application.js");
  const isProduction = process.env.NODE_ENV === "production";
  const compiler = webpack(getWebpackConfig(appRoot, appConfigFilePath, isProduction));
  LOGGER.info("Bundling assets…");

  // clean the slate, `shelljs.rm` throws a warning if you try to remove a
  // folder or file that doesn't exist. To get around that warning we combine
  // `ls` and `filter` to only remove the target files if the exist.
  const removeableTargets = ["build", "_build", "webpack-assets.json", "_webpack-assets.json"];
  const removable = ls(appRoot).filter((f) => removeableTargets.includes(f));
  if (removable.length) {
    rm("-R", removable);
  }

  compiler.run((error, stats) => {
    const statsJson = stats.toJson();
    fs.writeFileSync("webpack-bundle-stats.json", JSON.stringify(statsJson));
    fs.writeFileSync("build/asset-path.json", JSON.stringify({assetPath: getAssetPath()}));
    const errors = statsJson.errors;
    if (errors.length) {
      errors.forEach((e) => {
        LOGGER.error(e);
      });
      return;
    }
    LOGGER.info("Assets have been prepared for production.");
    LOGGER.info("Assets can be served from the \"/assets\" route but it is recommended that you serve the generated \"build\" folder from a Content Delivery Network");
  });
};
