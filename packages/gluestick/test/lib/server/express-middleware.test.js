/* eslint-disable */
// @TODO enable eslint when file is refactored

// import { Writable, Readable } from "stream";
//
// import gluestickExpressMiddleware from "../../../src/lib/server/express-middleware";

// @TODO express-middleware needs refactor
describe.skip("lib/server/express-middleware", () => {
  let redirectLocation, renderProps, mockReq, mockRes, overrides, getErrorMessage, mockStore;
  beforeEach(() => {
    mockReq = new Readable();
    mockReq.host = "www.test.com";
    mockRes = new Writable();
    mockRes.status = jest.fn();
    mockRes.writeHead = jest.fn();
    mockStore = {
      getState: jest.fn().mockImplementation(() => {}),
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
        renderCachedResponse: jest.fn().mockImplementation(() => false),
        matchRoute: jest.fn().mockImplementation(() => new Promise((r) => r({redirectLocation, renderProps}))),
        redirect: jest.fn(),
        renderNotFound: jest.fn(),
        runPreRenderHooks: jest.fn().mockImplementation(() => new Promise((r) => r())),
        getCurrentRoute: jest.fn().mockImplementation(() => ({ name: "abc", path: "/a" })),
        setHeaders: jest.fn(),
        getStatusCode: jest.fn().mockImplementation(() => 200),
        prepareOutput: jest.fn().mockImplementation(() => {}),
        cacheAndRender: jest.fn(),
        enableComponentCaching: jest.fn()
      },
      errorHandler: jest.fn(),
      getRenderRequirementsFromEntrypoints: jest.fn().mockImplementation(() => ({
        store: mockStore,
        getRoutes: () => {},
      })),
      exposedEnvVariables: {
        bestFood: "burritos"
      }
    };

    getErrorMessage = () => {
      return overrides.errorHandler.mock.calls[0][2].message;
    };
  });

  describe("when there is an error", () => {
    it("should pass errors from renderCachedResponse to the error handler", () => {
      overrides.RequestHandler.renderCachedResponse.mockImplementationOnce(() => { throw new Error("Error with cached response"); });
      gluestickExpressMiddleware(mockReq, mockRes, overrides);
      expect(getErrorMessage()).toEqual("Error with cached response");
    });

    it("should pass errors from getRenderRequirementsFromEntrypoints to the error handler", () => {
      overrides.RequestHandler.renderCachedResponse.mockImplementationOnce(() => { throw new Error("Error with render reqs"); });
      gluestickExpressMiddleware(mockReq, mockRes, overrides);
      expect(getErrorMessage()).toEqual("Error with render reqs");
    });

    it("should pass errors caught in matchRoute to error handler", async () => {
      overrides.RequestHandler.matchRoute.mockImplementationOnce(() => new Promise((res, rej) => {
        rej("Error with match route");
      }));

      await gluestickExpressMiddleware(mockReq, mockRes, overrides);
      expect(overrides.errorHandler.mock.calls[0][2]).toEqual("Error with match route");
    });

    it("should pass errors caught in redirect to error handler", async () => {
      overrides.RequestHandler.matchRoute.mockImplementationOnce(() => new Promise((res) => {
        res({
          redirectLocation: "http://www.example.com"
        });
      }));
      overrides.RequestHandler.redirect.mockImplementationOnce(() => { throw new Error("redirect error"); });
      await gluestickExpressMiddleware(mockReq, mockRes, overrides);
      expect(getErrorMessage()).toEqual("redirect error");
    });

    it("should pass errors caught in renderNotFound to error handler", async () => {
      overrides.RequestHandler.renderNotFound.mockImplementationOnce(() => { throw new Error("render not found error"); });
      await gluestickExpressMiddleware(mockReq, mockRes, overrides);
      expect(getErrorMessage()).toEqual("render not found error");
    });

    describe("with render props", () => {
      beforeEach(() => {
        overrides.RequestHandler.matchRoute.mockImplementationOnce(() => new Promise((res) => {
          res({
            renderProps: {}
          });
        }));
      });

      it("should pass errors caught in renderPreRenderHooks to error handler", async () => {
        overrides.RequestHandler.runPreRenderHooks.mockImplementationOnce(() => { throw new Error("pre hook error"); });
        await gluestickExpressMiddleware(mockReq, mockRes, overrides);
        expect(getErrorMessage()).toEqual("pre hook error");
      });

      it("should pass errors caught in getCurrentRoute to error handler", async () => {
        overrides.RequestHandler.getCurrentRoute.mockImplementationOnce(() => { throw new Error("current route error"); });
        await gluestickExpressMiddleware(mockReq, mockRes, overrides);
        expect(getErrorMessage()).toEqual("current route error");
      });

      it("should pass errors caught in setHeaders to error handler", async () => {
        overrides.RequestHandler.setHeaders.mockImplementationOnce(() => { throw new Error("set headers error"); });
        await gluestickExpressMiddleware(mockReq, mockRes, overrides);
        expect(getErrorMessage()).toEqual("set headers error");
      });

      it("should pass errors caught in getStatusCode to error handler", async () => {
        overrides.RequestHandler.getStatusCode.mockImplementationOnce(() => { throw new Error("get status code error"); });
        await gluestickExpressMiddleware(mockReq, mockRes, overrides);
        expect(getErrorMessage()).toEqual("get status code error");
      });

      it("should pass errors caught in prepareOutput to error handler", async () => {
        overrides.RequestHandler.prepareOutput.mockImplementationOnce(() => { throw new Error("prepare output error"); });
        await gluestickExpressMiddleware(mockReq, mockRes, overrides);
        expect(getErrorMessage()).toEqual("prepare output error");
      });

      it("should pass errors caught in cacheAndRender to error handler", async () => {
        overrides.RequestHandler.prepareOutput.mockImplementationOnce(() => { throw new Error("cache and render error"); });
        await gluestickExpressMiddleware(mockReq, mockRes, overrides);
        expect(getErrorMessage()).toEqual("cache and render error");
      });
    });
  });

  describe("when there is a cached response", () => {
    beforeEach(() => {
      overrides.RequestHandler.renderCachedResponse.mockImplementationOnce(() => true);
    });

    it("should not call `getRenderRequirementsFromEntrypoints`", () => {
      gluestickExpressMiddleware(mockReq, mockRes, overrides);
      expect(overrides.getRenderRequirementsFromEntrypoints).not.toHaveBeenCalled();
    });
  });

  describe("when there is no cached response", () => {
    describe("when there is a redirect location", () => {
      beforeEach(() => {
        overrides.RequestHandler.matchRoute.mockImplementationOnce(() => new Promise((res) => {
          res({
            redirectLocation: "http://www.example.com"
          });
        }));
      });

      it("should redirect the user to the location", async () => {
        await gluestickExpressMiddleware(mockReq, mockRes, overrides);
        expect(overrides.RequestHandler.redirect).toBeCalledWith(mockRes, "http://www.example.com");
      });
    });

    describe("when there is no redirect location or render props", () => {
      it("should call render not found", async () => {
        await gluestickExpressMiddleware(mockReq, mockRes, overrides);
        expect(overrides.RequestHandler.renderNotFound).toHaveBeenCalledTimes(1);
      });
    });

    describe("when there are render props and no redirect", () => {
      beforeEach(() => {
        overrides.RequestHandler.matchRoute.mockImplementationOnce(() => new Promise((res) => {
          res({
            renderProps: {}
          });
        }));
      });

      it("should run pre render hooks", async () => {
        await gluestickExpressMiddleware(mockReq, mockRes, overrides);
        expect(overrides.RequestHandler.runPreRenderHooks).toBeCalledWith(mockReq, {}, mockStore);
      });

      it("should get the current route and pass it to setHeaders", async () => {
        await gluestickExpressMiddleware(mockReq, mockRes, overrides);
        const getCurrentRoute = overrides.RequestHandler.getCurrentRoute;
        expect(getCurrentRoute).toHaveBeenCalledTimes(1);
        const currentRoute = getCurrentRoute();
        expect(overrides.RequestHandler.setHeaders).toBeCalledWith(mockRes, currentRoute);
      });

      it("should call getStatusCode with the store and currentRoute", async () => {
        await gluestickExpressMiddleware(mockReq, mockRes, overrides);
        const getCurrentRoute = overrides.RequestHandler.getCurrentRoute;
        const currentRoute = getCurrentRoute();
        const state = mockStore.getState();
        expect(overrides.RequestHandler.getStatusCode).toBeCalledWith(state, currentRoute);
      });

      it("should call prepare output with all of the necessary arguments", async () => {
        await gluestickExpressMiddleware(mockReq, mockRes, overrides);
        expect(overrides.RequestHandler.prepareOutput).toBeCalledWith(
          mockReq,
          overrides.getRenderRequirementsFromEntrypoints(),
          {},
          overrides.config,
          overrides.exposedEnvVariables
        );
      });

      it("should call cacheAndRender with all of the necessary arguments", async () => {
        await gluestickExpressMiddleware(mockReq, mockRes, overrides);
        const getCurrentRoute = overrides.RequestHandler.getCurrentRoute;
        const currentRoute = getCurrentRoute();
        const prepareOutput = overrides.RequestHandler.prepareOutput;
        const output = prepareOutput();
        expect(overrides.RequestHandler.cacheAndRender).toBeCalledWith(
          mockReq,
          mockRes,
          currentRoute,
          overrides.RequestHandler.getStatusCode(),
          output
        );
      });
    });
  });
});

