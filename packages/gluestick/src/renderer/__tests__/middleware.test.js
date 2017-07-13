/* @flow */

import type {
  Context,
  Request,
  Response,
  BaseLogger,
  EntriesConfig,
  Entries,
  GSHooks,
} from '../../types';

const mocks = require('../../__tests__/mocks/context');

/* eslint-disable react/no-multi-comp */
jest.mock('../../../shared', () => ({
  getHttpClient: jest.fn(),
  createStore: jest.fn(() => ({})),
  prepareRoutesWithTransitionHooks: jest.fn(val => val),
  runBeforeRoutes: jest.fn(() => new Promise(r => r())),
}));
jest.mock('../helpers/matchRoute.js', () =>
  jest.fn((ctx, req, routes) => ({
    redirectLocation: routes().mockBehaviour.redirect
      ? {
          pathname: 'pathname',
          search: 'search',
        }
      : null,
    renderProps: routes().mockBehaviour.renderProps,
  })),
);
jest.mock('../helpers/errorHandler.js', () => jest.fn());
jest.mock('../render.js', () =>
  jest.fn(() => ({
    responseString: 'output',
  })),
);
jest.mock('../helpers/cacheManager.js', () =>
  jest.fn(() => ({
    getCachedIfProd: jest.fn(req => (req.url === '/cached' ? 'cached' : null)),
    enableComponentCaching: jest.fn(),
  })),
);
jest.mock('../response/getStatusCode.js', () => jest.fn(() => 200));
const React = require('react');
const middleware = require('../middleware');
const errorHandler = require('../helpers/errorHandler');
const hooksHelper = require('../helpers/hooks').call;

const logger: BaseLogger = {
  info: jest.fn(),
  debug: jest.fn(),
  success: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

const context: Context = {
  config: mocks.config,
  logger,
};

const request: Request = mocks.request;

const response: Response = {
  send: jest.fn(),
  set: jest.fn(),
  status: jest.fn(() => response),
  sendStatus: jest.fn(),
  redirect: jest.fn(),
  header: jest.fn(),
  json: jest.fn(),
};

const hooks: GSHooks = {
  preRenderFromCache: jest.fn(v => v),
  postRenderRequirements: jest.fn(v => v),
  preRedirect: jest.fn(v => v),
  postRenderProps: jest.fn(v => v),
  postGetCurrentRoute: jest.fn(v => v),
  postRender: jest.fn(v => v),
  error: jest.fn(v => v),
};

const options = {
  envVariables: [],
  httpClient: {},
  entryWrapperConfig: {},
  reduxMiddlewares: [],
  thunkMiddleware: null,
};

const getEntries = (routes): Entries => ({
  '/': {
    component: class extends React.Component {
      render() {
        return <div>Index</div>;
      }
    },
    reducers: {},
    routes: () => routes,
  },
});

const entriesConfig: EntriesConfig = mocks.entriesConfig;

const assets = {};
const loadjsConfig = {};
const EntryWrapper = {};
const BodyWrapper = {};
const entriesPlugins = [];

const clearHookMock = (key: string) => {
  if (hooks[key]) {
    if (!Array.isArray(hooks[key])) {
      hooks[key].mockClear();
    } else {
      hooks[key].forEach(v => v.mockClear());
    }
  }
};

const clearHooksMock = () => {
  Object.keys(hooks).map((key: string) => clearHookMock(key));
};

describe('renderer/middleware', () => {
  beforeEach(() => {
    response.send.mockReset();
    clearHooksMock();
  });

  it('should render output', async () => {
    const entries: Entries = getEntries({
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
      { entries, entriesConfig, entriesPlugins },
      { EntryWrapper, BodyWrapper },
      { assets, loadjsConfig },
      options,
      { hooks, hooksHelper },
      [],
      {},
    );
    expect(hooks.preRenderFromCache).toHaveBeenCalledTimes(0);
    expect(hooks.postRenderRequirements).toHaveBeenCalledTimes(1);
    expect(hooks.preRedirect).toHaveBeenCalledTimes(0);
    expect(hooks.postRenderProps).toHaveBeenCalledTimes(1);
    expect(hooks.postGetCurrentRoute).toHaveBeenCalledTimes(1);
    expect(hooks.postRender).toHaveBeenCalledTimes(1);
    expect(hooks.error).toHaveBeenCalledTimes(0);
    expect(response.status.mock.calls[0]).toEqual([200]);
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
      { entries, entriesConfig, entriesPlugins },
      { EntryWrapper, BodyWrapper },
      { assets, loadjsConfig },
      options,
      { hooks, hooksHelper },
    );
    expect(hooks.preRenderFromCache).toHaveBeenCalledTimes(0);
    expect(hooks.postRenderRequirements).toHaveBeenCalledTimes(1);
    expect(hooks.preRedirect).toHaveBeenCalledTimes(1);
    expect(hooks.postRenderProps).toHaveBeenCalledTimes(1);
    expect(hooks.postGetCurrentRoute).toHaveBeenCalledTimes(0);
    expect(hooks.postRender).toHaveBeenCalledTimes(0);
    expect(hooks.error).toHaveBeenCalledTimes(0);
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
      { entries, entriesConfig, entriesPlugins },
      { EntryWrapper, BodyWrapper },
      { assets, loadjsConfig },
      options,
      { hooks, hooksHelper },
    );
    expect(hooks.preRenderFromCache).toHaveBeenCalledTimes(0);
    expect(hooks.postRenderRequirements).toHaveBeenCalledTimes(1);
    expect(hooks.preRedirect).toHaveBeenCalledTimes(0);
    expect(hooks.postRenderProps).toHaveBeenCalledTimes(1);
    expect(hooks.postGetCurrentRoute).toHaveBeenCalledTimes(0);
    expect(hooks.postRender).toHaveBeenCalledTimes(0);
    expect(hooks.error).toHaveBeenCalledTimes(0);
    expect(response.sendStatus.mock.calls[0]).toEqual([404]);
  });

  it('should call errorHandler', async () => {
    const entries = {};
    await middleware(
      context,
      request,
      response,
      { entries, entriesConfig, entriesPlugins },
      { EntryWrapper, BodyWrapper },
      { assets, loadjsConfig },
      options,
      { hooks, hooksHelper },
    );
    expect(hooks.error).toHaveBeenCalledTimes(1);
    expect(errorHandler).toHaveBeenCalledTimes(1);
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
        { entries, entriesConfig, entriesPlugins },
        { EntryWrapper, BodyWrapper },
        { assets, loadjsConfig },
        options,
        { hooks, hooksHelper },
      );
      expect(hooks.preRenderFromCache).toHaveBeenCalledTimes(1);
      expect(hooks.postRenderRequirements).toHaveBeenCalledTimes(0);
      expect(hooks.preRedirect).toHaveBeenCalledTimes(0);
      expect(hooks.postRenderProps).toHaveBeenCalledTimes(0);
      expect(hooks.postGetCurrentRoute).toHaveBeenCalledTimes(0);
      expect(hooks.postRender).toHaveBeenCalledTimes(0);
      expect(hooks.error).toHaveBeenCalledTimes(0);
      expect(response.status.mock.calls[0]).toEqual([200]);
      expect(response.send.mock.calls[0]).toEqual(['cached']);
    });
  });
});
