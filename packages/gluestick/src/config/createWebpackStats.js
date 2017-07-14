/* @flow */

const fs = require('fs');
const path = require('path');

/**
 * Writes webpack JSON stats file for analysis with https://github.com/webpack/analyse
 * @param statsFilename {string} Stats output filename (without extension)
 * @param statsObject {Object} Webpack stats instance https://webpack.js.org/api/node/#stats-object
 * @param statsOptions {Object} Webpack stats options https://webpack.js.org/configuration/stats/
 */
module.exports = (
  statsFilename: string,
  statsObject: Object,
  statsOptions: Object = {},
): void => {
  fs.writeFileSync(
    path.join(process.cwd(), `${statsFilename}.json`),
    JSON.stringify(statsObject.toJson(statsOptions)),
    'utf-8',
  );
};
