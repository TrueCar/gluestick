/* @flow */

jest.mock('fs', () => ({
  existsSync: (value) => ['src/shared', 'src/apps/main'].indexOf(value) > -1,
}));
const utils = require('../utils');

const logger = {
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  success: jest.fn(),
  error: jest.fn(),
};

describe('utils', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  it('covertToCamelCase should convert to camel case', () => {
    expect(utils.convertToCamelCase('someValue')).toEqual('someValue');
    expect(utils.convertToCamelCase('some-value')).toEqual('someValue');
    expect(utils.convertToCamelCase('SomeValue')).toEqual('someValue');
  });

  it('covertToKebabCase should convert to kebab case', () => {
    expect(utils.convertToKebabCase('someValue')).toEqual('some-value');
    expect(utils.convertToKebabCase('some-value')).toEqual('some-value');
    expect(utils.convertToKebabCase('SomeValue')).toEqual('some-value');
  });

  it('isValidEntryPoint should check if value is valid', () => {
    expect(utils.isValidEntryPoint('test', logger)).toBeFalsy();
    expect(utils.isValidEntryPoint('shared', logger)).toBeTruthy();
    expect(utils.isValidEntryPoint('apps/home', logger)).toBeFalsy();
    expect(utils.isValidEntryPoint('apps/main', logger)).toBeTruthy();
  });
});
