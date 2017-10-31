const path = require('path');

// Handle ESM and CommonJS.
const getProp = (source, name) => {
  return source.default ? source.default[name] : source[name];
};

module.exports = (opts, { requireModule }) => {
  const applicationServer = requireModule(
    path.join(process.cwd(), 'src/config/application.server.js'),
  );
  const webpackAdditions = requireModule(
    path.join(process.cwd(), 'src/config/webpack-additions.js'),
  );

  const vendor = getProp(webpackAdditions, 'vendor');

  const applyWebpackAdditions = (webpackConfig, isClient = false) => {
    const additionalLoaders = getProp(webpackAdditions, 'additionalLoaders');
    const additionalPlugins = getProp(webpackAdditions, 'plugins');

    const config = webpackConfig;
    config.module.rules = config.module.rules.concat(additionalLoaders);
    config.plugins = config.plugins.concat(additionalPlugins);
    if (
      config.plugins.filter(
        plugin => plugin.constructor.name === 'CommonsChunkPlugin',
      ).length
    ) {
      if (isClient && config.entry.vendor && vendor.length) {
        config.entry.vendor.unshift(...vendor);
      } else if (isClient && vendor.length) {
        config.entry.vendor = vendor;
      }
    }
    return config;
  };

  return {
    preOverwrites: {
      sharedWebpackConfig: webpackConfig => {
        const additionalAliases = getProp(
          webpackAdditions,
          'additionalAliases',
        );
        const config = webpackConfig;
        config.resolve.alias = {
          ...config.resolve.alias,
          ...Object.keys(additionalAliases).reduce((prev, curr) => {
            return Object.assign(prev, {
              [curr]: path.join(process.cwd(), ...additionalAliases[curr]),
            });
          }, {}),
        };
        return config;
      },
    },
    postOverwrites: {
      gluestickConfig: config => {
        const gluestickConfig = config;
        gluestickConfig.protocol = getProp(applicationServer, 'protocol');
        gluestickConfig.host = getProp(applicationServer, 'host');
        gluestickConfig.ports.client = getProp(applicationServer, 'port');
        gluestickConfig.ports.server = getProp(applicationServer, 'assetPort');
        return gluestickConfig;
      },
      clientWebpackConfig: config => applyWebpackAdditions(config, true),
      serverWebpackConfig: config => applyWebpackAdditions(config),
      vendorDllWebpackConfig: config => ({
        ...config,
        entry: {
          vendor: [...vendor, ...config.entry.vendor],
        },
      }),
    },
  };
};
