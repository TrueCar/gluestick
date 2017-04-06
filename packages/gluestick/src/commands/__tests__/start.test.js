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

const originalNodeEnv = process.env.NODE_ENV;

describe('commands/start', () => {
  beforeEach(() => {
    spawnEventHandlers = [];
    spawnFn.mockClear();
  });

  describe('in production', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    afterAll(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should build client, server and spawn start-server without build', () => {
      const startPromise = startCommand(context, {
        dev: false,
        skipBuild: false,
        runTests: false,
        parent: {
          rawArgs: [],
        },
      });

      spawnEventHandlers.forEach(({ event, fn }) => {
        if (event === 'exit') {
          fn(0);
        }
      });

      return startPromise.then(() => {
        expect(spawnFn.mock.calls[0][1][1]).toEqual('build');
        expect(spawnFn.mock.calls[0][1][2]).toEqual('--client');
        expect(spawnFn.mock.calls[1][1][1]).toEqual('build');
        expect(spawnFn.mock.calls[1][1][2]).toEqual('--server');
        expect(spawnFn.mock.calls[2][1][1]).toEqual('start-server');
      });
    });

    it('should try to build client, server and handle rejection', () => {
      const originalProcessExit = process.exit.bind(process);
      // $FlowIgnore
      process.exit = jest.fn();
      const startPromise = startCommand(context, {
        dev: false,
        skipBuild: false,
        runTests: false,
        parent: {
          rawArgs: [],
        },
      });

      spawnEventHandlers[0].fn(1);
      spawnEventHandlers[3].fn(new Error('test'));

      return startPromise.then(() => {
        expect(process.exit.mock.calls).toEqual([[1]]);
        // $FlowIgnore
        process.exit = originalProcessExit;
      });
    });

    it('should spawn start-server without build if skipBuild is passed', () => {
      startCommand(context, {
        dev: false,
        skipBuild: true,
        runTests: false,
        parent: {
          rawArgs: ['--skip-build'],
        },
      });
      expect(spawnFn.mock.calls[0][1][1]).toEqual('start-server');
    });
  });

  describe('in development', () => {
    it('should spawn start-client with build and spawn start-server with build', () => {
      startCommand(context, {
        dev: false,
        skipBuild: false,
        runTests: false,
        parent: {
          rawArgs: [],
        },
      });
      expect(spawnFn.mock.calls[0][1][1]).toEqual('start-client');
      expect(spawnFn.mock.calls[1][1][1]).toEqual('start-server');
    });
    it('should spawn start-client with build, spawn start-server with build and run tests', () => {
      startCommand(context, {
        dev: false,
        skipBuild: false,
        runTests: true,
        parent: {
          rawArgs: ['-T'],
        },
      });
      expect(spawnFn.mock.calls[0][1][1]).toEqual('test');
      expect(spawnFn.mock.calls[1][1][1]).toEqual('start-client');
      expect(spawnFn.mock.calls[2][1][1]).toEqual('start-server');
    });
  });
});
