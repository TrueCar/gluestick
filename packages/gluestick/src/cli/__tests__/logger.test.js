/* @flow */

const loggerFactory = require('../logger');
const colorScheme = require('../colorScheme');

const logAndAssert = (message: string, shouldNotLog: string[], loggerInstance: Object) => {
  Object.keys(loggerInstance).filter(key => key !== 'level').forEach((level: string): void => {
    console.log.mockClear();
    loggerInstance[level](message);
    if (shouldNotLog.indexOf(level) > -1) {
      expect(console.log).not.toBeCalledWith('[GlueStick]', colorScheme[level](message));
    } else if (level === 'error') {
      expect(console.log).toHaveBeenCalledWith('[GlueStick]', 'ERROR: ', colorScheme[level](message));
    } else {
      expect(console.log).toHaveBeenCalledWith('[GlueStick]', colorScheme[level](message));
    }
  });
};

const originalConsoleLog = console.log.bind(console);
// $FlowFixMe Flow doesn't like that we assign console.log to a mock function
console.log = jest.fn();

describe('logger', () => {
  const message = 'Some test message';

  afterAll(() => {
    // $FlowIgnore
    console.log = originalConsoleLog;
  });

  it('should log `info`, `success`, `warn` and `error`', () => {
    const logger = loggerFactory();
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
