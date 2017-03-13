const path = require('path');
const webpack = require('webpack');
const detectEnvVars = require('./detectEnvironmentVariables');

module.exports = (options, { logger }) => {
  let envToExpose = [];
  if (Array.isArray(options.parse)) {
    envToExpose = options.parse
      .map((file) => detectEnvVars(path.join(process.cwd(), file), logger))
      .reduce((prev, curr) => prev.concat(curr), []);
  } else {
    envToExpose = detectEnvVars(
      path.join(process.cwd(), options.parse || 'src/config/application.js'),
      logger,
    );
  }

  const overwriteConfig = (config) => {
    if (!envToExpose.length) {
      return config;
    }

    config.plugins.push(
      new webpack.DefinePlugin(
        envToExpose.reduce((prev, curr) => {
          return Object.assign(
            prev,
            { [`process.env.${curr}`]: JSON.stringify(process.env[curr]) },
          );
        }, {}),
      ),
    );
    return config;
  };

  return {
    postOverwrites: {
      clientWebpackConfig: overwriteConfig,
      serverWebpackConfig: overwriteConfig,
    },
  };
};

module.exports.meta = { type: 'config' };
