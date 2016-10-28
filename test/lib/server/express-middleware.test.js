import { Writable, Readable } from "stream";
import { spy, stub } from "sinon";
import { expect } from "chai";

import gluestickExpressMiddleware from "../../../src/lib/server/express-middleware";

describe("lib/server/express-middleware", () => {
  let redirectLocation, renderProps, mockReq, mockRes, overrides, getErrorMessage, mockStore;
  beforeEach(() => {
    mockReq = new Readable();
    mockReq.host = "www.test.com";
    mockRes = new Writable();
    mockRes.status = spy();
    mockRes.writeHead = spy();
    mockStore = {
      getState: stub().returns({})
    };
    overrides = {
      config: {
        server: {
          componentCacheConfig: {
            components: {
              "Test": {
                enable: true,
                strategy: "simple"
              }
            }
          }
        }
      },
      RequestHandler: {
        renderCachedResponse: stub().returns(false),
        matchRoute: stub().returns(new Promise((r) => r({redirectLocation, renderProps}))),
        redirect: stub(),
        renderNotFound: stub(),
        runPreRenderHooks: stub().returns(new Promise((r) => r())),
        getCurrentRoute: stub().returns({name: "abc", path: "/a"}),
        setHeaders: stub(),
        getStatusCode: stub().returns(200),
        prepareOutput: stub().returns({}),
        cacheAndRender: stub(),
        enableComponentCaching: stub()
      },
      errorHandler: spy(),
      getRenderRequirementsFromEntrypoints: stub().returns({
        store: mockStore,
        getRoutes: spy()
      }),
      exposedEnvVariables: {
        bestFood: "burritos"
      }
    };

    getErrorMessage = () => {
      return overrides.errorHandler.lastCall.args[2].message;
    };
  });

  context("when there is an error", () => {
    it("should pass errors from renderCachedResponse to the error handler", () => {
      overrides.RequestHandler.renderCachedResponse.throws(new Error("Error with cached response"));
      gluestickExpressMiddleware(mockReq, mockRes, overrides);
      expect(getErrorMessage()).to.equal("Error with cached response");
    });

    it("should pass errors from getRenderRequirementsFromEntrypoints to the error handler", () => {
      overrides.getRenderRequirementsFromEntrypoints.throws(new Error("Error with render reqs"));
      gluestickExpressMiddleware(mockReq, mockRes, overrides);
      expect(getErrorMessage()).to.equal("Error with render reqs");
    });

    it("should pass errors caught in matchRoute to error handler", async () => {
      overrides.RequestHandler.matchRoute.returns(new Promise((res, rej) => {
        rej("Error with match route");
      }));

      await gluestickExpressMiddleware(mockReq, mockRes, overrides);
      expect(overrides.errorHandler.lastCall.args[2]).to.equal("Error with match route");
    });

    it("should pass errors caught in redirect to error handler", async () => {
      overrides.RequestHandler.matchRoute.returns(new Promise((res) => {
        res({
          redirectLocation: "http://www.example.com"
        });
      }));
      overrides.RequestHandler.redirect.throws(new Error("redirect error"));
      await gluestickExpressMiddleware(mockReq, mockRes, overrides);
      expect(getErrorMessage()).to.equal("redirect error");
    });

    it("should pass errors caught in renderNotFound to error handler", async () => {
      overrides.RequestHandler.renderNotFound.throws(new Error("render not found error"));
      await gluestickExpressMiddleware(mockReq, mockRes, overrides);
      expect(getErrorMessage()).to.equal("render not found error");
    });

    context("with render props", () => {
      beforeEach(() => {
        overrides.RequestHandler.matchRoute.returns(new Promise((res) => {
          res({
            renderProps: {}
          });
        }));
      });

      it("should pass errors caught in renderPreRenderHooks to error handler", async () => {
        overrides.RequestHandler.runPreRenderHooks.throws(new Error("pre hook error"));
        await gluestickExpressMiddleware(mockReq, mockRes, overrides);
        expect(getErrorMessage()).to.equal("pre hook error");
      });

      it("should pass errors caught in getCurrentRoute to error handler", async () => {
        overrides.RequestHandler.getCurrentRoute.throws(new Error("current route error"));
        await gluestickExpressMiddleware(mockReq, mockRes, overrides);
        expect(getErrorMessage()).to.equal("current route error");
      });

      it("should pass errors caught in setHeaders to error handler", async () => {
        overrides.RequestHandler.setHeaders.throws(new Error("set headers error"));
        await gluestickExpressMiddleware(mockReq, mockRes, overrides);
        expect(getErrorMessage()).to.equal("set headers error");
      });

      it("should pass errors caught in getStatusCode to error handler", async () => {
        overrides.RequestHandler.getStatusCode.throws(new Error("get status code error"));
        await gluestickExpressMiddleware(mockReq, mockRes, overrides);
        expect(getErrorMessage()).to.equal("get status code error");
      });

      it("should pass errors caught in prepareOutput to error handler", async () => {
        overrides.RequestHandler.prepareOutput.throws(new Error("prepare output error"));
        await gluestickExpressMiddleware(mockReq, mockRes, overrides);
        expect(getErrorMessage()).to.equal("prepare output error");
      });

      it("should pass errors caught in cacheAndRender to error handler", async () => {
        overrides.RequestHandler.prepareOutput.throws(new Error("cache and render error"));
        await gluestickExpressMiddleware(mockReq, mockRes, overrides);
        expect(getErrorMessage()).to.equal("cache and render error");
      });
    });
  });

  context("when there is a cached response", () => {
    beforeEach(() => {
      overrides.RequestHandler.renderCachedResponse.returns(true);
    });

    it("should not call `getRenderRequirementsFromEntrypoints`", () => {
      gluestickExpressMiddleware(mockReq, mockRes, overrides);
      expect(overrides.getRenderRequirementsFromEntrypoints.called).to.be.false;
    });
  });

  context("when there is no cached response", () => {
    context("when there is a redirect location", () => {
      beforeEach(() => {
        overrides.RequestHandler.matchRoute.returns(new Promise((res) => {
          res({
            redirectLocation: "http://www.example.com"
          });
        }));
      });

      it("should redirect the user to the location", async () => {
        await gluestickExpressMiddleware(mockReq, mockRes, overrides);
        expect(overrides.RequestHandler.redirect.calledWith(mockRes, "http://www.example.com")).to.be.true;
      });
    });

    context("when there is no redirect location or render props", () => {
      it("should call render not found", async () => {
        await gluestickExpressMiddleware(mockReq, mockRes, overrides);
        expect(overrides.RequestHandler.renderNotFound.called).to.be.true;
      });
    });

    context("when there are render props and no redirect", () => {
      beforeEach(() => {
        overrides.RequestHandler.matchRoute.returns(new Promise((res) => {
          res({
            renderProps: {}
          });
        }));
      });

      it("should run pre render hooks", async () => {
        await gluestickExpressMiddleware(mockReq, mockRes, overrides);
        expect(overrides.RequestHandler.runPreRenderHooks.calledWith(mockReq, {}, mockStore)).to.be.true;
      });

      it("should get the current route and pass it to setHeaders", async () => {
        await gluestickExpressMiddleware(mockReq, mockRes, overrides);
        const getCurrentRoute = overrides.RequestHandler.getCurrentRoute;
        expect(getCurrentRoute.called).to.be.true;
        const currentRoute = getCurrentRoute.lastCall.returnValue;
        expect(overrides.RequestHandler.setHeaders.calledWith(mockRes, currentRoute)).to.be.true;
      });

      it("should call getStatusCode with the store and currentRoute", async () => {
        await gluestickExpressMiddleware(mockReq, mockRes, overrides);
        const getCurrentRoute = overrides.RequestHandler.getCurrentRoute;
        const currentRoute = getCurrentRoute.lastCall.returnValue;
        const state = mockStore.getState();
        expect(overrides.RequestHandler.getStatusCode.calledWith(state, currentRoute)).to.be.true;
      });

      it("should call prepare output with all of the necessary arguments", async () => {
        await gluestickExpressMiddleware(mockReq, mockRes, overrides);
        const { renderProps } = await overrides.RequestHandler.matchRoute();
        expect(overrides.RequestHandler.prepareOutput.calledWith(
          mockReq,
          overrides.getRenderRequirementsFromEntrypoints(),
          renderProps,
          overrides.config,
          overrides.exposedEnvVariables
        )).to.be.true;
      });

      it("should call cacheAndRender with all of the necessary arguments", async () => {
        await gluestickExpressMiddleware(mockReq, mockRes, overrides);
        const getCurrentRoute = overrides.RequestHandler.getCurrentRoute;
        const currentRoute = getCurrentRoute.lastCall.returnValue;
        const prepareOutput = overrides.RequestHandler.prepareOutput;
        const output = prepareOutput.lastCall.returnValue;
        expect(overrides.RequestHandler.cacheAndRender.calledWith(
          mockReq,
          mockRes,
          currentRoute,
          overrides.RequestHandler.getStatusCode(),
          output
        )).to.be.true;
      });
    });
  });
});

