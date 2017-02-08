const defaultConfig = require('./defaults/glueStickConfig');

module.exports = (plugins) => {
  const GSConfigOverrides = plugins.map(plugin => plugin.body.GSConfig).filter(config => !!config);
  return Object.assign({}, defaultConfig, ...GSConfigOverrides);
};
