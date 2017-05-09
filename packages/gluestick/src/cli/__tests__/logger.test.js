/* @flow */

const loggerFactory = require('../logger');
const colorScheme = require('../colorScheme');

const logAndAssert = (message: string, shouldNotLog: string[], loggerInstance: Object) => {
  ['debug', 'info', 'warn', 'error', 'success'].forEach((level: string): void => {
    // $FlowFixMe logger adds _log to console object
    console._log.mockClear();
    loggerInstance[level](message);
    if (shouldNotLog.indexOf(level) > -1) {
      // $FlowFixMe logger adds _log to console object
      expect(console._log).not.toBeCalledWith(
        colorScheme[level](`  ${level.toUpperCase()}  `),
        message,
        '\n',
      );
    } else {
      // $FlowFixMe logger adds _log to console object
      expect(console._log).toHaveBeenCalledWith(
        colorScheme[level](`  ${level.toUpperCase()}  `),
        message,
        '\n',
      );
    }
  });
};

// $FlowFixMe logger adds _log to console object
const originalConsoleLog = console._log.bind(console);
// $FlowFixMe Flow doesn't like that we assign console.log to a mock function
console._log = jest.fn();

describe('cli/logger', () => {
  const message = 'Some test message';

  afterAll(() => {
    // $FlowIgnore
    console._log = originalConsoleLog;
  });

  it('should log `info`, `success`, `warn` and `error`', () => {
    const logger = loggerFactory('info');
    logAndAssert(message, ['debug'], logger);
  });

  it('should log `success`, `warn` and `error`', () => {
    const logger = loggerFactory('success');
    logAndAssert(message, ['debug', 'info'], logger);
  });

  it('should log `warn` and `error`', () => {
    const logger = loggerFactory('warn');
    logAndAssert(message, ['debug', 'info', 'success'], logger);
  });

  it('should log error`', () => {
    const logger = loggerFactory('error');
    logAndAssert(message, ['debug', 'info', 'success', 'warn'], logger);
  });
});
