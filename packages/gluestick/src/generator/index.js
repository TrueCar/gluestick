const path = require('path');
const requireGenerator = require('./requireGenerator');
const parseConfig = require('./parseConfig');
const writeTemplate = require('./writeTemplate');

/**
 * Starts generator routine.
 *
 * @param {Object} { generatorName, entityName, options } Command object
 * @param {Object} logger Logger instance
 */
module.exports = ({ generatorName, entityName, options }, logger) => {
  if (!/^[a-zA-Z0-9]+$/.test(entityName)) {
    throw new Error('Invalid name specified');
  }
  const generator = requireGenerator(generatorName);
  const generatorConfig = parseConfig(
    generator.config,
    Object.assign({}, options, {
      generator: generator.name,
      name: path.basename(entityName),
      dir: path.dirname(entityName),
    }),
  );
  const results = writeTemplate(generatorConfig);
  logger.success(
    `${generator.name} ${entityName} generated successfully\n`
    + 'Files written: \n'
    + `  ${results.written.length ? results.written.join('\n  ') : '--'}`
    + '\nFiles modified: \n'
    + `  ${results.modified.length ? results.modified.join('\n  ') : '--'}`,
  );
  process.exit(0);
};
