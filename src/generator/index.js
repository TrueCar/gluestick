const fs = require("fs");
const path = require("path");

const parseConfig = require("./parseConfig");
const writeTemplate = require("./writeTemplate");

/**
 * TODO: handle camelCase and kebab-case
 * TODO: make API for modifying already existing file
 */

/**
 * Requires generator from predefined generators or from GlueStick project.
 *
 * @param {String} generatorName Generator name to require
 * @returns {Object}
 */
const requireGeneratorConfig = generatorName => {
  // (opt) convert to camelCase
  let pathToGenerator = path.join(__dirname, `predefined/${generatorName}.js`);
  if (!fs.existsSync(pathToGenerator)) {
    pathToGenerator = path.join(process.cwd(), "generators", `${generatorName}.js`);
  }
  try {
    return require(pathToGenerator);
  } catch (error) {
    throw new Error(`Generator ${generatorName} was not found at path ${pathToGenerator}`); 
  }
};

/**
 * Starts generator routine.
 *
 * @param {Object} { generatorName, entityName, options } Command object
 * @param {Object} logger Logger instance
 */
module.exports = exports = ({ generatorName, entityName, options }, logger) => {
  const generatorConfig = parseConfig(
    requireGeneratorConfig(generatorName),
    Object.assign({}, options, { generator: generatorName, name: entityName })
  );
  writeTemplate(generatorConfig);
  logger.success(`${generatorName} ${entityName} generated successfully`);
  process.exit(0);
};
