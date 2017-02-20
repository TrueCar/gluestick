/* eslint-disable react/no-multi-comp */
jest.mock('gluestick-shared', () => ({
  getHttpClient: jest.fn(),
  createStore: jest.fn(() => ({})),
  prepareRoutesWithTransitionHooks: jest.fn(val => val),
}));
jest.mock('../helpers/matchRoute.js', () => jest.fn(
  (ctx, req, routes) => ({
    redirectLocation: routes().mockBehaviour.redirect ? {
      pathname: 'pathname', search: 'search',
    } : null,
    renderProps: routes().mockBehaviour.renderProps,
  }),
));
jest.mock('../helpers/errorHandler.js', () => jest.fn());
jest.mock('../render.js', () => jest.fn(() => ({
  responseString: 'output',
})));
jest.mock('../helpers/cacheManager.js', () => jest.fn(() => ({
  getCachedIfProd: jest.fn((req) => req.url === '/cached' ? 'cached' : null),
})));
const React = require('react');
const middleware = require('../middleware');
const errorHandler = require('../helpers/errorHandler');

const context = {
  config: {},
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    success: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
};
const request = {
  hostname: 'localhost',
  url: '/',
};
const response = {
  send: jest.fn(),
  set: jest.fn(),
  status: jest.fn(),
  sendStatus: jest.fn(),
  redirect: jest.fn(),
};
const getEntries = (routes) => ({
  '/': {
    component: (class extends React.Component {
      render() {
        return <div>Index</div>;
      }
    }),
    reducers: null,
    routes: () => routes,
  },
});
const entriesConfig = {
  '/': {
    component: 'component',
    reducers: 'reducers',
    routes: 'routes',
  },
};
const assets = {};
const EntryWrapper = {};
const BodyWrapper = {};

describe('renderer/middleware', () => {
  beforeEach(() => {
    response.send.mockReset();
  });

  it('should render output', async () => {
    const entries = getEntries({
      mockBehaviour: {
        renderProps: {
          routes: [{}],
        },
      },
    });
    await middleware(
      context,
      request,
      response,
      { entries, entriesConfig },
      { EntryWrapper, BodyWrapper },
      assets,
    );
    expect(response.send.mock.calls[0]).toEqual(['output']);
  });

  it('should redirect', async () => {
    const entries = getEntries({
      mockBehaviour: {
        redirect: true,
      },
    });
    await middleware(
      context,
      request,
      response,
      { entries, entriesConfig },
      { EntryWrapper, BodyWrapper },
      assets,
    );
    expect(response.redirect.mock.calls[0]).toEqual([301, 'pathnamesearch']);
  });

  it('should send 404 status', async () => {
    const entries = getEntries({
      mockBehaviour: {
        renderProps: null,
      },
    });
    await middleware(
      context,
      request,
      response,
      { entries, entriesConfig },
      { EntryWrapper, BodyWrapper },
      assets,
    );
    expect(response.sendStatus.mock.calls[0]).toEqual([404]);
  });

  it('should call errorHandler', async () => {
    const entries = {};
    await middleware(
      context,
      request,
      response,
      { entries, entriesConfig },
      { EntryWrapper, BodyWrapper },
      assets,
    );
    expect(errorHandler.mock.calls.length).toBe(1);
  });

  describe('in production', () => {
    it('should send cached output', async () => {
      const entries = getEntries({
        mockBehaviour: {
          renderProps: {
            routes: [{}],
          },
        },
      });
      await middleware(
        context,
        Object.assign(request, { url: '/cached' }),
        response,
        { entries, entriesConfig },
        { EntryWrapper, BodyWrapper },
        assets,
      );
      expect(response.send.mock.calls[0]).toEqual(['cached']);
    });
  });
});
