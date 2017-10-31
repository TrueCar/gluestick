/* @flow */
import type { CommandAPI, Logger } from '../types.js';

const spawn = require('cross-spawn');
const startClient = require('./start-client');
const startServer = require('./start-server');
const { filterArg } = require('./utils');
const path = require('path');
const compareModuleVersions = require('./compareVersions/compareModuleVersions');

const modulePath = path.join(process.cwd(), 'node_modules');

const skippedOptions: string[] = [
  '--dev',
  '-P',
  '--skip-build',
  '-T',
  '--run-tests',
];

type StartOptions = {
  logLevel?: string,
  runTests: boolean,
  skipBuild: boolean,
  skipDepCheck: boolean,
  parent: Object,
  dev: boolean,
};

const spawnFunc = (args: string[], customEnv: Object = {}): Promise<any> => {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(
      'node',
      ['./node_modules/.bin/gluestick', ...args],
      {
        stdio: 'inherit',
        env: { ...process.env, ...customEnv },
      },
    );

    childProcess.on('exit', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command ${args.join(' ')} returned code ${code}`));
      }
    });
    childProcess.on('error', error => {
      reject(error);
    });
  });
};

module.exports = (commandApi: CommandAPI, commandArguments: any[]) => {
  const options: StartOptions = commandApi.getOptions(commandArguments);
  const logger: Logger = commandApi.getLogger(options.logLevel);
  const isProduction: boolean = process.env.NODE_ENV === 'production';
  const rawArgs: string[] = filterArg(options.parent.rawArgs, skippedOptions);

  logger.clear();
  logger.printCommandInfo();

  /* gluestick start
   *   -> spawn start-client (w/ build), spawn start-server (w/ build)
   *
   * gluestick start --skip-build
   *   -> gluestick start
   *
   * NODE_ENV=production gluestick start
   *   -> build client, build server, spawn start-server (w/o build)
   *
   * NODE_ENV=production gluestick start --skip-build
   *   -> spawn start-server (w/o build)
   */

  // Start tests only they asked us to or we are in production mode
  let testCommand = Promise.resolve();
  if (!isProduction && options.runTests) {
    testCommand = spawnFunc(['test', ...rawArgs.slice(4)], {
      NODE_ENV: 'test',
    });
  }

  testCommand
    .then(() => {
      if (!options.skipDepCheck) {
        const packageJson = require(path.join(process.cwd(), 'package.json'));
        try {
          compareModuleVersions(packageJson, modulePath, logger);
        } catch (e) {
          logger.error(e);
        }
      }

      let clientCompilationDonePromise: Promise<void> = Promise.resolve();
      if (!isProduction) {
        clientCompilationDonePromise = startClient(
          commandApi,
          commandArguments,
          { printCommandInfo: false },
        );
      }

      if (!isProduction || (isProduction && options.skipBuild)) {
        startServer(commandApi, commandArguments, {
          printCommandInfo: false,
          delayStart: clientCompilationDonePromise,
        });
      }
    })
    .catch(() => {
      logger.fatal(
        "Some tests have failed, client and server won't be compiled and executed",
      );
    });

  if (isProduction && !options.skipBuild) {
    spawnFunc(['build', ...rawArgs.slice(3)])
      .then(() => {
        startServer(commandApi, commandArguments);
      })
      .catch(() => {
        logger.fatal("Build have failed, server won't be executed");
      });
  }
};
