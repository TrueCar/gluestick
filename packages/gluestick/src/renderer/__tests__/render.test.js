/* @flow */

import type {
  BaseLogger,
  Config,
  Context,
  Request,
  GSConfig,
  UniversalSettings,
  WebpackConfig,
  CompiledConfig,
  RenderMethod,
} from '../../types';

jest.mock('../helpers/linkAssets.js', () => () => ({
  scriptTags: [],
  styleTags: [],
}));

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
    return <div>EntryWrapper</div>;
  }
}
// eslint-disable-next-line react/no-multi-comp
class BodyWrapper extends React.Component {
  render() {
    return <div>BodyWrapper</div>;
  }
}

describe('renderer/render', () => {
  const logger: BaseLogger = {
    success: () => {},
    info: () => {},
    warn: () => {},
    debug: () => {},
    error: () => {},
  };

  const gsConfig: GSConfig = require('../../__tests__/mocks/context').config
    .GSConfig;

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

  const entriesPlugins: Object[] = [];

  const context: Context = { config, logger };

  const request: Request = {
    headers: { 'user-agent': 'Moznota Browser 1.0' },
    url: '',
    hostname: '',
    method: 'GET',
  };

  const store = {
    getState: jest.fn(() => {}),
  };
  const getRoutes = () => [{ path: 'hola' }];
  const renderProps = {
    routes: getRoutes(),
  };

  const renderResult = async (
    email: boolean,
    cache: boolean,
    renderMethod,
  ): Object => {
    const currentRoute = clone(renderProps);
    currentRoute.email = email;
    currentRoute.cache = cache;
    const results = await render(
      context,
      request,
      {
        EntryPoint: Index,
        entryName: 'main',
        store,
        routes: getRoutes,
        httpClient,
      },
      { renderProps, currentRoute },
      {
        EntryWrapper,
        BodyWrapper,
        entryWrapperConfig,
        envVariables,
        entriesPlugins,
      },
      { assets, loadjsConfig, cacheManager },
      { renderMethod },
    );
    return results;
  };

  const checkTest = async (email, cache, renderMethod) => {
    cacheManager.setCacheIfProd.mockReset();
    const results = await renderResult(email, cache, renderMethod);
    if (email) {
      expect(results.rootElement.props.head).toBeNull();
      expect(results.rootElement.props.body.props.html).not.toContain(
        'data-reactid',
      );
      expect(results.rootElement.props.body.props.html).toBeDefined();
    } else {
      expect(results.rootElement.props.head).not.toBeNull();
      if (!renderMethod) {
        expect(results.rootElement.props.body.props.html).toContain(
          'data-reactid',
        );
      }
    }
    if (cache) {
      expect(cacheManager.setCacheIfProd.mock.calls.length).toBe(1);
    } else {
      expect(cacheManager.setCacheIfProd.mock.calls.length).toBe(0);
    }
    expect(results.responseString).toBeDefined();
  };

  const httpClient = {};
  const entryWrapperConfig = {};
  const envVariables = [];
  const assets = {};
  const loadjsConfig = {};
  const cacheManager = { setCacheIfProd: jest.fn() };

  describe('without a custom render method and cache set to true', () => {
    describe('when the route is an email route', () => {
      it('should render output', async () => {
        await checkTest(true, true);
      });
    });

    describe('when the route is not an email route', () => {
      it('should render output', async () => {
        await checkTest(false, true);
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

    it('should prepare plugins and pass it to EntryWrapper', () => {
      const entriesRuntimePlugins = [
        { plugin: v => v, meta: { wrapper: true } },
        { plugin: () => {}, meta: {} },
      ];
      // eslint-disable-next-line react/no-multi-comp
      class MockEntryWrapper extends React.Component {
        static plugins = [];
        constructor(props) {
          super(props);
          MockEntryWrapper.plugins = props.rootWrappers;
        }
        render() {
          return null;
        }
      }
      const currentRoute = clone(renderProps);
      currentRoute.email = false;
      currentRoute.cache = false;
      render(
        context,
        request,
        {
          EntryPoint: Index,
          entryName: 'main',
          store,
          routes: getRoutes,
          httpClient,
        },
        { renderProps, currentRoute },
        {
          EntryWrapper: MockEntryWrapper,
          BodyWrapper,
          entryWrapperConfig,
          envVariables,
          entriesPlugins: entriesRuntimePlugins,
        },
        { assets, loadjsConfig, cacheManager },
        {},
      );
      expect(MockEntryWrapper.plugins).toEqual([
        entriesRuntimePlugins[0].plugin,
      ]);
    });

    describe('when the route is an email route', () => {
      it('should render output', async () => {
        await checkTest(true, true, renderMethod);
      });
    });

    describe('when the route is not an email route', () => {
      it('should render output', async () => {
        await checkTest(false, true, renderMethod);
      });
    });
  });

  describe('without a custom render method and cache set to false', () => {
    describe('when the route is an email route', () => {
      it('should render output', async () => {
        await checkTest(true, false);
      });
    });

    describe('when the route is not an email route', () => {
      it('should render output', async () => {
        await checkTest(false, false);
      });
    });
  });

  describe('with a custom render method and cache set to false', () => {
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
        await checkTest(true, false, renderMethod);
      });
    });

    describe('when the route is not an email route', () => {
      it('should render output', async () => {
        await checkTest(false, false, renderMethod);
      });
    });
  });
});
