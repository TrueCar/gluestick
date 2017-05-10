/* @flow */
import type { Logger } from '../../types';

const progressHandler = require('../../config/webpack/progressHandler');

module.exports = (logger: Logger, childProcess: Object): void => {
  let firstMessage = true;
  childProcess.on('message', (msg: { type: string, value: any[] }): void => {
    const parsedMsg = Array.isArray(msg.value)
      ? msg.value.map((v: string): Object => JSON.parse(v))
      : JSON.parse(msg.value);
    switch (msg.type) {
      default:
      case 'debug':
        logger.debug(...parsedMsg);
        break;
      case 'info':
        logger.info(...parsedMsg);
        break;
      case 'warn':
        logger.warn(...parsedMsg);
        break;
      case 'error':
        logger.error(...parsedMsg);
        break;
      case 'success':
        if (firstMessage) {
          firstMessage = false;
          progressHandler.markValid('server');
          logger.resetLine();
        }
        logger.success(...parsedMsg);
        break;
    }
  });
};
