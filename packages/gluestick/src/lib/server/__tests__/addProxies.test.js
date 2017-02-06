import addProxies from '../addProxies';

describe('lib/server/addProxies', () => {
  let mockApp;
  beforeEach(() => {
    mockApp = {
      use: jest.fn(),
    };
  });

  it('should add proxies to express app', () => {
    const proxies = [
      {
        path: '/api',
        destination: 'http://www.test.com/api',
        options: {
          test: 'yes',
        },
      },
      {
        path: '/api2',
        destination: 'http://www.test2.com/api',
        options: {
          test: 'yes',
        },
      },
    ];
    addProxies(mockApp, proxies);
    expect(mockApp.use.mock.calls).toHaveLength(2);
    expect(mockApp.use.mock.calls[0][0]).toEqual('/api');
    expect(mockApp.use.mock.calls[1][0]).toEqual('/api2');
  });

  it('should pass the correct proxy arguments when creating a proxy', () => {
    const mockExpressHttpProxy = jest.fn();
    const proxyConfig = {
      path: '/api',
      destination: 'http://www.test.com/api',
      options: {
        test: 'yes',
      },
    };
    addProxies(mockApp, [proxyConfig], mockExpressHttpProxy);
    expect(mockExpressHttpProxy).toHaveBeenCalledTimes(1);
    expect(mockExpressHttpProxy.mock.calls[0][0].test).toEqual(proxyConfig.options.test);
  });

  it('should use the default forwardPath option for you when creating the proxy', () => {
    const mockExpressHttpProxy = jest.fn();
    const proxyConfig = {
      path: '/api',
      destination: 'http://www.test.com/api',
      options: {
        test: 'yes',
      },
    };
    addProxies(mockApp, [proxyConfig], mockExpressHttpProxy);
    expect(mockExpressHttpProxy.mock.calls[0][0].pathRewrite).toEqual({ [`^${proxyConfig.path}`]: '' });
  });

  it('should allow you to override pathRewrite', () => {
    const mockExpressHttpProxy = jest.fn();
    const pathRewrite = { '^/api': '/API' };
    const proxyConfig = {
      path: '/api',
      destination: 'http://www.test.com/api',
      options: {
        test: 'yes',
        pathRewrite,
      },
    };
    addProxies(mockApp, [proxyConfig], mockExpressHttpProxy);
    expect(mockExpressHttpProxy.mock.calls[0][0].pathRewrite).toEqual(pathRewrite);
  });

  it('should allow you to supply a filter function', () => {
    const mockExpressHttpProxy = jest.fn();
    const proxyConfig = {
      filter: pathname => !!(pathname.match('/api') && !pathname.match('/api/foo')),
      path: '/api',
      destination: 'http://www.test.com/api',
    };
    addProxies(mockApp, [proxyConfig], mockExpressHttpProxy);
    expect(mockExpressHttpProxy.mock.calls[0][0]).toEqual(proxyConfig.filter);
  });

  it('should not add the filter if it is not a function', () => {
    const mockExpressHttpProxy = jest.fn();
    const proxyConfig = {
      filter: 'this is the wrong type for filter',
      path: '/api',
      destination: 'http://www.test.com/api',
    };
    addProxies(mockApp, [proxyConfig], mockExpressHttpProxy);
    expect(mockExpressHttpProxy.mock.calls[0][0]).not.toBeInstanceOf(Function);
    expect(mockExpressHttpProxy.mock.calls[0][0]).toBeInstanceOf(Object);
  });
});

