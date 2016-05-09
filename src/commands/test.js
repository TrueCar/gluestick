const karma = require("karma");
const Server = karma.Server;
const runner = karma.runner;
const karmaConfig = require("../config/karma-config").default;
const spawn = require("cross-spawn").spawn;
const path = require("path");
const CWD = process.cwd();
const chokidar = require("chokidar");

function runMocha(options, callback) {
  const testPath = `${CWD}/test/**/*.test.js`;
  const helperPath = path.join(__dirname, "..", "lib", "testHelperMocha.js");

  // In order to support the Webpack `assets` alias and `src` root, the node path needs to be set up to be
  // at the base directory. This allows all module resolves to be relative to the project, rather than to
  // Gluestick's CWD.
  const mochaEnv = Object.assign({}, process.env, { NODE_PATH: CWD, NODE_ENV: "test" });
  const mochaPath = path.join(__dirname, "..", "..", "node_modules", ".bin", "mocha");
  const mochaOpts = ["--require", helperPath, "--reporter", options.reporter ? options.reporter : "dot", `${testPath}`];
  if (options.debugTest) {
    mochaOpts.push("--debug");
  }
  if (!options.single && !options.debugTest) {
    mochaOpts.push("--watch");
  }

  const mocha = spawn(
    mochaPath,
    mochaOpts,
    { stdio: "inherit", env: mochaEnv }
  );
  if (callback) {
    mocha.on("exit", callback);
  }
}

function useMocha(options) {
  if (!options.debugTest) {
    runMocha(options);
    return;
  }

  const inspectorPath = path.join(__dirname, "..", "..", "node_modules", ".bin", "node-inspector");

  // Currently defaulting to "dot" reporter and watch. This can be improved to allow a reporter override
  // and single-run.
  spawn("open", ["http://127.0.0.1:8080/debug?port=5858"], { stdio: "inherit" });
  spawn(inspectorPath, [], { stdio: "inherit" });

  let running;
  chokidar.watch([path.join(CWD, "src/**/*"), path.join(CWD, "test/**/*")], {
    ignored: /[\/\\]\./,
    persistent: true
  }).on("all", function() {
    if (running) {
      return;
    }
    running = true;
    runMocha(options, function() {
      running = false;
    });
  });
}

function useKarma(options) {
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
}

module.exports = function(options) {
  // override to run tests in Node without Karma/Webpack
  if (options.mochaOnly) {
    useMocha(options);
    return;
  }

  useKarma(options);
};
