const karma = require("karma");
const Server = karma.Server;
const runner = karma.runner;
const karmaConfig = require("../config/karma-config").default;
const spawn = require("cross-spawn").spawn;
const path = require("path");
const CWD = process.cwd();
const chokidar = require("chokidar");
const logger = require("../lib/cliLogger");

const NODE_MODULES_PATH = path.join(__dirname, "..", "..", "node_modules");
const MOCHA_PATH = path.join(NODE_MODULES_PATH, ".bin", "mocha");
const MOCHA_COVERAGE_PATH = path.join(NODE_MODULES_PATH, ".bin", "_mocha");
const MOCHA_TEST_PATH = `${CWD}/test/**/*.test.js`;
const MOCHA_HELPER_PATH = path.join(__dirname, "..", "lib", "testHelperMocha.js");
const BABEL_ISTANBUL_PATH = path.join(NODE_MODULES_PATH, ".bin", "babel-istanbul");
const MOCHA_ENV = { ...process.env, ...{ NODE_PATH: CWD, NODE_ENV: "test" }};

function watchSources(callback) {
  // Debounce file watches
  let timeout;
  chokidar.watch([path.join(CWD, "src/**/*.js"), path.join(CWD, "test/**/*.js")], {
    ignored: /[\/\\]\./,
    persistent: true
  }).on("all", function() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      callback();
    }, 250);
  });
}

function createMochaArgs(options, coverage) {
  const args = ["--require", MOCHA_HELPER_PATH];
  if (!coverage) {
    args.push("--reporter");
    args.push(options.reporter ? options.reporter : "dot");
  }
  args.push(MOCHA_TEST_PATH);
  if (options.debugTest) {
    args.push("--inspect");
    args.push("--debug-brk");
  }
  if (!options.single && !options.debugTest) {
    args.push("--watch");
  }
  return args;
}

/*
 * Run Mocha tests, handled differently with different options.
 *
 * @param {object} options            Command-line options in Commander format.
 * @param {string} options.reporter   Mocha reporter to use, ex. 'dot' or 'min'
 * @param {bool}   options.debugTest  Run test in debug mode. Assumes watch: false.
 * @param {bool}   options.single     Run once (watch: false).
 * @returns {object}                  Resulting process from spawn().
 *
 */
function useMocha(options) {
  const spawnOpts = {
    mocha: [
      MOCHA_PATH,
      createMochaArgs(options, false),
      {
        stdio: "inherit",
        env: MOCHA_ENV
      }
    ],
    coverage: [
      "node",
      [
        BABEL_ISTANBUL_PATH,
        "cover",
        "--include-all-sources",
        "--root",
        "src",
        "--report",
        "lcov",
        "--dir",
        "coverage/lcov",
        MOCHA_COVERAGE_PATH,
        ...createMochaArgs(options, true)
      ],
      {
        // Suppress error output since it includes the entire test run!
        stdio: "ignore",
        env: MOCHA_ENV
      }
    ],
    single: [
      "node",
      [
        BABEL_ISTANBUL_PATH,
        "cover",
        "--include-all-sources",
        "--root",
        "src",
        "--report",
        "cobertura",
        "--dir",
        "coverage/xml",
        MOCHA_COVERAGE_PATH,
        ...createMochaArgs(options, true)
      ],
      {
        stdio: "inherit",
        env: MOCHA_ENV
      }
    ]
  };

  if (options.single) {
    spawn(...spawnOpts.single).on("exit", function(exitCode) {
      process.exit(exitCode);
    });
  } else {
    watch(options.debugTest);
  }

  function watch(debug = false) {
    // If not debugging, start up mocha in watch mode.
    spawn(...spawnOpts.mocha);

    if (!debug) {
      // Set up a watcher to create coverage reports in the background, only messaging on success/failure.
      // To ensure only the latest version is available, kill/restart the process on each change.
      let child;
      watchSources(function() {
        if (child) {
          child.kill();
        }
        child = spawn(...spawnOpts.coverage);
        child.on("exit", function(exitCode) {
          if (exitCode === 0) {
            logger.success("Coverage report generated.");
          } else if (exitCode === 1) {
            logger.error("Coverage report generated, but with test errors.");
          }
        });
      });
    }
  }
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
  if (options.karma) {
    useKarma(options);
  } else {
    useMocha(options);
  }
};
