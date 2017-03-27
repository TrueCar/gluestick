/* @flow */
const spawnMock = jest.fn();
jest.setMock('cross-spawn', ({ spawn: { sync: spawnMock } }));
const clone = require('clone');
const context = require('../../../__tests__/mocks/context');
const testCommand = require('../test');

const getMockedContext = (aliases, rules) => {
  const contextConfigCopy = clone(context.config);
  console.log(contextConfigCopy.webpackConfig.client);
  contextConfigCopy.webpackConfig.client.resolve.alias = aliases;
  contextConfigCopy.webpackConfig.client.module.rules = rules;
  return {
    ...context,
    config: contextConfigCopy,
  };
};

describe('commands/test/test', () => {
  beforeEach(() => {
    spawnMock.mockClear();
  });

  describe('in debug mode', () => {
    it('should spawn degugger', () => {
      testCommand(getMockedContext({}, [
        { test: /\.js$/ },
        { test: /\.scss$/ },
        { test: /\.css$/ },
        { test: /\.woff$/ },
        { test: /\.png$/ },
        { test: /\.ttf$/ },
      ]), {
        debugTest: true,
        parent: {
          rawArgs: ['', '', '', '--debug-test'],
        },
      });
      expect(spawnMock.mock.calls.length).toBe(1);
      expect(spawnMock.mock.calls[0][1].indexOf('--inspect')).toBeGreaterThan(-1);
      expect(spawnMock.mock.calls[0][1].indexOf('--debug-brk')).toBeGreaterThan(-1);
      expect(spawnMock.mock.calls[0][1].indexOf('--env')).toBeGreaterThan(-1);
      expect(spawnMock.mock.calls[0][1].indexOf('--config')).toBeGreaterThan(-1);
      expect(spawnMock.mock.calls[0][1].indexOf('-i')).toBeGreaterThan(-1);
      expect(spawnMock.mock.calls[0][1].indexOf('--watch')).toBeGreaterThan(-1);
      expect(spawnMock.mock.calls[0][0]).toEqual('node');
      expect(spawnMock.mock.calls[0][2]).toEqual({
        stdio: 'inherit',
      });
    });

    it('should notify about default Jest params', () => {
      context.logger.info.mockClear();
      testCommand(getMockedContext({}, [
        { test: /\.js$/ },
        { test: /\.scss$/ },
        { test: /\.css$/ },
        { test: /\.woff$/ },
        { test: /\.png$/ },
        { test: /\.ttf$/ },
      ]), {
        debugTest: true,
        parent: {
          rawArgs: ['', '', '', '--debug-test', '-i'],
        },
      });
      expect(context.logger.info.mock.calls[0]).toEqual([
        'Option \'-i\' is always set by default in debug mode',
      ]);
    });
  });

  describe('in non-debug mode', () => {
    it('should run jest directly with default config', () => {

    });

    it('should run jest directly with merged default and custom config', () => {

    });
  });
});
