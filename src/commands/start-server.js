import path from "path";
import process from "process";
import pm2 from "pm2";
import sha1 from "sha1";
import tail from "tail";

// The number of server side rendering instances to run. This can be set with
// an environment variable or it will default to 0 for production and 1 for
// non-production. 0 means it will automatically detect the instance number
// based on the CPUs
const MAX_INSTANCES = process.env.MAX_INSTANCES || process.env.NODE_ENV === "production" ? 0 : 1;

module.exports = function startServer () {
  // Generate a unique name based on the cwd, this way pm2 wont be an issue running
  // multiple instances of GlueStick on the same machine
  const name = `gluestick-server-${sha1(process.cwd()).substr(0, 7)}`;

  console.log("Server rendering server started with PM2");
  pm2.connect((error) => {
    if (error) {
      console.error(error);
      process.exit(2);
    }

    pm2.start({
      script: path.join(__dirname, "../lib/", "server-side-rendering.js"),
      name: name,
      cwd: process.cwd(),
      exec_mode: "cluster",
      instances: MAX_INSTANCES, // 0 = auto detect based on CPUs
      max_memory_restart: process.env.MAX_MEMORY_RESTART || "200M",
      environment_name: process.env.NODE_ENV,
      no_autorestart: false,
      merge_logs: true,
      error_file: "output.log",
      out_file: "output.log",
      watch: process.env.NODE_ENV !== "production"
    }, (error, a) => {
      if (error) {
        console.error(error);
        pm2.disconnect();
      }
      const logTail = new tail.Tail("output.log");
      logTail.on("line", function (data) {
        console.log(data);
      });
    });

    /**
     * When the app is quit, we go through all of the processes that were
     * started up because of PM2 and we terminate them.
     */
    process.on("SIGINT", () => {
      const app_cwd = process.cwd();
      pm2.stop(name);
      console.log(`Stopping pm2 instance: ${name}…`);
      // Make sure enough time is given for all processes to stop
      setTimeout(function() {
        pm2.disconnect();
        process.exit();
      }, 1500);
    });
  });
}

