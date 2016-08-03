import path from "path";
import process from "process";
import { spawn } from "cross-spawn";
import startPM2 from "./start-server-pm2";

import { getLogger } from "../lib/server/logger";
const logger = getLogger();

// The number of server side rendering instances to run. This can be set with
// an environment variable or it will default to 0 for production and 1 for
// non-production. 0 means it will automatically detect the instance number
// based on the CPUs
const MAX_INSTANCES = process.env.MAX_INSTANCES || (process.env.NODE_ENV === "production" ? 0 : 1);
const CWD = process.cwd();

/**
 * Spin up the server side rendering. If debug is false, this will use PM2 for
 * managing multiple instances.
 *
 * @param {Boolean} debug whether or not to use node-inspector for debugging
 */
module.exports = function startServer (debug=false, pm2=true) {
  const serverEntrypointPath = path.join(__dirname, "../entrypoints/", "server.js");

  // If debug mode is enabled, we do not use PM2, instead we spawn `node-debug` for the server side rendering
  if (debug) {
    const debugSpawn = spawn(path.join(CWD, "node_modules", ".bin", "node-debug"), [serverEntrypointPath], {stdio: "inherit", env: Object.assign({}, process.env, {NODE_ENV: "development-server"})});
    debugSpawn.on("error", (e) => {
      logger.error(e);
    });
    return;
  }

  if (pm2) {
    startPM2(CWD, serverEntrypointPath, MAX_INSTANCES);
  }

};
