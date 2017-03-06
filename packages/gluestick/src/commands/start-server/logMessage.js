/* @flow */
import type { Logger } from '../../types';

module.exports = (logger: Logger, childProcess: Object): void => {
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
        logger.success(...parsedMsg);
        break;
    }
  });
};
