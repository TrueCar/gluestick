/* @flow */

import type {
  Logger,
  Config,
  Context,
  Request,
  GSConfig,
  UniversalSettings,
  WebpackConfig,
  CompiledConfig,
} from '../../types';

type RenderMethod = (root: Object, styleTags: Object[]) => { body: string; head: Object[] };

const React = require('react');
const clone = require('clone');
const render = require('../render');

class Index extends React.Component {
  render() {
    return <div>Index</div>;
  }
}
// eslint-disable-next-line react/no-multi-comp
class EntryWrapper extends React.Component {
  render() {
    return (
      <div>EntryWrapper</div>
    );
  }
}
// eslint-disable-next-line react/no-multi-comp
class BodyWrapper extends React.Component {
  render() {
    return (
      <div>BodyWrapper</div>
    );
  }
}

describe('renderer/render', () => {
  const logger: Logger = {
    success: () => {},
    info: () => {},
    warn: () => {},
    debug: () => {},
    error: () => {},
  };

  const gsConfig: GSConfig = {
    protocol: '',
    host: '',
    ports: {
      client: 0,
      server: 0,
    },
    buildAssetsPath: '',
    assetsPath: '',
    sourcePath: '',
    sharedPath: '',
    appsPath: '',
    configPath: '',
    entryWrapperPath: '',
    clientEntryInitPath: '',
    serverEntriesPath: '',
    entriesPath: '',
    webpackChunks: '',
    proxyLogLevel: '',
    debugWatchDirectories: [],
    defaultErrorTemplatePath: '',
    customErrorTemplatePath: '',
    autoUpgrade: {
      added: [],
      changed: [],
    },
  };

  const universalSettings: UniversalSettings = {
    server: {
      input: '',
      output: '',
    },
  };

  const client: WebpackConfig = {};
  const server: WebpackConfig = {};

  const webpackConfig: CompiledConfig = {
    universalSettings,
    client,
    server,
  };

  const config: Config = {
    GSConfig: gsConfig,
    webpackConfig,
    plugins: [],
  };

  const context: Context = { config, logger };

  const request: Request = { headers: { 'user-agent': 'Moznota Browser 1.0' }, url: '', hostname: '' };

  const store = {
    getState: jest.fn(() => {}),
  };
  const getRoutes = () => [
    { path: 'hola' },
  ];
  const renderProps = {
    routes: getRoutes(),
  };

  const httpClient = {};
  const entryWrapperConfig = {};
  const envVariables = [];
  const assets = {};
  const cacheManager = { setCacheIfProd: jest.fn() };

  describe('without a custom render method and cache set to true', () => {
    describe('when the route is an email route', () => {
      it('should render output', async () => {
        cacheManager.setCacheIfProd.mockReset();
        const currentRouteWithEmail = clone(renderProps);
        currentRouteWithEmail.email = true;
        currentRouteWithEmail.cache = true;
        const results = await render(
          context,
          request,
          { EntryPoint: Index, entryName: 'main', store, routes: getRoutes, httpClient },
          { renderProps, currentRoute: currentRouteWithEmail },
          { EntryWrapper, BodyWrapper, entryWrapperConfig, envVariables },
          { assets, cacheManager },
          {},
        );
        expect(results.responseString).toBeDefined();
        expect(results.rootElement.props.head).toBeNull();
        expect(results.rootElement.props.body.props.html).toBeDefined();
        expect(results.rootElement.props.body.props.html).not.toContain('data-reactid');
        expect(cacheManager.setCacheIfProd.mock.calls.length).toBe(1);
      });
    });

    describe('when the route is not an email route', () => {
      it('should render output', async () => {
        cacheManager.setCacheIfProd.mockReset();
        const currentRouteWithCache = clone(renderProps);
        currentRouteWithCache.cache = true;
        const results = await render(
          context,
          request,
          { EntryPoint: Index, entryName: 'main', store, routes: getRoutes, httpClient },
          { renderProps, currentRoute: currentRouteWithCache },
          { EntryWrapper, BodyWrapper, entryWrapperConfig, envVariables },
          { assets, cacheManager },
          {},
        );
        expect(results.responseString).toBeDefined();
        expect(results.rootElement.props.head).not.toBeNull();
        expect(results.rootElement.props.body.props.html).toContain('data-reactid');
        expect(cacheManager.setCacheIfProd.mock.calls.length).toBe(1);
      });
    });
  });

  describe('with a custom render method and cache set to true', () => {
    const renderMethod: RenderMethod = (component, styleTags) => {
      expect(component).toBeDefined();
      expect(styleTags).toBeDefined();
      return {
        head: [<meta name="hi" />],
        body: '<div>That body!</div>',
      };
    };

    describe('when the route is an email route', () => {
      it('should render output', async () => {
        cacheManager.setCacheIfProd.mockReset();
        const currentRouteWithEmail = clone(renderProps);
        currentRouteWithEmail.email = true;
        currentRouteWithEmail.cache = true;
        const results = await render(
          context,
          request,
          { EntryPoint: Index, entryName: 'main', store, routes: getRoutes, httpClient },
          { renderProps, currentRoute: currentRouteWithEmail },
          { EntryWrapper, BodyWrapper, entryWrapperConfig, envVariables },
          { assets, cacheManager },
          { renderMethod },
        );
        expect(results.responseString).toBeDefined();
        expect(results.rootElement.props.head).toBeNull();
        expect(results.rootElement.props.body.props.html).toBeDefined();
        expect(cacheManager.setCacheIfProd.mock.calls.length).toBe(1);
      });
    });

    describe('when the route is not an email route', () => {
      it('should render output', async () => {
        cacheManager.setCacheIfProd.mockReset();
        const currentRouteWithCache = clone(renderProps);
        currentRouteWithCache.cache = true;
        const results = await render(
          context,
          request,
          { EntryPoint: Index, entryName: 'main', store, routes: getRoutes, httpClient },
          { renderProps, currentRoute: currentRouteWithCache },
          { EntryWrapper, BodyWrapper, entryWrapperConfig, envVariables },
          { assets, cacheManager },
          { renderMethod },
        );
        expect(results.responseString).toBeDefined();
        expect(results.rootElement.props.head).not.toBeNull();
        expect(cacheManager.setCacheIfProd.mock.calls.length).toBe(1);
      });
    });
  });

  describe('without a custom render method and cache set to false', () => {
    describe('when the route is an email route', () => {
      it('should render output', async () => {
        cacheManager.setCacheIfProd.mockReset();
        const currentRouteWithEmail = clone(renderProps);
        currentRouteWithEmail.email = true;
        const results = await render(
          context,
          request,
          { EntryPoint: Index, entryName: 'main', store, routes: getRoutes, httpClient },
          { renderProps, currentRoute: currentRouteWithEmail },
          { EntryWrapper, BodyWrapper, entryWrapperConfig, envVariables },
          { assets, cacheManager },
          {},
        );
        expect(results.responseString).toBeDefined();
        expect(results.rootElement.props.head).toBeNull();
        expect(results.rootElement.props.body.props.html).toBeDefined();
        expect(results.rootElement.props.body.props.html).not.toContain('data-reactid');
        expect(cacheManager.setCacheIfProd.mock.calls.length).toBe(0);
      });
    });

    describe('when the route is not an email route', () => {
      it('should render output', async () => {
        cacheManager.setCacheIfProd.mockReset();
        const currentRouteWithoutCache = clone(renderProps);
        const results = await render(
          context,
          request,
          { EntryPoint: Index, entryName: 'main', store, routes: getRoutes, httpClient },
          { renderProps, currentRoute: currentRouteWithoutCache },
          { EntryWrapper, BodyWrapper, entryWrapperConfig, envVariables },
          { assets, cacheManager },
          {},
        );
        expect(results.responseString).toBeDefined();
        expect(results.rootElement.props.head).not.toBeNull();
        expect(results.rootElement.props.body.props.html).toContain('data-reactid');
        expect(cacheManager.setCacheIfProd.mock.calls.length).toBe(0);
      });
    });
  });

  describe('with a custom render method and cache set to false', () => {
    const renderMethod: RenderMethod = (component, styleTags) => {
      expect(component).toBeDefined();
      expect(styleTags).toBeDefined();
      return {
        head: [(<meta name="hi" />)],
        body: '<div>That body!</div>',
      };
    };

    describe('when the route is an email route', () => {
      it('should render output', async () => {
        cacheManager.setCacheIfProd.mockReset();
        const currentRouteWithEmail = clone(renderProps);
        currentRouteWithEmail.email = true;
        const results = await render(
          context,
          request,
          { EntryPoint: Index, entryName: 'main', store, routes: getRoutes, httpClient },
          { renderProps, currentRoute: currentRouteWithEmail },
          { EntryWrapper, BodyWrapper, entryWrapperConfig, envVariables },
          { assets, cacheManager },
          { renderMethod },
        );
        expect(results.responseString).toBeDefined();
        expect(results.rootElement.props.head).toBeNull();
        expect(results.rootElement.props.body.props.html).toBeDefined();
        expect(cacheManager.setCacheIfProd.mock.calls.length).toBe(0);
      });
    });

    describe('when the route is not an email route', () => {
      it('should render output', async () => {
        cacheManager.setCacheIfProd.mockReset();
        const currentRouteWithoutCache = clone(renderProps);
        const results = await render(
          context,
          request,
          { EntryPoint: Index, entryName: 'main', store, routes: getRoutes, httpClient },
          { renderProps, currentRoute: currentRouteWithoutCache },
          { EntryWrapper, BodyWrapper, entryWrapperConfig, envVariables },
          { assets, cacheManager },
          { renderMethod },
        );
        expect(results.responseString).toBeDefined();
        expect(results.rootElement.props.head).not.toBeNull();
        expect(cacheManager.setCacheIfProd.mock.calls.length).toBe(0);
      });
    });
  });
});
