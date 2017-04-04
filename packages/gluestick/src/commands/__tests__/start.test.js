/* @flow */
let spawnEventHandlers = [];
const spawnFn = jest.fn(
  () => ({
    on: (event, fn) => {
      spawnEventHandlers.push({ event, fn });
    },
  }),
);
jest.setMock('cross-spawn', spawnFn);
const startCommand = require('../start');
const context = require('../../__tests__/mocks/context');

describe('commands/start', () => {
  beforeEach(() => {
    spawnEventHandlers = [];
    spawnFn.mockClear();
  });

  describe('in production', () => {
    it('should not spawn test command and spawn start-server and start-client only', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      startCommand(context, {
        dev: false,
        skipBuild: false,
        runTests: false,
        parent: {
          rawArgs: [],
        },
      });
      spawnEventHandlers.forEach((evh) => evh.fn('client started'));
      expect(spawnFn.mock.calls[0][1][1]).toEqual('start-client');
      expect(spawnFn.mock.calls[1][1][1]).toEqual('start-server');
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should not spawn test not start-client command and spawn start-server only', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      startCommand(context, {
        skipBuild: true,
        dev: false,
        runTests: false,
        parent: {
          rawArgs: ['-P'],
        },
      });
      expect(spawnFn.mock.calls[0][1][1]).toEqual('start-server');
      expect(spawnFn.mock.calls.length).toBe(1);
      process.env.NODE_ENV = originalNodeEnv;
    });
  });

  describe('in development', () => {
    it('should spawn test command', () => {
      startCommand(context, {
        runTests: true,
        dev: false,
        skipBuild: false,
        parent: {
          rawArgs: ['-T'],
        },
      });
      expect(spawnFn.mock.calls[0][1][0]).toEqual('test');
      expect(spawnFn.mock.calls.length).toBe(3);
    });

    it('should spawn start-server and start-client', () => {
      startCommand(context, {
        dev: false,
        skipBuild: false,
        runTests: false,
        parent: {
          rawArgs: [],
        },
      });
      spawnEventHandlers.forEach((evh) => evh.fn('client started'));
      expect(spawnFn.mock.calls[0][1][1]).toEqual('start-client');
      expect(spawnFn.mock.calls[1][1][1]).toEqual('start-server');
      expect(spawnFn.mock.calls.length).toBe(2);
    });
  });
});

