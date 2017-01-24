const logger = require("../lib/cliLogger");
const generator = require("../generator");

module.exports = exports = (generatorName, entityName, options) => {
  /**
   * TODO: pass options from CLI to generator
   */
  try {
    const filteredOptions = { functional: options.functional };
    generator({
      generatorName,
      entityName,
      filteredOptions
    }, logger);
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
};
