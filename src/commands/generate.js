const generator = require("../generator");

module.exports = exports = ({ config, logger }, generatorName, entityName, options) => {
  const filteredOptions = {
    functional: options.functional,
    ...JSON.parse(options.genOptions ? options.genOptions : "{}")
  };
  generator({
    generatorName,
    entityName,
    options: filteredOptions
  }, logger);
};
