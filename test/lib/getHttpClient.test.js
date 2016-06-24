import getHttpClient from "../../src/lib/getHttpClient";
import sinon from "sinon";
import { expect } from "chai";


describe("lib/getHttpClient", () => {
  let axiosMock, mockAxiosInstance;

  beforeEach(() => {
    mockAxiosInstance = {
      interceptors: {
        response: {
          use: (middleware) => {
            mockAxiosInstance.interceptors.response.middleware.push(middleware);
          },
          middleware: [],
        }
      },
      get: (fakeResponse) => {
        return mockAxiosInstance.interceptors.response.middleware.forEach(m => m(fakeResponse));
      }
    };

    axiosMock = {
      create: sinon.stub().returns(mockAxiosInstance)
    };
  });

  it("should call create with passed params", () => {
    const options = {
      headers: {
        "X-Todd": "Hi",
        "test": "best"
      },
      rewriteRequest: [() => {}]
    };
    const client = getHttpClient(options, undefined, undefined, axiosMock);
    expect(axiosMock.create.calledWith(options)).to.equal(true);
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
      append: sinon.spy()
    };

    const client = getHttpClient({}, req, mockServerResponse, axiosMock);
    const response = client.get({
      headers: {
        "set-cookie": "oh hai"
      }
    });

    expect(mockServerResponse.append.lastCall.args[0]).to.equal("Set-Cookie");
    expect(mockServerResponse.append.lastCall.args[1]).to.equal("oh hai");
  });
});

