const spawn = require("cross-spawn").spawn;
const path = require("path");
const configTools = require("../config/webpack-isomorphic-tools-config");

const CWD = process.cwd();
const NODE_MODULES_PATH = path.join(__dirname, "..", "..", "node_modules");
const JEST_PATH = path.join(NODE_MODULES_PATH, ".bin", "jest");

function getJestDefaultConfig() {
  const alias = configTools.alias;
  const moduleNameMapper = {};

  // We map webpack aliases from webpack-isomorphic-tools-config file so Jest can detect them in tests too
  Object.keys(alias).forEach((key) => {
    moduleNameMapper[`^${key}(.*)$`] = `${alias[key]}$1`;
  });

  const config = {
    "moduleNameMapper": moduleNameMapper,
    "testPathDirs": ["test"]
  };

  const argv = [];
  argv.push("--config", JSON.stringify(config));
  argv.push("-i");
  return argv;
}

function createArgs(options) {
  const { debug, coverage, watch, pattern } = options;
  if (debug) {
    // @TODO handle --debug-test option
  }
  if (coverage) {
    argv.push("--coverage");
  }
  if (watch) {
    argv.push("--watch");
  }
  if (pattern) {
    argv.push(pattern);
  }
}

const argv = getJestDefaultConfig();

module.exports = function(options) {
  createArgs(options);
  spawn.sync(JEST_PATH, argv, {
    stdio: "inherit",
    env: { ...process.env, ...{ NODE_PATH: CWD, NODE_ENV: "test" }}
  });
};
