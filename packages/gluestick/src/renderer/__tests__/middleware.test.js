const React = require('react');
const middleware = require('../middleware');

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
const entries = {
  '/': {
    component: (class extends React.Component {
      render() {
        return <div>Index</div>;
      }
    }),
    reducers: null,
    routes: () => ({ path: 'hola' }),
  },
};
const entriesConfig = {
  '/': {
    component: 'component',
    reducers: 'reducers',
    routes: 'routes',
  },
};
const assets = {
  javascript: {
    main: 'main.js',
    vendor: 'vendor.js',
  },
  style: {
    vendor: 'vendor',
  },
};

describe('renderer/middleware', () => {
  it('should render output', () => {

  });

  it('should redirect', () => {

  });

  it('should render 404 error page', () => {

  });

  it('should render 500 error page', () => {

  });

  describe('in production', () => {
    it('should send cached output', () => {

    });

    it('should store output in cache', () => {

    });
  });
});
