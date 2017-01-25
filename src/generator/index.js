const path = require("path");
const requireGenerator = require("./requireGenerator");
const parseConfig = require("./parseConfig");
const writeTemplate = require("./writeTemplate");

/**
 * Starts generator routine.
 *
 * @param {Object} { generatorName, entityName, options } Command object
 * @param {Object} logger Logger instance
 */
module.exports = exports = ({ generatorName, entityName, options }, logger) => {
  const generator = requireGenerator(generatorName);
  const generatorConfig = parseConfig(
    generator.config,
    Object.assign({}, options, {
      generator: generator.name,
      name: path.basename(entityName),
      dir: path.dirname(entityName)
    })
  );
  writeTemplate(generatorConfig);
  logger.success(`${generator.name} ${entityName} generated successfully`);
  process.exit(0);
};
