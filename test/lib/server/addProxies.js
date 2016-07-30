/*global beforeEach describe it*/
import { expect } from "chai";
import sinon from "sinon";
import addProxies from "../../../src/lib/server/addProxies";

describe("lib/server/addProxies", function () {
  let mockApp;
  beforeEach(() => {
    mockApp = {
      use: sinon.spy()
    };
  });

  it("should add proxies to express app", () => {
    const proxies = [
      {
        path: "/api",
        destination: "http://www.test.com/api",
        options: {
          test: "yes"
        }
      },
      {
        path: "/api2",
        destination: "http://www.test2.com/api",
        options: {
          test: "yes"
        }
      }
    ];
    addProxies(mockApp, proxies);
    expect(mockApp.use.calledWith("/api")).to.equal(true);
    expect(mockApp.use.calledWith("/api2")).to.equal(true);
    expect(mockApp.use.calledWith("/not")).to.equal(false);
  });

  it("should pass the correct proxy arguments when creating a proxy", () => {
    const mockExpressHttpProxy = sinon.spy();
    const proxyConfig = {
      path: "/api",
      destination: "http://www.test.com/api",
      options: {
        test: "yes"
      }
    };
    addProxies(mockApp, [proxyConfig], mockExpressHttpProxy);
    expect(mockExpressHttpProxy.called).to.equal(true);
    expect(mockExpressHttpProxy.lastCall.args[0].test).to.equal(proxyConfig.options.test);
  });

  it("should use the default forwardPath option for you when creating the proxy", () => {
    const mockExpressHttpProxy = sinon.spy();
    const mockRequest = sinon.stub();
    mockRequest.url = "/todos";
    const proxyConfig = {
      path: "/api",
      destination: "http://www.test.com/api",
      options: {
        test: "yes"
      }
    };
    addProxies(mockApp, [proxyConfig], mockExpressHttpProxy);
    expect(mockExpressHttpProxy.lastCall.args[0].pathRewrite).to.deep.equal({[`^${proxyConfig.path}`]: ""});
  });

  it("should allow you to override pathRewrite", () => {
    const mockExpressHttpProxy = sinon.spy();
    const pathRewrite = {"^/api": "/API"};
    const proxyConfig = {
      path: "/api",
      destination: "http://www.test.com/api",
      options: {
        test: "yes",
        pathRewrite
      }
    };
    addProxies(mockApp, [proxyConfig], mockExpressHttpProxy);
    expect(mockExpressHttpProxy.lastCall.args[0].pathRewrite).to.equal(pathRewrite);
  });

  it("should allow you to supply a filter function", () => {
    const mockExpressHttpProxy = sinon.spy();
    const proxyConfig = {
      filter: (pathname) => {
        return !!(pathname.match("/api") && !pathname.match("/api/foo"));
      },
      path: "/api",
      destination: "http://www.test.com/api"
    };
    addProxies(mockApp, [proxyConfig], mockExpressHttpProxy);
    expect(mockExpressHttpProxy.lastCall.args[0]).to.be.a("function");
    expect(mockExpressHttpProxy.lastCall.args[0]).to.equal(proxyConfig.filter);
  });

  it("should not add the filter if it is not a function", () => {
    const mockExpressHttpProxy = sinon.spy();
    const proxyConfig = {
      filter: "this is the wrong type for filter",
      path: "/api",
      destination: "http://www.test.com/api"
    };
    addProxies(mockApp, [proxyConfig], mockExpressHttpProxy);
    expect(mockExpressHttpProxy.lastCall.args[0]).to.not.be.a("function");
    expect(mockExpressHttpProxy.lastCall.args[0]).to.be.a("Object");
  });
});

