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

const context = {
  config: {},
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    wanr: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
  },
};

describe('commands/start', () => {
  beforeEach(() => {
    spawnEventHandlers = [];
    spawnFn.mockClear();
  });

  describe('in production', () => {
    it('should not spawn test command and spawn start-server and start-client only', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      // $FlowIgnore
      startCommand(context, {
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
      // $FlowIgnore
      startCommand(context, {
        skipBuild: true,
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
      // $FlowIgnore
      startCommand(context, {
        runTests: true,
        parent: {
          rawArgs: ['-T'],
        },
      });
      expect(spawnFn.mock.calls[0][1][0]).toEqual('test');
      // There will be 2 calls to spawn since 'message' event is not triggered
      expect(spawnFn.mock.calls.length).toBe(2);
    });

    it('should spawn start-server and start-client', () => {
      // $FlowIgnore
      startCommand(context, {
        parent: {
          rawArgs: [],
        },
      });
      spawnEventHandlers.forEach((evh) => evh.fn('client started'));
      expect(spawnFn.mock.calls[0][1][1]).toEqual('start-client');
      expect(spawnFn.mock.calls[1][1][1]).toEqual('start-server');
      expect(spawnFn.mock.calls.length).toBe(2);
    });

    it('should not start-server if payload from event message is invalid', () => {
      // $FlowIgnore
      startCommand(context, {
        parent: {
          rawArgs: [],
        },
      });
      spawnEventHandlers.forEach((evh) => evh.fn('client failed'));
      expect(spawnFn.mock.calls[0][1][1]).toEqual('start-client');
      expect(spawnFn.mock.calls.length).toBe(1);
    });
  });
});

