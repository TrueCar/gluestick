import path from "path";
import process from "process";
import { spawn } from "child_process";
import pm2 from "pm2";
import sha1 from "sha1";
import fs from "fs";

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
module.exports = function startServer (debug=false) {
  const scriptPath = path.join(__dirname, "../lib/", "server-side-rendering.js");

  // If debug mode is enabled, we do not use PM2, instead we spawn `node-debug` for the server side rendering
  if (debug) {
    const debugSpawn = spawn(path.join(CWD, "node_modules", ".bin", "node-debug"), [scriptPath], {stdio: "inherit", env: Object.assign({}, process.env, {NODE_ENV: "development-server"})});
    debugSpawn.on("error", (e) => {
      console.log("Error: ", e);
    });
    return;
  }

  // Generate a unique name based on the cwd, this way pm2 wont be an issue running
  // multiple instances of GlueStick on the same machine
  const name = `gluestick-server-${sha1(CWD).substr(0, 7)}`;

  console.log("Server rendering server started with PM2");
  pm2.connect((error) => {
    if (error) {
      console.error(error);
      pm2.disconnect();
      process.exit(2);
    }

    pm2.start({
      script: scriptPath,
      name: name,
      cwd: CWD,
      exec_mode: "cluster",
      instances: MAX_INSTANCES, // 0 = auto detect based on CPUs
      max_memory_restart: process.env.MAX_MEMORY_RESTART || "200M",
      environment_name: process.env.NODE_ENV,
      no_autorestart: false,
      merge_logs: true,
      watch: process.env.NODE_ENV !== "production"
    }, (error, a) => {
      if (error) {
        console.error(error);
        pm2.disconnect();
      }

      // start showing the logs
      spawn(path.join(__dirname, "..", "..", "node_modules", ".bin", "pm2"), ["logs", name, "--raw", "--lines", 0], {stdio: "inherit"});
    });

    /**
     * When the app is quit, we go through all of the processes that were
     * started up because of PM2 and we terminate them.
     */
    process.on("SIGINT", () => {
      const app_cwd = CWD;

      console.log(`Stopping pm2 instance: ${name}…`);
      pm2.delete(name, () => {
        pm2.disconnect(() => {
          process.exit();
        });
      });
    });
  });
}

