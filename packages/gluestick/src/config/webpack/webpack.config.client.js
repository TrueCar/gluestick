/* @flow */

import type { WebpackConfig, UniversalWebpackConfigurator, GSConfig, Logger } from '../../types';

const { clientConfiguration } = require('universal-webpack');
const glob = require('glob');
const path = require('path');
const deepClone = require('./deepCopy');
const generator = require('../../generator');

const buildEntries = (gluestickConfig: GSConfig, logger: Logger) => {
  const entries = require(path.join(process.cwd(), gluestickConfig.entriesPath));
  Object.keys(entries).forEach(entry => {
    let name = entries[entry].name || entry;
    name = name === '/' ? 'main' : name.replace('/', '');
    generator({
      generatorName: 'clientEntryInit',
      entityName: name,
      options: {
        routes: `routes/${name}`,
        clientEntryInitPath: gluestickConfig.clientEntryInitPath,
      },
    }, logger);
  });
  return glob.sync(
    path.join(process.cwd(), `${gluestickConfig.clientEntryInitPath}/**/*.js`),
  ).reduce((prev, curr) => {
    const name = path.basename(curr, '.js');
    return Object.assign(prev, { [name]: curr.replace(process.cwd(), '.') });
  }, {});
};

module.exports = (
  logger: Logger, configuration: WebpackConfig, settings: Object, gluestickConfig: GSConfig,
): UniversalWebpackConfigurator => {
  const config = deepClone(configuration);
  // https://webpack.github.io/docs/multiple-entry-points.html
  config.entry = buildEntries(gluestickConfig, logger);
  return options => clientConfiguration(config, settings, options);
};
