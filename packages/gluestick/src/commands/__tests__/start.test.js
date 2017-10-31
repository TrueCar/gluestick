/* @flow */
let spawnEventHandlers = [];
const spawnFn = jest.fn(() => ({
  on: (event, fn) => {
    spawnEventHandlers.push({ event, fn });
  },
}));
jest.setMock('cross-spawn', spawnFn);
jest.mock('../start-client');
jest.mock('../start-server');
jest.mock('../compareVersions/compareModuleVersions');
const startCommand = require('../start');
const startClient = require('../start-client');
const startServer = require('../start-server');
const compareModuleVersions = require('../compareVersions/compareModuleVersions');
const mockedCommandApi = require('../../__tests__/mocks/context').commandApi;

const fatalLogger = jest.fn();
const commandApi = {
  ...mockedCommandApi,
  getLogger: () => ({
    ...mockedCommandApi.getLogger(),
    fatal: fatalLogger,
  }),
};

const originalNodeEnv = process.env.NODE_ENV;

describe('commands/start', () => {
  beforeEach(() => {
    spawnEventHandlers = [];
    spawnFn.mockClear();
    fatalLogger.mockClear();
  });

  describe('in production', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      // $FlowIgnore startClient is mocked
      startClient.mockClear();
      // $FlowIgnore startServer is mocked
      startServer.mockClear();
      // $FlowIgnore compareVersions is mocked
      compareModuleVersions.mockClear();
    });

    afterAll(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should build client, server and spawn start-server without build', () => {
      const startServerPromise = new Promise(resolve => {
        // $FlowIgnore mocking implementation
        startServer.mockImplementationOnce((...args) => {
          resolve(args);
        });
      });
      startCommand(commandApi, [
        {
          dev: false,
          skipBuild: false,
          runTests: false,
          skipDepCheck: false,
          parent: {
            rawArgs: [],
          },
        },
      ]);

      expect(spawnFn.mock.calls[0][1][1]).toEqual('build');
      spawnEventHandlers.forEach(({ event, fn }) => {
        if (event === 'exit') {
          fn(0);
        }
      });
      // $FlowIgnore startClient is mocked
      expect(startClient.mock.calls.length).toBe(0);

      return startServerPromise.then(args => {
        expect(args.length).toBeGreaterThan(0);
        // $FlowIgnore compareModuleVersions is mocked
        expect(compareModuleVersions.mock.calls.length).toBe(1);
      });
    });

    it('should try to build client, server and handle rejection (non-zero code)', () => {
      const promise = new Promise(resolve => {
        fatalLogger.mockImplementationOnce(msg => {
          resolve(msg);
        });
      });
      // $FlowIgnore
      process.exit = jest.fn();
      startCommand(commandApi, [
        {
          dev: false,
          skipBuild: false,
          runTests: false,
          parent: {
            rawArgs: [],
          },
        },
      ]);

      spawnEventHandlers[0].fn(1);

      return promise.then(msg => {
        expect(msg.includes('Build have failed')).toBeTruthy();
      });
    });

    it('should try to test then start and handle rejection (error)', () => {
      const promise = new Promise(resolve => {
        fatalLogger.mockImplementationOnce(msg => {
          resolve(msg);
        });
      });
      process.env.NODE_ENV = originalNodeEnv;
      startCommand(commandApi, [
        {
          dev: false,
          skipBuild: false,
          runTests: true,
          parent: {
            rawArgs: ['-T'],
          },
        },
      ]);

      spawnEventHandlers[1].fn(new Error('test'));

      return promise.then(msg => {
        expect(msg.includes('Some tests have failed')).toBeTruthy();
      });
    });

    it('should not call compareModuleVersions', () => {
      const promise = new Promise(resolve => {
        // $FlowIgnore mocking implementation
        startServer.mockImplementationOnce((...args) => {
          resolve(args);
        });
      });
      process.env.NODE_ENV = originalNodeEnv;
      startCommand(commandApi, [
        {
          dev: false,
          skipBuild: false,
          runTests: false,
          skipDepCheck: true,
          parent: {
            rawArgs: ['--skip-dep-check'],
          },
        },
      ]);

      return promise.then(() => {
        // $FlowIgnore compareModuleVersions is mocked
        expect(compareModuleVersions.mock.calls.length).toBe(0);
      });
    });

    it('should spawn start-server without build if skipBuild is passed', () => {
      const startServerPromise = new Promise(resolve => {
        // $FlowIgnore mocking implementation
        startServer.mockImplementationOnce((...args) => {
          resolve(args);
        });
      });
      startCommand(commandApi, [
        {
          dev: false,
          skipBuild: true,
          runTests: false,
          parent: {
            rawArgs: ['--skip-build'],
          },
        },
      ]);
      // $FlowIgnore startClient is mocked
      expect(startClient.mock.calls.length).toBe(0);
      spawnEventHandlers.forEach(({ event, fn }) => {
        if (event === 'exit') {
          fn(0);
        }
      });
      return startServerPromise.then(args => {
        expect(args.length).toBeGreaterThan(0);
      });
    });
  });

  describe('in development', () => {
    it('should spawn start-client with build and spawn start-server with build', () => {
      const startClientPromise = new Promise(resolve => {
        // $FlowIgnore mocking implementation
        startClient.mockImplementationOnce((...args) => {
          resolve(args);
        });
      });
      const startServerPromise = new Promise(resolve => {
        // $FlowIgnore mocking implementation
        startServer.mockImplementationOnce((...args) => {
          resolve(args);
        });
      });
      startCommand(commandApi, [
        {
          dev: false,
          skipBuild: false,
          runTests: false,
          parent: {
            rawArgs: [],
          },
        },
      ]);
      return Promise.all([
        startClientPromise,
        startServerPromise,
      ]).then(args => {
        expect(args[0].length).toBeGreaterThan(0);
        expect(args[1].length).toBeGreaterThan(0);
      });
    });

    it('should spawn start-client with build, spawn start-server with build and run tests', () => {
      const startClientPromise = new Promise(resolve => {
        // $FlowIgnore mocking implementation
        startClient.mockImplementationOnce((...args) => {
          resolve(args);
        });
      });
      const startServerPromise = new Promise(resolve => {
        // $FlowIgnore mocking implementation
        startServer.mockImplementationOnce((...args) => {
          resolve(args);
        });
      });
      startCommand(commandApi, [
        {
          dev: false,
          skipBuild: false,
          runTests: true,
          parent: {
            rawArgs: ['-T'],
          },
        },
      ]);
      expect(spawnFn.mock.calls[0][1][1]).toEqual('test');
      spawnEventHandlers[0].fn(0);
      return Promise.all([
        startClientPromise,
        startServerPromise,
      ]).then(args => {
        expect(args[0].length).toBeGreaterThan(0);
        expect(args[1].length).toBeGreaterThan(0);
      });
    });
  });
});
