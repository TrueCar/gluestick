/* @flow */
jest.mock('fs', () => ({
  readFile: (file, cb) => {
    cb(file === 'fail.html' ? new Error('test error') : null, new Buffer('This is a {{ test }}!'));
  },
}));
let runCallback = () => {};
let isWebpackConfigValid = false;
jest.setMock('webpack', (config) => {
  isWebpackConfigValid = !!config;
  return {
    run: jest.fn(cb => { runCallback = cb; }),
  };
});
let middlewares = [];
let listenCallback = () => {};
let engineHandler = () => {};
jest.setMock('express', () => ({
  engine: (ext, hdl) => { engineHandler = hdl; },
  set: () => {},
  use: (middleware) => middlewares.push(middleware),
  listen: (port, host, cb) => { listenCallback = cb; },
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
    waitUntilValid: (cb) => { waitUntilValidCallback = cb; },
  };
});
jest.setMock('webpack-hot-middleware', () => (compiler) => {
  if (!compiler) {
    throw new Error('compiler not defined');
  }
});
let proxyOnErrorCallback = () => {};
jest.setMock('http-proxy-middleware', (opts) => {
  proxyOnErrorCallback = opts.onError;
});

const context = require('../../__tests__/mocks/context');
const startClientCommand = require('../start-client');

describe('commands/start-client', () => {
  beforeEach(() => {
    middlewares = [];
    runCallback = () => {};
    isWebpackConfigValid = false;
    listenCallback = () => {};
    context.logger.success.mockClear();
    context.logger.error.mockClear();
    waitUntilValidCallback = () => {};
    proxyOnErrorCallback = () => {};
  });

  it('should respond with compilated template using render engine', () => {
    startClientCommand(context);
    return Promise.all([
      new Promise((resolve) => {
        engineHandler('test.html', { test: 'test' }, (error, data) => {
          expect(error).toBeNull();
          expect(data).toEqual('This is a test!');
          resolve();
        });
      }),
      new Promise((resolve) => {
        engineHandler('fail.html', { test: 'test' }, (error) => {
          expect(error).toEqual(new Error('test error'));
          resolve();
        });
      }),
    ]);
  });

  it('should throw excpetion if webpack config is not specified', () => {
    expect(() => {
      // $FlowIgnore context should be invalid
      startClientCommand({ config: {} });
    }).toThrowError('Webpack config not specified');
  });

  it('should throw excpetion if gluestick config is not specified', () => {
    expect(() => {
       // $FlowIgnore context should be invalid
      startClientCommand({ config: { webpackConfig: true } });
    }).toThrowError('Gluestick config not specified');
  });

  it('should build client bundle in production', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    process.send = jest.fn();
    startClientCommand(context);
    expect(isWebpackConfigValid).toBeTruthy();
    runCallback(null);
    expect(context.logger.success.mock.calls[0]).toEqual(['Client bundle successfully built.']);
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should throw compilation error in production', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    startClientCommand(context);
    expect(isWebpackConfigValid).toBeTruthy();
    expect(() => {
      runCallback('test error');
    }).toThrowError('test error');
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should start express with webpack dev and hot middlewares', () => {
    startClientCommand(context);
    waitUntilValidCallback();
    expect(middlewares.length).toBe(3);
    const res = { render: jest.fn() };
    proxyOnErrorCallback(null, {}, res);
    expect(res.render.mock.calls[0][0].includes('poll.html')).toBeTruthy();
    expect(res.render.mock.calls[0][1]).toEqual({ port: context.config.GSConfig.ports.server });
    listenCallback('');
    expect(context.logger.success.mock.calls[0][0].includes('Client server running on'))
      .toBeTruthy();
  });

  it('should throw error if express fails to listen for requests', () => {
    startClientCommand(context);
    listenCallback('test error');
  });
});
