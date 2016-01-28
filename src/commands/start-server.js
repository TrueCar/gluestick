import path from "path";
import pm2 from "pm2";

// The number of server side rendering instances to run. This can be set with
// an environment variable or it will default to 0 for production and 1 for
// non-production. 0 means it will automatically detect the instance number
// based on the CPUs
const MAX_INSTANCES = process.env.MAX_INSTANCES || process.env.NODE_ENV === "production" ? 0 : 1;

module.exports = function startServer () {
  console.log("Server rendering server started with PM2");
  pm2.connect((error) => {
    if (error) {
      console.error(error);
      process.exit(2);
    }

    pm2.start({
      script: path.join(__dirname, "../lib/", "server-side-rendering.js"),
      exec_mode: "cluster",
      instances: MAX_INSTANCES, // 0 = auto detect based on CPUs
      max_memory_restart: process.env.MAX_MEMORY_RESTART || "200M",
      environment_name: process.env.NODE_ENV,
      no_autorestart: false,
      watch: process.env.NODE_ENV !== "production"
    }, (error, a) => {
      if (error) {
        console.error(error);
        pm2.disconnect();
      }
    });

    /**
     * When the app is quit, we go through all of the processes that were
     * started up because of PM2 and we terminate them.
     */
    process.on("SIGINT", () => {
      const app_cwd = process.cwd();
      pm2.list((err, apps) => {

        // Stop each process belonging to the current app
        apps.forEach((app) => {
          if (app.pm2_env.pm_cwd == app_cwd) {
            // Suppress pm2 list output by passing a noop callback to stop
            pm2.stop(app.pm2_env.pm_id, () => {});
          }
        });

        // Make sure enough time is given for all processes to stop
        setTimeout(function() {
          pm2.disconnect();
          process.exit();
        }, 1500);

      });
    });
  });
}

