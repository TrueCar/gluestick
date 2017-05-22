/* @flow */
import type { CommandAPI, Logger } from '../../types';

const autoUpgrade = require('./autoUpgrade');

module.exports = async ({ getLogger, getGluestickConfig, getPlugins }: CommandAPI) => {
  const logger: Logger = getLogger();

  logger.clear();
  logger.printCommandInfo();

  try {
    // $FlowIgnore no need for compiling webpack config
    await autoUpgrade({
      logger,
      config: {
        GSConfig: getGluestickConfig(
          logger,
          getPlugins(logger),
          { hideMissingConfigWarning: true },
        ),
      },
    });
  } catch (error) {
    logger.fatal(error);
  }
};
