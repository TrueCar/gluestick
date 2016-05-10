const karma = require("karma");
const Server = karma.Server;
const runner = karma.runner;
const karmaConfig = require("../config/karma-config").default;
const spawn = require("cross-spawn").spawn;
const path = require("path");
const CWD = process.cwd();
const chokidar = require("chokidar");
const logger = require("../lib/logger");

const MOCHA_PATH = path.join(__dirname, "..", "..", "node_modules", ".bin", "mocha");
const MOCHA_PATH_COVERAGE = path.join(__dirname, "..", "..", "node_modules", ".bin", "_mocha");
const MOCHA_ENV = { ...process.env, ...{ NODE_PATH: CWD, NODE_ENV: "test" }};
const MOCHA_TEST_PATH = `${CWD}/test/**/*.test.js`;
const MOCHA_HELPER_PATH = path.join(__dirname, "..", "lib", "testHelperMocha.js");
const BABEL_NODE_PATH = path.join(__dirname, "..", "..", "node_modules", ".bin", "babel-node");
const BABEL_ISTANBUL_PATH = path.join(__dirname, "..", "..", "node_modules", "babel-istanbul", "lib", "cli.js");
const INSPECTOR_PATH = path.join(__dirname, "..", "..", "node_modules", ".bin", "node-inspector");

// Debounce file watches
let watchTimeout;

function watchSources(callback) {
  chokidar.watch([path.join(CWD, "src/**/*.js"), path.join(CWD, "test/**/*.js")], {
    ignored: /[\/\\]\./,
    persistent: true
  }).on("all", function() {
    clearTimeout(watchTimeout);
    watchTimeout = setTimeout(() => {
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
    args.push("--debug");
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
      BABEL_NODE_PATH,
      [
        BABEL_ISTANBUL_PATH,
        "cover",
        "--report",
        "html",
        "--dir",
        "coverage/html",
        MOCHA_PATH_COVERAGE,
        ...createMochaArgs(options, true)
      ],
      {
        stdio: "ignore",
        env: MOCHA_ENV
      }
    ]
  };

  if (options.debugTest) {
    debug();
  } else if (options.single) {
    singleRun();
  } else {
    watch();
  }

  function debug() {
    // Start up the inspector and open it in a browser window.
    spawn(INSPECTOR_PATH, [], { stdio: "inherit" });
    spawn("open", ["http://127.0.0.1:8080/debug?port=5858"], { stdio: "inherit" });

    // Node segfaults when using debug with Mocha's built-in watch. Booooo!
    // Instead, we'll use Chokidar to watch - it's slower since it rebuilds each time, but it works, and isn't too
    // bad since debugging tests is expected to be a slower process than "save/see results".
    let running;
    watchSources(function() {
      if (running) {
        return;
      }
      running = true;
      const mocha = spawn(...spawnOpts.mocha);

      mocha.on("exit", function() {
        running = false;
      });
    });
  }

  function singleRun() {
    spawn(...spawnOpts.coverage);
  }

  function watch() {
    // If not debugging, start up mocha in watch mode.
    spawn(...spawnOpts.mocha);

    // Set up a watcher to create coverage reports in the background, only messaging on success/failure.
    // To ensure only the latest version is available, kill/restart the process on each change.
    let mocha;
    watchSources(function() {
      if (mocha) {
        mocha.kill();
      }
      mocha = spawn(...spawnOpts.coverage);
      mocha.on("exit", function(exitCode) {
        if (exitCode === 0) {
          logger.success("Coverage report generated.");
        } else if (exitCode === 1) {
          logger.error("Coverage report generated, but with test errors.");
        }
      });
    });
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
  if (options.mochaOnly) {
    useMocha(options);
  } else {
    useKarma(options);
  }
};
