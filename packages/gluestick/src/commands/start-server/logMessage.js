/* @flow */
import type { Logger } from '../../types';

module.exports = (logger: Logger, childProcess: Object): void => {
  childProcess.on('message', (msg: { type: string, value: any[] }): void => {
    switch (msg.type) {
      default:
      case 'debug':
        logger.debug(...msg.value);
        break;
      case 'info':
        logger.info(...msg.value);
        break;
      case 'warn':
        logger.warn(...msg.value);
        break;
      case 'error':
        logger.error(...msg.value);
        break;
      case 'success':
        logger.success(...msg.value);
        break;
    }
  });
};
