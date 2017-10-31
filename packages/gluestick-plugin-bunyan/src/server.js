/* @flow */

import bunyan from 'bunyan';

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

const defaultSettings: Options = {
  name: 'default name',
};

const bunyanPlugin = (): { logger: Logger } => {
  let options: Options = defaultSettings;
  try {
    // $FlowIgnore
    const userSettings: Options = require('src/bunyan.config.js').default;
    options = Object.assign(options, userSettings);
  } catch (error) {
    // NOOP if we haven't settings from user we use default.
  }
  const loggerWithSuccessMethod: Logger = bunyan.createLogger(options);
  loggerWithSuccessMethod.success = loggerWithSuccessMethod.info;
  return {
    logger: loggerWithSuccessMethod,
  };
};

bunyanPlugin.meta = { name: 'gluestick-plugin-bunyan' };

export default bunyanPlugin;
