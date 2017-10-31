/* @flow */
jest.mock('http-proxy-middleware', () => (...args) => args);
const setProxies = require('../setProxies');
const logger = require('../../../__tests__/mocks/context').logger;

test('renderer/setProxies should set proxies from config', () => {
  const app = {
    middlewares: [],
    use(...middleware) {
      this.middlewares.push(middleware);
    },
  };
  const filter = v => v;
  const proxyConfig = [
    {
      path: 'path0',
      destination: 'dest0',
    },
    {
      path: 'path1',
      destination: 'dest1',
      filter,
      options: {
        opt0: 'opt0',
      },
    },
  ];
  logger.error.mockClear();
  setProxies(app, proxyConfig, logger);
  expect(app.middlewares.length).toBe(2);
  expect(app.middlewares[0][0]).toEqual('path0');
  expect(app.middlewares[0][1][0].logLevel).toEqual('info');
  expect(app.middlewares[0][1][0].logProvider()).toEqual(logger);
  expect(app.middlewares[0][1][0].target).toEqual('dest0');
  expect(app.middlewares[0][1][0].pathRewrite).toEqual({
    '^path0': '',
  });
  const res = {
    code: 0,
    body: null,
    status(code) {
      this.code = code;
      return this;
    },
    send(body) {
      this.body = body;
    },
  };
  app.middlewares[0][1][0].onError('error', {}, res);
  expect(res.code).toBe(500);
  expect(res.body).toEqual('Proxy error');
  expect(app.middlewares[1][0]).toEqual('path1');
  expect(typeof app.middlewares[1][1][0]).toEqual('function');
  expect(app.middlewares[1][1][1].logLevel).toEqual('info');
  expect(app.middlewares[1][1][1].logProvider()).toEqual(logger);
  expect(app.middlewares[1][1][1].target).toEqual('dest1');
  expect(app.middlewares[1][1][1].pathRewrite).toEqual({
    '^path1': '',
  });
});
