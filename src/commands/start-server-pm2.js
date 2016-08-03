import path from "path";
import pm2 from "pm2";
import sha1 from "sha1";
import { spawn } from "cross-spawn";

import { getLogger } from "../lib/server/logger";
const logger = getLogger();

export default function startPM2 (currentDir, serverEntrypointPath, maxInstances) {
  // Generate a unique name based on the cwd, this way pm2 wont be an issue running
  // multiple instances of GlueStick on the same machine
  const name = `gluestick-server-${sha1(currentDir).substr(0, 7)}`;

  logger.info("Server rendering server started with PM2");
  logger.debug("Connecting to PM2 with pm2.connect");
  pm2.connect((error) => {
    if (error) {
      logger.error(error);
      pm2.disconnect();
      process.exit(2);
    }

    // Stop any previous processes with the same name before starting new
    // instances. If no instances with that name are found then we just
    // fall back to starting normally
    checkIfPM2ProcessExists(name, (exists) => {
      if (exists) {
        logger.debug(`PM2 process ${name} already running, stopping the process`);
        pm2.stop(name, () => {
          startPM2(serverEntrypointPath, name);
        });
      }
      else {
        startServer(currentDir, serverEntrypointPath, name, maxInstances);
      }
    });
  });
}

function startServer (currentDir, scriptPath, name, maxInstances) {

  const pm2Config = {
    script: scriptPath,
    name: name,
    cwd: currentDir,
    exec_mode: "cluster",
    instances: maxInstances, // 0 = auto detect based on CPUs
    max_memory_restart: process.env.MAX_MEMORY_RESTART || "200M",
    environment_name: process.env.NODE_ENV,
    no_autorestart: false,
    merge_logs: true,
    watch: process.env.NODE_ENV !== "production" ? ["assets", "src", "Index.js"] : false
  };

  logger.debug(pm2Config, "Starting PM2 server with config");

  pm2.start(pm2Config, (error) => {
    if (error) {
      logger.error(error);
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
    logger.info(`Stopping pm2 instance: ${name}…`);
    checkIfPM2ProcessExists(name, (exists) => {
      if (exists) {
        logger.debug(`Deleting process ${name}`);
        pm2.delete(name, () => {
          pm2.disconnect(() => {
            process.exit();
          });
        });
      }
      else {
        logger.warn(`No process with name ${name} exists`);
        pm2.disconnect(() => {
          process.exit();
        });
      }
    });
  });
}

function checkIfPM2ProcessExists (name, callback) {
  logger.debug(`Checking for process with name ${name}`);
  pm2.list((error, result) => {
    callback(result.map((i) => {
      const exists = i.name === name;
      if (exists) {
        logger.debug(`Process ${i.name} was found running`);
      }
      return exists;
    }).length > 0);
  });
}

