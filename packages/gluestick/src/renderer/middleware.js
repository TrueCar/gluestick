const outputCreator = require('./outputCreator').default;
const getRenderRequirementsFromEntrypoints = require('../lib/server/getRenderRequirementsFromEntrypoints').default;

module.exports = (req, res, config, logger) => {
  const renderRequirements = getRenderRequirementsFromEntrypoints(req, res, config, logger);
  const output = outputCreator(renderRequirements);
  res.send(output);
};
