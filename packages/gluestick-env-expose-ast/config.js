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

  return {
    postOverwrites: {
      clientWebpackConfig: (config) => {
        console.log(config.plugins);
        return config;
      },
      serverWebpackConfig: (config) => {
        console.log('envToExpose', envToExpose);
        if (!envToExpose.length) {
          return config;
        }

        if (options.exposeRuntime) {
          config.plugins.push(
            new webpack.DefinePlugin({
              'process.env.ENV_VARIABLES': JSON.stringify(envToExpose),
            }),
          );
        } else {
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
        }

        return config;
      },
    },
  };
};

module.exports.meta = { type: 'config' };
