const matchRoute = require('../matchRoute');
const { Route, Redirect } = require('react-router');
const React = require('react');

const context = {};
const request = {
  url: '/abc123',
  headers: {
    host: 'localhost',
  },
};
const getRoutes = jest.fn().mockImplementation(() =>
  <Route>
    <Route name="test1" path="abc123" />
    <Route name="test2" path="321xyz" />
    <Redirect name="test3" from="a" to="b" />
  </Route>,
);
const store = {
  getState: jest.fn(),
  dispatch: jest.fn(),
};
const httpClient = {};

describe('renerer/helpers/matchRoute', () => {
  describe('when a matching route (not a redirect) exists', () => {
    it('should return the renderProps', done => {
      matchRoute(
        context,
        request,
        getRoutes,
        store,
        httpClient,
      ).then(({ redirectLocation, renderProps }) => {
        expect(redirectLocation).toBeNull();
        expect(renderProps).toBeDefined();
        done();
      });
    });
  });

  describe('when a matching redirect exists', () => {
    it('should return the redirectLocation', done => {
      matchRoute(
        context,
        {
          url: '/a',
          headers: {
            host: 'localhost',
          },
        },
        getRoutes,
        store,
        httpClient,
      ).then(({ redirectLocation, renderProps }) => {
        expect(redirectLocation).not.toBeNull();
        expect(redirectLocation.pathname).toEqual('/b');
        expect(renderProps).toBeUndefined();
        done();
      });
    });
  });

  describe('when no matching route exists', () => {
    it('should forward to the promise `catch` with an error', done => {
      matchRoute(
        context,
        {
          url: 'zzzz',
          headers: {
            host: 'localhost',
          },
        },
        getRoutes,
        store,
        httpClient,
      ).then(({ redirectLocation, renderProps }) => {
        expect(redirectLocation).toBeUndefined();
        expect(renderProps).toBeUndefined();
        done();
      });
    });
  });
});
