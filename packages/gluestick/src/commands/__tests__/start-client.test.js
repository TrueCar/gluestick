/* @flow */

jest.mock('fs', () => ({
  readFile: (file, cb) => {
    cb(
      file === 'fail.html' ? new Error('test error') : null,
      new Buffer('This is a {{ test }}!'),
    );
  },
}));

jest.setMock('webpack', () => {
  return {
    plugin: jest.fn(),
    run: jest.fn(),
  };
});

jest.mock('../build');
const build = require('../build');

let middlewares = [];
let listenCallback = () => {};
let engineHandler = () => {};
jest.setMock('express', () => ({
  engine: (ext, hdl) => {
    engineHandler = hdl;
  },
  set: () => {},
  use: middleware => middlewares.push(middleware),
  listen: (port, host, cb) => {
    listenCallback = cb;
  },
}));

let waitUntilValidCallback = () => {};
jest.mock('webpack-dev-middleware', () => (compiler, settings) => {
  if (!compiler) {
    throw new Error('compiler not defined');
  }
  if (!settings) {
    throw new Error('settings not defined');
  }
  return {
    waitUntilValid: cb => {
      waitUntilValidCallback = cb;
    },
  };
});

jest.setMock('webpack-hot-middleware', () => compiler => {
  if (!compiler) {
    throw new Error('compiler not defined');
  }
});

let proxyOnErrorCallback = () => {};
jest.setMock('http-proxy-middleware', opts => {
  proxyOnErrorCallback = opts.onError;
});

const mockedCommandApi = require('../../__tests__/mocks/context').commandApi;
const startClientCommand = require('../start-client');

const successLogger = jest.fn();
const errorLogger = jest.fn();
const commandApi = {
  ...mockedCommandApi,
  getLogger: () => ({
    ...mockedCommandApi.getLogger(),
    success: successLogger,
    error: errorLogger,
  }),
};

describe('commands/start-client', () => {
  beforeEach(() => {
    middlewares = [];
    listenCallback = () => {};
    successLogger.mockClear();
    errorLogger.mockClear();
    waitUntilValidCallback = () => {};
    proxyOnErrorCallback = () => {};
    build.mockClear();
  });

  it('should respond with compilated template using render engine', () => {
    startClientCommand(commandApi, [{}]);
    return Promise.all([
      new Promise(resolve => {
        engineHandler('test.html', { test: 'test' }, (error, data) => {
          expect(error).toBeNull();
          expect(data).toEqual('This is a test!');
          resolve();
        });
      }),
      new Promise(resolve => {
        engineHandler('fail.html', { test: 'test' }, error => {
          expect(error).toEqual(new Error('test error'));
          resolve();
        });
      }),
    ]);
  });

  it('should build client bundle in production', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    process.send = jest.fn();
    startClientCommand(commandApi, [{}]);
    expect(build).toHaveBeenCalled();
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should start express with webpack dev and hot middlewares', () => {
    startClientCommand(commandApi, [{}]);
    waitUntilValidCallback();
    expect(middlewares.length).toBe(3);
    const res = { render: jest.fn() };
    proxyOnErrorCallback(null, {}, res);
    expect(res.render.mock.calls[0][0].includes('poll.html')).toBeTruthy();
    expect(res.render.mock.calls[0][1]).toEqual({
      port: commandApi.getContextConfig().GSConfig.ports.server,
    });
    listenCallback('');
    expect(
      successLogger.mock.calls[0][0].includes('Client server running on'),
    ).toBeTruthy();
  });

  it('should throw error if express fails to listen for requests', () => {
    startClientCommand(commandApi, [{}]);
    listenCallback('test error');
  });
});
