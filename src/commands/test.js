const spawn = require("cross-spawn").spawn;
const path = require("path");
const configTools = require("../config/webpack-isomorphic-tools-config");

const NODE_MODULES_PATH = path.join(__dirname, "..", "..", "node_modules");
const JEST_PATH = path.join(NODE_MODULES_PATH, ".bin", "jest");
const JEST_DEBUG_CONFIG_PATH = `${path.join(__dirname, "..", "..", "test")}/jestEnvironmentNodeDebug.js`;
const TEST_MOCKS_PATH = `${path.join(__dirname, "..", "..", "test", "__mocks__")}`;

function getJestDefaultConfig() {
  const alias = configTools.alias;
  const images = configTools.assets.images.extensions;
  const styles = configTools.assets.styles.extensions;

  const moduleNameMapper = {};

  // Handling Static Assets = mock them out
  moduleNameMapper[`^[./a-zA-Z0-9$_-]+\\.(${images.join("|")})$`] =`${TEST_MOCKS_PATH}/fileMock.js`;
  moduleNameMapper[`^[./a-zA-Z0-9$_-]+\\.(${styles.join("|")})$`] =`${TEST_MOCKS_PATH}/styleMock.js`;

  // !Important: Aliases should be added at the end, see https://github.com/facebook/jest/issues/2818
  // We map webpack aliases from webpack-isomorphic-tools-config file so Jest can detect them in tests too
  Object.keys(alias).forEach((key) => {
    moduleNameMapper[`^${key}(.*)$`] = `${alias[key]}$1`;
  });

  const config = {
    "moduleNameMapper": moduleNameMapper,
    "testPathDirs": ["test"],
  };

  const argv = [];
  argv.push("--config", JSON.stringify(config));
  argv.push("-i");
  return argv;
}

function getDebugDefaultConfig() {
  const nodeArgs = [];
  nodeArgs.push("--inspect");
  nodeArgs.push("--debug-brk");
  nodeArgs.push(JEST_PATH);
  nodeArgs.push("--env");
  nodeArgs.push(JEST_DEBUG_CONFIG_PATH);
  nodeArgs.push(...getJestDefaultConfig());
  nodeArgs.push("--watch");
  return nodeArgs;
}

function createArgs(defaultArgs, options) {
  const argv = [].concat(defaultArgs);
  const { coverage, watch, pattern } = options;

  if (coverage) {
    argv.push("--coverage");
  }
  if (watch) {
    argv.push("--watch");
  }
  if (pattern) {
    argv.push(pattern);
  }

  return argv;
}

module.exports = function(options) {
  const spawnOptions = {
    stdio: "inherit",
  };

  if (options.debugTest) {
    const argvDebug = getDebugDefaultConfig();
    spawn.sync("node", argvDebug, spawnOptions);
  } else {
    const argv = createArgs(getJestDefaultConfig(), options);
    spawn.sync(JEST_PATH, argv, spawnOptions);
  }
};
