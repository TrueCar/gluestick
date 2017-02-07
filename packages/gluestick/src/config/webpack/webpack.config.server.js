const { serverConfiguration } = require('universal-webpack');

module.exports = (configuration, settings) => {
  return serverConfiguration(configuration, settings);
};
