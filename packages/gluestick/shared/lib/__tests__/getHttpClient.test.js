import getHttpClient from '../getHttpClient';

describe('lib/getHttpClient', () => {
  let axiosMock;
  let defaultHeaders;

  beforeEach(() => {
    function getInstance() {
      const i = {
        interceptors: {
          response: {
            use: middleware => {
              i.interceptors.response.middleware.push(middleware);
            },
            middleware: [],
          },
          request: {
            use: middleware => {
              i.interceptors.request.middleware.push(middleware);
            },
            middleware: [],
          },
        },
        config: {
          headers: {},
        },
        get: fakeResponse => {
          return {
            request: i.interceptors.request.middleware.map(m => m(i.config)),
            response: i.interceptors.response.middleware.map(m =>
              m(fakeResponse),
            ),
          };
        },
        defaults: {
          headers: {
            cookie: '',
          },
        },
      };

      return i;
    }

    const create = jest.fn(() => getInstance());

    defaultHeaders = {
      common: {
        Authorization: 'TEST_AUTH_TOKEN',
      },
      post: {
        'Content-Type': 'TEST_CONTENT_TYPE',
      },
    };

    axiosMock = {
      create,
      defaults: {
        headers: { ...defaultHeaders },
      },
    };
  });

  it('should include default headers if not explicitly passed in params', () => {
    const options = {
      rewriteRequest: [() => {}],
      modifyInstance: c => c,
      abc: 123,
    };
    getHttpClient(options, undefined, undefined, axiosMock);
    const { modifyInstance, ...expectedResult } = options;
    expectedResult.headers = defaultHeaders;
    expect(axiosMock.create.mock.calls[0][0]).toEqual(expectedResult);
  });

  it('should call create with passed params (including merged headers) and without modifyInstance', () => {
    const options = {
      headers: {
        'X-Todd': 'Hi',
        test: 'best',
      },
      rewriteRequest: [() => {}],
      modifyInstance: c => c,
      abc: 123,
    };
    getHttpClient(options, undefined, undefined, axiosMock);
    const { modifyInstance, ...expectedResult } = options;
    expectedResult.headers = { ...expectedResult.headers, ...defaultHeaders };
    expect(axiosMock.create.mock.calls[0][0]).toEqual(expectedResult);
  });

  it('should merge request headers if request object is passed', () => {
    const options = {
      headers: {
        'X-Todd': 'Hi',
        test: 'best',
      },
      test2: 'hi',
    };
    const req = {
      headers: {
        cookie: 'name=Lincoln',
        host: 'hola.com:332211',
      },
    };
    getHttpClient(options, req, {}, axiosMock);
    expect(axiosMock.create).not.toBeCalledWith(options);

    const { headers, ...config } = options;
    expect(axiosMock.create.mock.calls[0][0]).toEqual({
      baseURL: `http://${req.headers.host}`,
      headers: {
        ...req.headers,
        ...headers,
      },
      ...config,
    });
  });

  it('should set baseURL with https if req.secure is true', () => {
    const req = {
      headers: {
        cookie: 'name=Lincoln',
        host: 'hola.com:332211',
      },
      secure: true,
    };
    getHttpClient({}, req, {}, axiosMock);
    expect(axiosMock.create.mock.calls[0][0].baseURL).toEqual(
      `https://${req.headers.host}`,
    );
  });

  it('should set baseURL with http if req.secure is false', () => {
    const req = {
      headers: {
        cookie: 'name=Lincoln',
        host: 'hola.com:332211',
      },
      secure: false,
    };
    getHttpClient({}, req, {}, axiosMock);
    expect(axiosMock.create.mock.calls[0][0].baseURL).toEqual(
      `http://${req.headers.host}`,
    );
  });

  it('should forward along cookies back to the browser', () => {
    const req = {
      headers: {
        cookie: 'name=Lincoln',
        host: 'hola.com:332211',
      },
      secure: false,
    };

    const mockServerResponse = {
      removeHeader: jest.fn(),
      cookie: jest.fn(),
      append: jest.fn(),
    };

    const client = getHttpClient({}, req, mockServerResponse, axiosMock);
    client.get({
      headers: {
        'set-cookie': ['oh=hai'],
      },
    });

    expect(mockServerResponse.append.mock.calls[0]).toEqual([
      'Set-Cookie',
      'oh=hai',
    ]);
  });

  it('should send received cookies in subsequent requests with the same instance', () => {
    const req = {
      headers: {
        cookie: 'name=Lincoln',
        host: 'hola.com:332211',
      },
      secure: false,
    };

    const mockServerResponse = {
      removeHeader: jest.fn(),
      cookie: jest.fn(),
      append: jest.fn(),
      headers: {
        'set-cookie': ['_some_cookie=abc', 'another_cookie=something'],
      },
    };

    const client = getHttpClient({}, req, mockServerResponse, axiosMock);
    client.get({
      headers: {
        'set-cookie': ['_some_cookie=abc', 'another_cookie=something'],
      },
    });
    const { request } = client.get({
      headers: {},
    });

    expect(request[0].headers.cookie).toEqual(
      'name=Lincoln; _some_cookie=abc; another_cookie=something',
    );
  });

  it('should not send received cookies in subsequent requests with a new instance', () => {
    const req = {
      headers: {
        cookie: 'name=Lincoln',
        host: 'hola.com:332211',
      },
      secure: false,
    };

    const mockServerResponse = {
      removeHeader: jest.fn(),
      cookie: jest.fn(),
      append: jest.fn(),
      headers: {
        'set-cookie': ['_some_cookie=abc', 'another_cookie=something'],
      },
    };

    const client = getHttpClient({}, req, mockServerResponse, axiosMock);
    client.get({
      headers: {
        'set-cookie': ['_some_cookie=abc', 'another_cookie=something'],
      },
    });

    const newClient = getHttpClient({}, req, mockServerResponse, axiosMock);
    const { request } = newClient.get({
      headers: {},
    });

    expect(request[0].headers.cookie).toEqual('name=Lincoln');
  });

  it('should allow you to modify the axios instance with `modifyInstance`', () => {
    const calledInsideModify = jest.fn();
    const options = {
      modifyInstance: client => {
        calledInsideModify();
        return {
          ...client,
          modifiedClient: true,
        };
      },
    };
    const req = {
      headers: {
        host: 'hola.com:332211',
      },
      secure: false,
    };
    const client = getHttpClient(options, req);
    expect(calledInsideModify.mock.calls.length).toBe(1);
    expect(client.modifiedClient).toEqual(true);
  });

  it('should merge headers from 3 sources when in the browser', done => {
    // Mock axios by specifying an adapter:
    // https://github.com/mzabriskie/axios/blob/v0.12.0/lib/core/dispatchRequest.js#L17
    // Would like to use github.com/mzabriskie/moxios
    // but it did not work with axios 0.12.0 in gluestick-shared.
    function mockSuccessAdapter(config) {
      const response = {
        config,
        data: null,
        headers: {},
        request: null,
        status: 200,
        statusText: '',
      };
      return Promise.resolve(response);
    }
    function modifyInstance(client) {
      client.interceptors.request.use(config => ({
        ...config,
        headers: {
          ...config.headers,
          header3: 'from modifyInstance',
        },
      }));
      return client;
    }
    const optionsForGetHttpClient = {
      adapter: mockSuccessAdapter,
      headers: {
        header1: 'from optionsForGetHttpClient',
      },
      modifyInstance,
    };
    const optionsForGet = {
      headers: {
        header2: 'from optionsForGet',
      },
    };
    const client = getHttpClient(optionsForGetHttpClient);
    client.get('/test/url', optionsForGet).then(response => {
      const { headers } = response.config;
      expect(headers.header1).toEqual('from optionsForGetHttpClient');
      expect(headers.header2).toEqual('from optionsForGet');
      expect(headers.header3).toEqual('from modifyInstance');
      done();
    });
  });

  it('should merge headers from 4 sources when on the server', done => {
    // Mock axios by specifying an adapter:
    // https://github.com/mzabriskie/axios/blob/v0.12.0/lib/core/dispatchRequest.js#L17
    // Would like to use github.com/mzabriskie/moxios
    // but it did not work with axios 0.12.0 in gluestick-shared.
    function mockSuccessAdapter(config) {
      const response = {
        config,
        data: null,
        headers: {},
        request: null,
        status: 200,
        statusText: '',
      };
      return Promise.resolve(response);
    }
    function modifyInstance(client) {
      client.interceptors.request.use(config => ({
        ...config,
        headers: {
          ...config.headers,
          header4: 'from modifyInstance',
        },
      }));
      return client;
    }
    const optionsForGetHttpClient = {
      adapter: mockSuccessAdapter,
      headers: {
        header2: 'from optionsForGetHttpClient',
      },
      modifyInstance,
    };
    const req = {
      headers: {
        header1: 'from req',
      },
    };
    const mockServerResponse = {
      removeHeader: jest.fn(),
      cookie: jest.fn(),
      append: jest.fn(),
    };
    const optionsForGet = {
      headers: {
        header3: 'from optionsForGet',
      },
    };
    const client = getHttpClient(
      optionsForGetHttpClient,
      req,
      mockServerResponse,
    );
    client.get('/test/url', optionsForGet).then(response => {
      const { headers } = response.config;
      expect(headers.header1).toEqual('from req');
      expect(headers.header2).toEqual('from optionsForGetHttpClient');
      expect(headers.header3).toEqual('from optionsForGet');
      expect(headers.header4).toEqual('from modifyInstance');
      done();
    });
  });
});
