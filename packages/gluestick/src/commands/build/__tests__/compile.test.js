/* @flow */

const webpack = { run: jest.fn() };
jest.setMock('webpack', () => webpack);
jest.mock('../../../config/createWebpackStats.js');

const compile = require('../compile');
const context = require('../../../__tests__/mocks/context');
const createWebpackStats = require('../../../config/createWebpackStats');

describe('commands/build/compile', () => {
  beforeEach(() => {
    webpack.run = jest.fn();
    context.logger.success = jest.fn();
  });

  it('should reject promise on compilation error', () => {
    const promise = compile(context, {}, 'test');
    webpack.run.mock.calls[0][0](new Error('test'));
    return promise.catch(error => {
      expect(error).toEqual(new Error('test'));
    });
  });

  it('should resolve promise on successfull compilation', () => {
    const promise = compile(context, {}, 'test');
    webpack.run.mock.calls[0][0](null, {});
    return promise.then(() => {
      expect(context.logger.success).toHaveBeenCalledWith('Test bundle has been prepared for test');
    });
  });

  it('should create webpack stats', () => {
    const promise = compile(context, { stats: true }, 'test');
    webpack.run.mock.calls[0][0](null, {});
    return promise.then(() => {
      expect(context.logger.success).toHaveBeenCalledWith('Test bundle has been prepared for test');
      expect(createWebpackStats).toHaveBeenCalledWith('-test', {});
    });
  });
});
