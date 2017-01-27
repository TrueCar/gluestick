const logger = require("../lib/cliLogger");
const generator = require("../generator");

module.exports = exports = (generatorName, entityName, options) => {
  try {
    const filteredOptions = { functional: options.functional, ...JSON.parse(options.genOptions) };
    generator({
      generatorName,
      entityName,
      options: filteredOptions
    }, logger);
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
};
