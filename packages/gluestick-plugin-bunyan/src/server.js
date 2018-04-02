/* @flow */

import bunyan from 'bunyan';
import path from 'path';

export type Options = {
  name: string,
  level?: string | number,
  stream?: Object,
  streams?: Object[],
  serializers?: Object,
  src?: boolean,
};

export type Logger = {
  success: Function,
  info: Function,
  warn: Function,
  debug: Function,
  error: Function,
};

type PluginUtilities = {
  requireModule: Function,
};

const defaultSettings: Options = {
  name: 'default name',
};

type BunyanPlugin = (
  opts: Object,
  pluginUtilities: PluginUtilities,
) => { logger?: Logger };

const bunyanPlugin: BunyanPlugin = (opts, { requireModule }) => {
  let userSettings: Options;
  try {
    userSettings = requireModule(
      path.join(process.cwd(), 'src/bunyan.config.js'),
    );
  } catch (error) {
    // NOOP if we haven't settings from user we use default.
  }
  const options: Options = { ...defaultSettings, userSettings };
  const loggerWithSuccessMethod: Logger = bunyan.createLogger(options);
  loggerWithSuccessMethod.success = loggerWithSuccessMethod.info;
  return {
    logger: loggerWithSuccessMethod,
  };
};

bunyanPlugin.meta = { name: 'gluestick-plugin-bunyan' };

export default bunyanPlugin;
