/* @flow */
import type { CommandAPI, Logger } from '../../types';

const autoUpgrade = require('./autoUpgrade');
const appendPostinstallScript = require('./appendPostinstallScript');

module.exports = async ({
  getLogger,
  getGluestickConfig,
  getPlugins,
}: CommandAPI) => {
  const logger: Logger = getLogger();

  logger.clear();
  logger.printCommandInfo();

  try {
    appendPostinstallScript();

    // $FlowIgnore no need for compiling webpack config
    await autoUpgrade({
      logger,
      config: {
        GSConfig: getGluestickConfig(logger, getPlugins(logger)),
      },
    });
  } catch (error) {
    logger.fatal(error);
  }
};
