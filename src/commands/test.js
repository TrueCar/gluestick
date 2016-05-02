const karma = require("karma");
const Server = karma.Server;
const runner = karma.runner;
const karmaConfig = require("../config/karma-config").default;

const config = karmaConfig;

module.exports = function (options) {
  // override browser setting to use firefox instead of Chrome if specified
  if (options.firefox) {
    config.browsers = ["Firefox"];
  }

  if (options.single) {
    config.singleRun = options.single;
  }

  const server = new Server(config);

  server.start();
  server.on("browsers_ready", function () {
    runner.run(config, () => {});
  });
};
