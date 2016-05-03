const karma = require("karma");
const Server = karma.Server;
const runner = karma.runner;
const karmaConfig = require("../config/karma-config").default;
const spawn = require("cross-spawn").spawn;
const path = require("path");
const CWD = process.cwd();

module.exports = function (options) {
  // override to run tests in Node without Karma/Webpack
  if (options.mochaOnly) {
    const helperPath = path.join(__dirname, "..", "lib", "testHelperMocha.js");
    const testPath = `${CWD}/test/**/*.test.js`;

    // In order to support the Webpack `assets` alias and `src` root, the node path needs to be set up to be
    // at the base directory. This allows all module resolves to be relative to the project, rather than to
    // Gluestick's CWD.
    const mochaEnv = Object.assign({}, process.env, { NODE_PATH: CWD, NODE_ENV: "test" });

    // Currently defaulting to "dot" reporter and watch. This can be improved to allow a reporter override
    // and single-run.
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
