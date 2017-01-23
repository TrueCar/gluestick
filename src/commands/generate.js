const logger = require("../lib/cliLogger");
const generator = require("../generator");

module.exports = exports = (generatorName, entityName, options) => {
  try {
    generator({
      generatorName,
      entityName,
      options
    }, logger);
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
};
