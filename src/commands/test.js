var karma = require("karma");
var Server = karma.Server;
var runner = karma.runner;
var karmaConfig = require("../lib/karmaConfig").default;
const logger = require("../lib/logger");
const logsColorScheme = require("../lib/logsColorScheme");
const { highlight } = logsColorScheme;
const utils = require("../lib/utils");
const { isGluestickProject } = utils;

const config = karmaConfig;

module.exports = function (options) {
  if (!isGluestickProject()) {
    logger.error(`${highlight("test")} commands must be run from the root of a gluestick project.`);
    return;
  }

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
