const karma = require("karma");
const Server = karma.Server;
const runner = karma.runner;
const karmaConfig = require("../config/karma-config").default;
const spawn = require("cross-spawn").spawn;
const mocha = require("mocha");
const path = require("path");
const CWD = process.cwd();

module.exports = function (options) {
  // override to run tests in Node without Karma/Webpack
  if (options.mochaOnly) {
    const helperPath = path.join(__dirname, "..", "lib", "testHelperMocha.js");
    const testPath = `${CWD}/test/**/*.js`;
    const mochaEnv = Object.assign({}, process.env, { NODE_PATH: 'src', NODE_ENV: 'test'});
    spawn(
      path.join(__dirname, "..", "..", "node_modules", ".bin", "mocha"),
      ["--require", helperPath, "--reporter", "dot", `${testPath}`, "--watch"],
      { stdio: "inherit", env: mochaEnv }
    );
    return;
  }

  // override browser setting to use firefox instead of Chrome if specified
  if (options.firefox) {
    karmaConfig.browsers = ["Firefox"];
  }

  if (options.single) {
    karmaConfig.singleRun = options.single;
  }

  const server = new Server(karmaConfig);

  server.start();
  server.on("browsers_ready", function () {
    runner.run(karmaConfig, () => {});
  });
};
