const path = require('path');
const webpack = require('webpack');
const detectEnvVars = require('./detectEnvironmentVariables');

module.exports = (options, { logger }) => {
  let envToExpose = [];
  if (Array.isArray(options.parse)) {
    envToExpose = options.parse
      .map(file => detectEnvVars(path.join(process.cwd(), file), logger))
      .reduce((prev, curr) => prev.concat(curr), []);
  } else {
    envToExpose = detectEnvVars(
      path.join(process.cwd(), options.parse || 'src/config/application.js'),
      logger,
    );
  }

  const pushVarsToDefinePlugin = config => {
    config.plugins.push(
      new webpack.DefinePlugin(
        envToExpose.reduce((prev, curr) => {
          return Object.assign(prev, {
            [`process.env.${curr}`]: JSON.stringify(process.env[curr]),
          });
        }, {}),
      ),
    );
  };

  return {
    postOverwrites: {
      clientWebpackConfig: config => {
        if (!envToExpose.length) {
          return config;
        }

        if (options.exposeRuntime) {
          let ruleIndex = -1;
          const jsRule = config.module.rules.find(({ test }, i) => {
            if (test.source.includes('js')) {
              ruleIndex = i;
              return true;
            }
            return false;
          });
          let babelLoaderIndex = -1;
          jsRule.use.find(({ loader }, i) => {
            if (loader === 'babel-loader') {
              babelLoaderIndex = i;
              return true;
            }
            return false;
          });
          config.module.rules[ruleIndex].use[
            babelLoaderIndex
          ].options.plugins.push(require.resolve('babel-plugin-gluestick'));
        } else {
          pushVarsToDefinePlugin(config);
        }

        return config;
      },
      serverWebpackConfig: config => {
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
          pushVarsToDefinePlugin(config);
        }

        return config;
      },
    },
  };
};

module.exports.meta = { type: 'config' };
