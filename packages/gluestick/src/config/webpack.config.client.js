const { clientConfiguration } = require('universal-webpack');
const settings = require('./universalWebpackSettings');
const configuration = require('./webpack.config');

module.exports = options => clientConfiguration(configuration, settings, options);
