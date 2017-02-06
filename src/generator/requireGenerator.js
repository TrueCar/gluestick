const fs = require("fs");
const path = require("path");
const createTemplate = require("./createTemplate");
// Provide createTemplate function for generators
module.createTemplate = createTemplate;

const PREDEFINED = "predefined";
const EXTERNAL = "generators";

const convertToCamelCase = value => {
  return value.replace(/(\-\w)/g, match => match[1].toUpperCase());
};

const convertToKebabCase = value => {
  value = value.replace(/([A-Z])/g, match => `-${match[0].toLowerCase()}`);
  return value[0] === "-" ? value.substring(1) : value;
};

const getPossiblePaths = generatorName => {
  return [
    path.join(process.cwd(), `generators/${convertToCamelCase(generatorName)}.js`),
    path.join(process.cwd(), `generators/${convertToKebabCase(generatorName)}.js`),
    path.join(__dirname, `${PREDEFINED}/${convertToCamelCase(generatorName)}.js`),
    path.join(__dirname, `${EXTERNAL}/${convertToKebabCase(generatorName)}.js`)
  ];
};

/**
 * Requires generator from predefined generators or from GlueStick project.
 *
 * @param {String} generatorName Generator name to require
 * @returns {Object}
 */
const requireGeneratorConfig = generatorName => {
  const paths = getPossiblePaths(generatorName);
  const pathToGenerator = paths.find(pathToGenerator => {
    return fs.existsSync(pathToGenerator);
  });
  if (!pathToGenerator) {
    throw new Error(
      `Generator ${generatorName} was not found at paths:\n`
      + `  ${paths.join("\n  ")}`
    );
  }
  return {
    name: path.basename(pathToGenerator, ".js"),
    config: require(pathToGenerator)
  };
};

module.exports = exports = requireGeneratorConfig;
