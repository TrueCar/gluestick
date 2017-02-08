/* @flow */

const logger = require('../logger');
const colorScheme = require('../colorScheme');

describe('logger', () => {
  // $FlowFixMe Flow doesn't like that we assign console.log to a mock function
  console.log = jest.fn();

  const message = 'Some test message';

  Object.keys(logger).forEach(key => {
    if (key !== 'error') {
      it(`logs ${key}`, () => {
        logger[key](message);
        expect(console.log).toBeCalledWith('[GlueStick]', colorScheme[key](message));
      });
    }
  });

  it('logs error', () => {
    logger.error('Errors are bad');
    expect(console.log).toBeCalledWith('[GlueStick]', 'ERROR: ', colorScheme.error('Errors are bad'));
  });
});
