const logger = require("../lib/cliLogger");
const generator = require("../generator");

module.exports = exports = (config, logger_, command) => {
  try {
    const filteredOptions = {
      functional: command[2].functional,
      ...JSON.parse(command[2].genOptions ? command[2].genOptions : "{}")
    };
    generator({
      generatorName: command[0],
      entityName: command[1],
      options: filteredOptions
    }, logger);
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
};
