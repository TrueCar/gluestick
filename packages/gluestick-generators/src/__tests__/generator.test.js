/* @flow */
jest.mock('../writeTemplate', () => () => ({
  written: ['my-path/MyComponent', 'my-path/__tests__/MyComponent'],
  modified: [],
}));
jest.mock('../requireGenerator.js', () => () => ({
  name: 'test',
  config: {
    entry: {
      filename: 'test',
      path: 'testPath',
      template: () => 'template',
    },
  },
}));

const fs = require('fs');
const generator = require('../').default;

const logger = {
  info: jest.fn(),
  success: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

describe('generator/index', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should log an error if name is not alphanumerical', () => {
    fs.existsSync = jest.fn().mockReturnValueOnce(true);
    generator(
      {
        generatorName: 'component',
        entityName: '@',
        options: {
          entryPoint: 'shared',
        },
      },
      logger,
    );
    expect(logger.error).toBeCalledWith('Invalid name specified');
  });

  describe('predefined generators', () => {
    it('should log an error if entryPoint does not exist', () => {
      fs.existsSync = jest.fn().mockReturnValueOnce(true);
      generator(
        {
          generatorName: 'component',
          entityName: 'MyComponent',
          options: {
            entryPoint: 'invalid',
          },
        },
        logger,
      );
      expect(logger.error).toBeCalledWith('invalid is not a valid entry point');
      expect(logger.info).toBeCalledWith(
        "Pass -E and a valid entry point: 'shared' or 'apps/{validAppName}'",
      );
    });

    it('should log an error if path does not exist', () => {
      fs.existsSync = jest.fn().mockReturnValueOnce(false);
      generator(
        {
          generatorName: 'component',
          entityName: 'MyComponent',
          options: {
            entryPoint: 'shared',
          },
        },
        logger,
      );
      expect(logger.error).toBeCalledWith('Path src/shared does not exist');
    });
  });

  it('should successfully generate files', () => {
    generator(
      {
        generatorName: 'test',
        entityName: 'test',
      },
      logger,
    );
    expect(logger.success).toBeCalledWith(
      'test test generated successfully\n' +
        'Files written: \n' +
        '  my-path/MyComponent\n' +
        '  my-path/__tests__/MyComponent\n' +
        'Files modified: \n  --',
    );
  });
  // @TODO test success cases (requires several mocks)
});
