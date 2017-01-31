const spawn = require("cross-spawn");
const updateWebpackAssetPath = require("../lib/updateWebpackAssetPath");
const autoUpgrade = require("../autoUpgrade");

/*
 * Start server and (optionally) tests in different processes.
 *
 * @param {object} options        Command-line options object directly from Commander
 */
module.exports = exports = async function start(config, logger, options) {
  await autoUpgrade();
  const isProduction = process.env.NODE_ENV === "production";

  // Update the ASSET_PATH in webpack-assets.json in production environments
  if (isProduction) {
    updateWebpackAssetPath();
  }

  // Start tests only they asked us to or we are in production mode
  if (!isProduction && options.runTests) {
    spawn("gluestick", ["test", ...options.parent.rawArgs.slice(4)], {
      stdio: "inherit",
      env: Object.assign({}, process.env, {
        NODE_ENV: isProduction ? "production" : "development-test"
      })
    });
  }

  // in production spawning the client really just creates a build. Our docker
  // images pre-build and therefor they start with the skip build option as
  // true.  We only want to start the client in development mode or if
  // skipBuild is not specified
  if (!(isProduction && options.skipBuild)) {
    spawn("gluestick", ["start-client"], {
      stdio: "inherit",
      env: Object.assign({}, process.env)
    });
  }

  spawn("gluestick", ["start-server", ...options.parent.rawArgs.slice(3)], {
    stdio: "inherit",
    env: Object.assign({}, process.env, {
      NODE_ENV: isProduction ? "production" : "development-server"
    })
  });
};
