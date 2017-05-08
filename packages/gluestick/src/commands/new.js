/* @flow */

import type { CommandAPI, Logger } from '../types';

const spawn = require('cross-spawn');
const generate = require('gluestick-generators').default;

const { highlight, filename } = require('../cli/colorScheme');
const packageJSON = require('../../package.json');

module.exports = (
  { getLogger, getOptions, isGluestickProject }: CommandAPI, commandArguments: any[],
) => {
  const logger: Logger = getLogger();
  const appName: string = commandArguments[0];
  const options = getOptions(commandArguments);

  const successMessageHandler = () => {

  };

  if (isGluestickProject()) {
    logger.print('');
    logger.info(`${filename(appName)} is being generated...`);

    generate({
      generatorName: 'new',
      entityName: appName,
      options: { dev: options.dev || null, appName, skipMain: options.skipMain },
    }, logger, { successMessageHandler });

    // Install necessary flow-typed definitions
    spawn.sync(
      './node_modules/.bin/flow-typed',
      ['install', `jest@${packageJSON.dependencies.jest}`],
      { stdio: 'inherit' },
    );

    logger.print('');
    logger.success(`${highlight('New GlueStick project created')} at ${filename(process.cwd())}`);
    logger.info(
      'To run your app and start developing\n'
      + `         -> cd ${appName}\n`
      + '         -> gluestick start\n'
      + '         -> Point the browser to http://localhost:8888',
    );
    // process.exit(0);
  }
};
