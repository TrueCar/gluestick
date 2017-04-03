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

  it('throttle should throttle function calls', () => {
    const fn = jest.fn();
    const throttledFn = utils.throttle(fn, 20);
    const promises = [];
    for (let i = 0; i < 100; i++) {
      promises.push(
        new Promise((resolve) => {
          setTimeout(() => {
            throttledFn(true);
            resolve();
          }, 5 * i);
        }),
      );
    }
    return Promise.all(promises).then(() => {
      // Sometimes not all fn will manage to be called,
      // since setTimeout doesn't guarantee that the function
      // will execute exactly after the given time, but
      // rather it guarantees the function will be called
      // NO SOONER that the value in the 2nd arg
      expect(fn.mock.calls.length).toBeLessThan(100);
      fn.mock.calls.forEach(args => {
        expect(args).toEqual([true]);
      });
    });
  });
});
