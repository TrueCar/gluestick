var karma = require("karma");
var Server = karma.Server;
var runner = karma.runner;
var karmaConfig = require("../lib/karmaConfig");

const config = karmaConfig;

module.exports = function (options) {
  // override browser setting to use firefox instead of Chrome if specified
  if (options.firefox) {
    config.browsers = ["Firefox"];
  }

  const server = new Server(config);

  server.start();
  server.on("browsers_ready", function () {
    runner.run(config, () => {});
  });
};
