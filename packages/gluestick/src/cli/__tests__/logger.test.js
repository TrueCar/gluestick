/* @flow */

const loggerFactory = require('../logger');
const colorScheme = require('../colorScheme');

const logAndAssert = (message: string, shouldNotLog: string[], loggerInstance: Object) => {
  ['debug', 'info', 'warn', 'error', 'success'].forEach((level: string): void => {
    console.log.mockClear();
    loggerInstance[level](message);
    const header = process.env.CI
      ? `[GlueStick][${process.argv[2]}][${level.toUpperCase()}]`
      : colorScheme[level](`  ${level.toUpperCase()}  `);
    if (shouldNotLog.indexOf(level) > -1) {
      expect(console.log).not.toBeCalledWith(
        header,
        message,
        '\n',
      );
    } else {
      expect(console.log).toHaveBeenCalledWith(
        header,
        message,
        '\n',
      );
    }
  });
};

const originalConsoleLog = console.log.bind(console);
// $FlowFixMe Flow doesn't like that we assign console.log to a mock function
console.log = jest.fn();

describe('cli/logger', () => {
  const message = 'Some test message';

  afterAll(() => {
    // $FlowIgnore
    console.log = originalConsoleLog;
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
