/* @flow */
jest.mock('../writeTemplate', () => ({
  written: ['my-path/MyComponent', 'my-path/__tests__/MyComponent'],
  modified: [],
}));
jest.mock('../../cli/logger');

const fs = require('fs');
const generator = require('../').default;

const logger = {
  info: console.log,
  success: console.log,
  error: console.log,
  warn: console.log,
  debug: console.log,
};

describe('generator/index', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should log an error if name is not alphanumerical', () => {
    fs.existsSync = jest.fn().mockReturnValueOnce(true);
    generator({
      generatorName: 'component',
      entityName: '@',
      options: {
        entryPoint: 'shared',
      },
    }, logger);
    expect(logger.error).toBeCalledWith('Invalid name specified');
  });

  describe('predefined generators', () => {
    it('should log an error if entryPoint does not exist', () => {
      fs.existsSync = jest.fn().mockReturnValueOnce(true);
      generator({
        generatorName: 'component',
        entityName: 'MyComponent',
        options: {
          entryPoint: 'invalid',
        },
      }, logger);
      expect(logger.error).toBeCalledWith('invalid is not a valid entry point');
      expect(logger.info).toBeCalledWith('Pass -E and a valid entry point: \'shared\' or \'apps/{validAppName}\'');
    });

    it('should log an error if path does not exist', () => {
      fs.existsSync = jest.fn().mockReturnValueOnce(false);
      generator({
        generatorName: 'component',
        entityName: 'MyComponent',
        options: {
          entryPoint: 'shared',
        },
      }, logger);
      expect(logger.error).toBeCalledWith('Path src/shared does not exist');
    });
  });

  // @TODO test success cases (requires several mocks)
});
