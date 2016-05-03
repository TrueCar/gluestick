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
    expect(mockExpressHttpProxy.lastCall.args[1].test).to.equal(proxyConfig.options.test);
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
    expect(mockExpressHttpProxy.lastCall.args[1].forwardPath).to.be.a("function");
    expect(mockExpressHttpProxy.lastCall.args[1].forwardPath(mockRequest)).to.equal("/api/todos");
  });

  it("should allow you to override forwardPath", () => {
    const mockExpressHttpProxy = sinon.spy();
    const forwardPath = () => "hi";
    const proxyConfig = {
      path: "/api",
      destination: "http://www.test.com/api",
      options: {
        test: "yes",
        forwardPath
      }
    };
    addProxies(mockApp, [proxyConfig], mockExpressHttpProxy);
    expect(mockExpressHttpProxy.lastCall.args[1].forwardPath).to.equal(forwardPath);
  });
});

