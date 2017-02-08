const path = require('path');

module.exports = ({ plugins } = {}) => Array.isArray(plugins) ? plugins.map(
    plugin => ({
      name: plugin,
      body: require(path.join(process.cwd(), 'node_modules', plugin))(),
    }),
  ) : [];
