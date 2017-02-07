const { clientConfiguration } = require('universal-webpack');

module.exports = (configuration, settings) => {
  return options => clientConfiguration(configuration, settings, options);
};
