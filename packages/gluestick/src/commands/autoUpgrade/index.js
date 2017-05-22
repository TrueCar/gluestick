/* @flow */
import type { CommandAPI, Logger } from '../../types';

const path = require('path');
const { execSync } = require('child_process');
const autoUpgrade = require('./autoUpgrade');
const { version, preset = 'default' } = require('../../../package.json');

module.exports = async ({ getLogger, getGluestickConfig, getPlugins }: CommandAPI) => {
  const logger: Logger = getLogger();

  logger.clear();
  logger.printCommandInfo();


  const gluestickDependency: string = require(
    path.join(process.cwd(), 'package.json'),
  ).dependencies.gluestick;
  const isDev: boolean = !/\d+\.\d+\.\d+.*/.test(gluestickDependency);

  try {
    // Check if preset is available, if not install it.
    try {
      require.resolve(`gluestick-preset-${preset}/package.json`);
    } catch (e) {
      logger.info(`Preset '${preset}' not found - installing...`);
      const packageToInstall = isDev
        ? `${gluestickDependency}-preset-${preset}`
        : `gluestick-preset-${preset}@${version}`;
      execSync(`npm install --save ${packageToInstall}`, { stdio: 'inherit' });
      logger.print('');
    }

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
