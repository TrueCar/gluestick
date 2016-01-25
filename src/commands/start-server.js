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

    let apps;
    pm2.start({
      script: path.join(__dirname, "../lib/", "server-side-rendering.js"),
      exec_mode: "cluster",
      instances: MAX_INSTANCES, // 0 = auto detect based on CPUs
      max_memory_restart: process.env.MAX_MEMORY_RESTART || "200M",
      environment_name: process.env.NODE_ENV,
      no_autorestart: false,
      watch: process.env.NODE_ENV !== "production"
    }, (error, a) => {
      // Each app instance is stored in an array that can be accessed later
      // when we kill the process so we can kill all the child processes
      apps = a;

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
      // Kill parent process
      pm2.stop(0);

      // Kill child processes
      apps.forEach((app) => {
        pm2.stop(app.id);
      });

      pm2.disconnect();
      process.exit();
    });

  });
}

