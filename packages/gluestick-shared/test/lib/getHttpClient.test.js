import getHttpClient from "../../src/lib/getHttpClient";
import sinon from "sinon";
import { expect } from "chai";


describe("lib/getHttpClient", () => {
  let axiosMock, defaultHeaders;

  beforeEach(() => {
    function getInstance () {
      const i = {
        interceptors: {
          response: {
            use: (middleware) => {
              i.interceptors.response.middleware.push(middleware);
            },
            middleware: [],
          },
          request: {
            use: (middleware) => {
              i.interceptors.request.middleware.push(middleware);
            },
            middleware: [],
          }
        },
        config: {
          headers: {}
        },
        get: (fakeResponse) => {
          return {
            request: i.interceptors.request.middleware.map(m => m(i.config)),
            response: i.interceptors.response.middleware.map(m => m(fakeResponse))
          };
        },
        defaults: {
          headers: {
            cookie: ''
          }
        }
      };

      return i;
    }

    const create = sinon.stub().returns(getInstance());
    create.onCall(1).returns(getInstance());
    create.onCall(2).returns(getInstance());

    defaultHeaders = {
      common: {
        "Authorization": "TEST_AUTH_TOKEN"
      },
      post: {
        "Content-Type": "TEST_CONTENT_TYPE"
      }
    };

    axiosMock = {
      create: create,
      defaults: {
        headers: {...defaultHeaders}
      }
    };
  });

  it("should include default headers if not explicitly passed in params", () => {
    const options = {
      rewriteRequest: [() => {}],
      modifyInstance: c => c,
      abc: 123
    };
    const client = getHttpClient(options, undefined, undefined, axiosMock);
    const { modifyInstance, ...expectedResult } = options;
    expectedResult.headers = defaultHeaders;
    expect(axiosMock.create.lastCall.args[0]).to.deep.equal(expectedResult);
  });

  it("should call create with passed params (including merged headers) and without modifyInstance", () => {
    const options = {
      headers: {
        "X-Todd": "Hi",
        "test": "best"
      },
      rewriteRequest: [() => {}],
      modifyInstance: c => c,
      abc: 123
    };
    const client = getHttpClient(options, undefined, undefined, axiosMock);
    const { modifyInstance, ...expectedResult} = options;
    expectedResult.headers = {...expectedResult.headers, ...defaultHeaders};
    expect(axiosMock.create.lastCall.args[0]).to.deep.equal(expectedResult);
  });

  it("should merge request headers if request object is passed", () => {
    const options = {
      headers: {
        "X-Todd": "Hi",
        "test": "best"
      },
      test2: "hi"
    };
    const req = {
      headers: {
        "cookie": "name=Lincoln",
        "host": "hola.com:332211"
      }
    };
    const client = getHttpClient(options, req, {}, axiosMock);
    expect(axiosMock.create.calledWith(options)).to.equal(false);

    const { headers, ...config } = options;
    expect(axiosMock.create.lastCall.args[0]).to.deep.equal({
      baseURL: `http://${req.headers.host}`,
      headers: {
        ...req.headers,
        ...headers
      },
      ...config
    });
  });

  it("should set baseURL with https if req.secure is true", () => {
    const req = {
      headers: {
        "cookie": "name=Lincoln",
        "host": "hola.com:332211"
      },
      secure: true
    };
    const client = getHttpClient({}, req, {}, axiosMock);
    expect(axiosMock.create.lastCall.args[0].baseURL).to.equal(`https://${req.headers.host}`);
  });

  it("should set baseURL with http if req.secure is false", () => {
    const req = {
      headers: {
        "cookie": "name=Lincoln",
        "host": "hola.com:332211"
      },
      secure: false
    };
    const client = getHttpClient({}, req, {}, axiosMock);
    expect(axiosMock.create.lastCall.args[0].baseURL).to.equal(`http://${req.headers.host}`);
  });

  it("should forward along cookies back to the browser", () => {
    const req = {
      headers: {
        "cookie": "name=Lincoln",
        "host": "hola.com:332211"
      },
      secure: false
    };

    const mockServerResponse = {
      removeHeader: sinon.spy(),
      cookie: sinon.spy(),
      append: sinon.spy()
    };

    const client = getHttpClient({}, req, mockServerResponse, axiosMock);
    const { response } = client.get({
      headers: {
        "set-cookie": ["oh=hai"]
      }
    });

    expect(mockServerResponse.append.lastCall.args).to.deep.equal(["Set-Cookie", "oh=hai"]);
  });

  it("should send received cookies in subsequent requests with the same instance", () => {
    const req = {
      headers: {
        "cookie": "name=Lincoln",
        "host": "hola.com:332211"
      },
      secure: false
    };

    const mockServerResponse = {
      removeHeader: sinon.spy(),
      cookie: sinon.spy(),
      append: sinon.spy(),
      headers: {
        "set-cookie": ["_some_cookie=abc", "another_cookie=something"]
      }
    };

    const client = getHttpClient({}, req, mockServerResponse, axiosMock);
    client.get({
      headers: {
        "set-cookie": ["_some_cookie=abc", "another_cookie=something"]
      }
    });
    const { request } = client.get({
      headers: {}
    });

    expect(request[0].headers.cookie).to.equal("name=Lincoln; _some_cookie=abc; another_cookie=something");
  });

  it("should not send received cookies in subsequent requests with a new instance", () => {
    const req = {
      headers: {
        "cookie": "name=Lincoln",
        "host": "hola.com:332211"
      },
      secure: false
    };

    const mockServerResponse = {
      removeHeader: sinon.spy(),
      cookie: sinon.spy(),
      append: sinon.spy(),
      headers: {
        "set-cookie": ["_some_cookie=abc", "another_cookie=something"]
      }
    };

    const client = getHttpClient({}, req, mockServerResponse, axiosMock);
    client.get({
      headers: {
        "set-cookie": ["_some_cookie=abc", "another_cookie=something"]
      }
    });

    const newClient = getHttpClient({}, req, mockServerResponse, axiosMock);
    const { request } = newClient.get({
      headers: {}
    });

    expect(request[0].headers.cookie).to.equal("name=Lincoln");
  });

  it("should allow you to modify the axios instance with `modifyInstance`", () => {
    const calledInsideModify = sinon.spy();
    const options = {
      modifyInstance: (client) => {
        calledInsideModify();
        client.modifiedClient = true;
        return client;
      }
    };
    const req = {
      headers: {
        "host": "hola.com:332211"
      },
      secure: false
    };
    const client = getHttpClient(options, req);
    expect(calledInsideModify.called).to.equal(true);
    expect(client.modifiedClient).to.equal(true);
  });
});
