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
  const context = {};
  const request = { headers: { 'user-agent': 'Moznota Browser 1.0' } };
  const store = {
    getState: jest.fn(() => {}),
  };
  const getRoutes = () => [
    { path: 'hola' },
  ];
  const renderProps = {
    routes: getRoutes(),
  };
  const currentRoute = {};
  const httpClient = {};
  const entryWrapperConfig = {};
  const envVariables = [];
  const assets = {};
  const cacheManager = { setCacheIfProd: jest.fn() };

  describe('without a custom render method', () => {
    describe('when the route is an email route', () => {
      it('should render output', async () => {
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
      });
    });

    describe('when the route is not an email route', () => {
      it('should render output', async () => {
        const results = await render(
          context,
          request,
          { EntryPoint: Index, entryName: 'main', store, routes: getRoutes, httpClient },
          { renderProps, currentRoute },
          { EntryWrapper, BodyWrapper, entryWrapperConfig, envVariables },
          { assets, cacheManager },
          {},
        );
        expect(results.responseString).toBeDefined();
        expect(results.rootElement.props.head).not.toBeNull();
        expect(results.rootElement.props.body.props.html).toContain('data-reactid');
      });
    });
  });

  describe('with a custom render method', () => {
    const renderMethod = (component, styleTags) => {
      expect(component).toBeDefined();
      expect(styleTags).toBeDefined();
      return {
        head: (<meta name="hi" />),
        body: '<div>That body!</div>',
      };
    };

    describe('when the route is an email route', () => {
      it('should render output', async () => {
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
      });
    });

    describe('when the route is not an email route', () => {
      it('should render output', async () => {
        const results = await render(
          context,
          request,
          { EntryPoint: Index, entryName: 'main', store, routes: getRoutes, httpClient },
          { renderProps, currentRoute },
          { EntryWrapper, BodyWrapper, entryWrapperConfig, envVariables },
          { assets, cacheManager },
          { renderMethod },
        );
        expect(results.responseString).toBeDefined();
        expect(results.rootElement.props.head).not.toBeNull();
      });
    });
  });
});
