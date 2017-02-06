import React from "react";
import * as RequestHandler from "../../../src/lib/server/RequestHandler";
import { Route, Redirect } from "react-router";
import { MISSING_404_TEXT } from "../../../src/lib/server/helpText";
import { Writable } from "stream";
import {
    ROUTE_NAME_404_NOT_FOUND
} from "gluestick-shared";

describe("lib/server/RequestHandler", () => {
  describe("getCacheKey", () => {
    it("should return a key using the hostname and url", () => {
      const req = {
        hostname: "www.example.com",
        url: "/the-path"
      };
      const key = RequestHandler.getCacheKey(req);
      expect(key).toEqual("h:www.example.com u:/the-path");
    });
  });

  describe("renderCachedResponse", () => {
    let req, res, mockCache, streamResponse;
    beforeEach(() => {
      req = {
        hostname: "www.example.com",
        url: "/another-path"
      };
      res = {};
      mockCache = {
        get: jest.fn().mockImplementation(() => "Sup brah!")
      };
      streamResponse = jest.fn();
    });

    describe("when a cached result exists", () => {
      beforeEach(() => {
        mockCache = {
          get: jest.fn().mockImplementation(() => "Sup brah!")
        };
      });

      it("should return true", () => {
        const result = RequestHandler.renderCachedResponse(req, res, mockCache, streamResponse);
        expect(result).toEqual(true);
      });

      it("should use the correct key when looking up the cached value", () => {
        RequestHandler.renderCachedResponse(req, res, mockCache, streamResponse);
        const key = RequestHandler.getCacheKey(req);
        expect(mockCache.get).toBeCalledWith(key);
      });

      it("should pass the cached result, req, and res object to streamResponse", () => {
        RequestHandler.renderCachedResponse(req, res, mockCache, streamResponse);
        expect(streamResponse).toBeCalledWith(req, res, "Sup brah!");
      });
    });

    describe("when cached result does not exist", () => {
      beforeEach(() => {
        mockCache = {
          get: jest.fn().mockImplementation(() => null)
        };
      });

      it("should return false", () => {
        const result = RequestHandler.renderCachedResponse(req, res, mockCache, streamResponse);
        expect(result).toEqual(false);
      });

      it("should not call streamResponse", () => {
        RequestHandler.renderCachedResponse(req, res, mockCache, streamResponse);
        expect(streamResponse).not.toHaveBeenCalled();
      });
    });
  });

  describe("matchRoute", () => {
    let req, res, getRoutes, store, config;

    beforeEach(() => {
      req = {
        url: "/abc123",
        headers: {
          host: "localhost"
        }
      };
      res = {};
      config = {};

      getRoutes = jest.fn().mockImplementation(() =>
        <Route>
          <Route name="test1" path="abc123" />
          <Route name="test2" path="321xyz" />
          <Redirect name="test3" from="a" to="b" />
        </Route>
      );

      store = {
        getState: jest.fn(),
        dispatch: jest.fn()
      };
    });

    describe("when a matching route (not a redirect) exists", () => {
      it("should return the renderProps", (done) => {
        RequestHandler.matchRoute(req, res, getRoutes, store, config).then(({redirectLocation, renderProps}) => {
          expect(redirectLocation).toBeNull();
          expect(renderProps).toBeDefined();
          done();
        });
      });
    });

    describe("when a matching redirect exists", () => {
      beforeEach(() => {
        req = {
          url: "a",
          headers: {
            host: "localhost"
          }
        };
      });

      it("should return the redirectLocation", (done) => {
        RequestHandler.matchRoute(req, res, getRoutes, store, config).then(({redirectLocation, renderProps}) => {
          expect(redirectLocation).not.toBeNull();
          expect(redirectLocation.pathname).toEqual("/b");
          expect(renderProps).toBeUndefined();
          done();
        });
      });
    });

    describe("when no matching route exists", () => {
      beforeEach(() => {
        req = {
          url: "zzzz",
          headers: {
            host: "localhost"
          }
        };
      });

      it("should forward to the promise `catch` with an error", (done) => {
        RequestHandler.matchRoute(req, res, getRoutes, store, config).then(({redirectLocation, renderProps}) => {
          expect(redirectLocation).toBeUndefined();
          expect(renderProps).toBeUndefined();
          done();
        });
      });
    });
  });

  describe("redirect", () => {
    it("should call the response object `redirect` method with 301 and path + search", () => {
      const res = {
        redirect: jest.fn()
      };
      const redirectLocation = {
        pathname: "/abc",
        search: "?hi"
      };
      RequestHandler.redirect(res, redirectLocation);
      expect(res.redirect).toBeCalledWith(301, redirectLocation.pathname + redirectLocation.search);
    });
  });

  describe("renderNotFound", () => {
    let res, showHelpText, end, status;
    beforeEach(() => {
      end = jest.fn();
      status = jest.fn();
      res = {
        status,
        end
      };
      res.status = jest.fn().mockImplementation(() => res);
      showHelpText = jest.fn();
    });

    it("should show React 404 help text", () => {
      RequestHandler.renderNotFound(res, showHelpText);
      expect(showHelpText).toBeCalledWith(MISSING_404_TEXT);
    });

    it("should set 404 status and end", () => {
      RequestHandler.renderNotFound(res, showHelpText);
      expect(res.status).toBeCalledWith(404);
      expect(res.end).toBeCalledWith("Not Found");
    });
  });

  describe("runPreRenderHooks", () => {
    it("forwards arguments to runBeforeRoutes", () => {
      const req = {
        url: "/abc",
        headers: {
          host: "localhost"
        }
      };
      const renderProps = {};
      const store = {};
      const runBeforeRoutes = jest.fn();
      RequestHandler.runPreRenderHooks(req, renderProps, store, runBeforeRoutes);
      expect(runBeforeRoutes).toBeCalledWith(store, renderProps, {isServer: true, request: req});
    });
  });

  describe("getCurrentRoute", () => {
    it("returns the last route on renderProps.routes", () => {
      const renderProps = {
        routes: [
          {path: "a"},
          {path: "b"},
          {path: "c"},
          {path: "d"}
        ]
      };
      expect(RequestHandler.getCurrentRoute(renderProps)).toEqual([...renderProps.routes].pop());
    });
  });

  describe("getStatusCode", () => {
    let state, currentRoute;
    beforeEach(() => {
      state = {
        _gluestick: {}
      };
      currentRoute = {path: "abc"};
    });

    describe(
      "when no redux state, not a 404 route and no route status override",
      () => {
        it("should return 200", () => {
          expect(RequestHandler.getStatusCode(state, currentRoute)).toEqual(200);
        });
      }
    );

    describe("when route status override", () => {
      beforeEach(() => {
        currentRoute = {path: "abc", status: 999};
      });
      it("should return the route's status", () => {
        const status = RequestHandler.getStatusCode(state, currentRoute);
        expect(status).toEqual(999);
      });
    });

    describe("when status is set in redux state", () => {
      beforeEach(() => {
        state._gluestick = {
          statusCode: 201
        };
      });
      it("should return the status code set in redux", () => {
        const status = RequestHandler.getStatusCode(state, currentRoute);
        expect(status).toEqual(201);
      });
    });

    describe("when route name is the 404 constant name", () => {
      beforeEach(() => {
        currentRoute = {path: "abc", name: ROUTE_NAME_404_NOT_FOUND};
      });
      it("should return 404", () => {
        const status = RequestHandler.getStatusCode(state, currentRoute);
        expect(status).toEqual(404);
      });
    });
  });

  describe("setHeaders", () => {
    let res, currentRoute;
    beforeEach(() => {
      res = {
        set: jest.fn()
      };
    });
    describe("when the route specifies headers", () => {
      beforeEach(() => {
        currentRoute = {path: "abc", headers: {a: "hi"}};
      });
      it("should set the headers on the response object", () => {
        RequestHandler.setHeaders(res, currentRoute);
        expect(res.set).toHaveBeenCalledWith(currentRoute.headers);
      });
    });

    describe("when the route does not specify headers", () => {
      it("should not set any headers on the response object", () => {
        currentRoute = {path: "abc"};
        RequestHandler.setHeaders(res, currentRoute);
        expect(res.set).not.toBeCalled();
      });
    });
  });

  describe("prepareOutput", () => {
    let req, renderRequirements, renderProps, config, envVariables, staticBuild, getHead,
        Entry;

    class Index extends React.Component {
      render () {
        return <div>hi</div>;
      }
    }

    beforeEach(() => {
      req = {
        headers: {
          "user-agent": "Moznota Browser 1.0"
        }
      };

      const routes = [
        {path: "hola"}
      ];

      renderRequirements = {
        Index,
        store: {
          getState: jest.fn().mockImplementation(() => {})
        },
        getRoutes: () => routes,
        fileName: "abc"
      };

      renderProps = {
        routes
      };

      config = {};
      envVariables = {bestFood: "burritos"};
      getHead = jest.fn().mockImplementation(() => <div />);
      Entry = class extends React.Component {
        render () {
          return (
            <div>hi</div>
          );
        }
      };
      webpackIsomorphicTools = {
        assets: jest.fn(),
      };
    });

    describe("without a custom render method", () => {
      describe("when the route is an email route", () => {
        let result;
        beforeEach(async () => {
          renderProps.routes[0].email = true;
          result = await RequestHandler.prepareOutput(req, renderRequirements,
            renderProps, config, envVariables, staticBuild, getHead, Entry);
        });
        it("should return a responseString", () => {
          expect(result.responseString).toBeDefined();
        });

        it("should not pass head to Index", () => {
          expect(result.rootElement.props.head).toBeUndefined();
        });

        it("should not include react-id attributes in html because it uses renderToStaticMarkup", () => {
          expect(result.rootElement.props.body.props.html).not.toContain("data-reactid");
        });
      });

      describe("when the route is not an email route", () => {
        let result;
        beforeEach(async () => {
          delete renderProps.routes[0].email;
          result = await RequestHandler.prepareOutput(req, renderRequirements,
            renderProps, config, envVariables, staticBuild, getHead, Entry);
        });

        it("should return a responseString", () => {
          expect(result.responseString).toBeDefined();
        });

        it("should pass head to Index", () => {
          expect(result.rootElement.props.head).not.toBeNull();
        });

        it("should include react-id attributes in html because it uses renderToString", () => {
          // html is a stream so we have to convert it to a string to test it
          expect(result.rootElement.props.body.props.html).toContain("data-reactid");
        });
      });
    });

    describe("with a custom render method", () => {
      let updatedConfig, result, headJSX;
      beforeEach(async () => {
        headJSX = <meta name="hi" value="hola" />;
        updatedConfig = {
          ...config,
          server: {
            ...config.server,
            renderMethod: () => ({
              head: headJSX,
              body: "<div>That body!</div>"
            })
          }
        };
      });

      it("should pass bodyContent to html prop", async () => {
        result = await RequestHandler.prepareOutput(req, renderRequirements,
          renderProps, updatedConfig, envVariables, staticBuild, getHead, Entry,
          webpackIsomorphicTools);
        expect(result.rootElement.props.body.props.html).toEqual("<div>That body!</div>");
      });

      describe("not an email", () => {
        beforeEach(async () => {
          delete renderProps.routes[0].email;
          result = await RequestHandler.prepareOutput(req, renderRequirements,
            renderProps, updatedConfig, envVariables, staticBuild, getHead, Entry);
        });

        it("should pass headContent to getHead", () => {
          expect(getHead.mock.calls[0][2]).toEqual(headJSX);
        });
      });

      describe("an email", () => {
        beforeEach(async () => {
          renderProps.routes[0].email = true;
          result = await RequestHandler.prepareOutput(req, renderRequirements,
            renderProps, updatedConfig, envVariables, staticBuild, getHead, Entry);
        });

        it("should pass headContent to getHead", async () => {
          expect(result.rootElement.props.head).toEqual(headJSX);
        });
      });
    });

    context("with the static build option", () => {
      let result;
      beforeEach(async () => {
        staticBuild = true;
        result = await RequestHandler.prepareOutput(req, renderRequirements,
          renderProps, config, envVariables, staticBuild, getHead, Entry);
      });

      it("should pass blank html to body", () => {
        expect(result.rootElement.props.body.props.html).to.equal("");
      });

      it("should pass isEmail false to body", () => {
        expect(result.rootElement.props.body.props.isEmail).to.equal.false;
      });

      it("should pass empty initialState to body", () => {
        expect(result.rootElement.props.body.props.initialState).to.be.empty;
      });
    });
  });

  describe("cacheAndRender", () => {
    let req, res, currentRoute, status, output, cache, streamResponse, logger;
    beforeEach(() => {
      req = {
        hostname: "www.example.com",
        url: "/abc",
        headers: {
          "accept-encoding": "gzip"
        }
      };
      res = new Writable();
      res.writeHead = jest.fn();
      status = 200;
      const responseString = "abc";

      output={responseString};
      cache = {
        set: jest.fn()
      };
      logger = {
        debug: jest.fn()
      };
      currentRoute = {path: "/", docType: "<!FakeDoc>"};
    });

    it("should pass along the status and route Attrs", () => {
      streamResponse = jest.fn();
      RequestHandler.cacheAndRender(req, res, currentRoute, status, output, cache, streamResponse, logger, true);
      const streamArgs = streamResponse.mock.calls[0][2];
      expect(streamResponse.mock.calls[0][0]).toEqual(expect.objectContaining(req, res));
      expect(streamArgs.status).toEqual(status);
      expect(streamArgs.docType).toEqual("<!FakeDoc>");
    });

    describe("when caching is enabled for the currentRoute", () => {
      beforeEach(() => {
        currentRoute.cache = true;
      });

      it("should set the status, string and docType to the cache on the cacheKey", (done) => {
        RequestHandler.cacheAndRender(req, res, currentRoute, status, output, cache, streamResponse, logger, true);
        // wait for next tick since so streams have time to be piped
        setTimeout(() => {
          expect(cache.set).toHaveBeenCalledTimes(1);
          const key = RequestHandler.getCacheKey(req);
          expect(cache.set.mock.calls[0]).toContain(key, {status, responseString: "abc", docType: "<!FakeDoc>"});
          done();
        }, 0);
      });

      describe("when cacheTTL is set on the current route", () => {
        beforeEach(() => {
          currentRoute.cacheTTL = 5;
          RequestHandler.cacheAndRender(req, res, currentRoute, status, output, cache, streamResponse, logger, true);
        });

        it("should set cache converting cacheTTL to miliseconds", (done) => {
          // wait for next tick since so streams have time to be piped
          setTimeout(() => {
            expect(cache.set.mock.calls[0][2]).toEqual(5000);
            done();
          }, 0);
        });
      });
    });

    describe("when caching is not enabled for the currentRoute", () => {
      beforeEach(() => {
        currentRoute.cache = false;
      });

      it("should not call cache.set", (done) => {
        RequestHandler.cacheAndRender(req, res, currentRoute, status, output, cache, streamResponse, logger, true);
        // wait for next tick since so streams have time to be piped
        setTimeout(() => {
          expect(cache.set).not.toBeCalled();
          done();
        }, 0);
      });
    });
  });

  describe("getEmailAttributes", () => {
    describe("when the route has an email attribute and no doctype", () => {
      it("should return the email attribute and the default HTML5 doctype", () => {
        const result = RequestHandler.getEmailAttributes({email: true});
        expect(result.email).toEqual(true);
        expect(result.docType).toEqual("<!DOCTYPE html>");
      });
    });

    describe("when the route has an email and a doctype", () => {
      it("should return the email attribute and custom docType", () => {
        const result = RequestHandler.getEmailAttributes({email: true, docType: "<!XML>"});
        expect(result.email).toEqual(true);
        expect(result.docType).toEqual("<!XML>");
      });
    });

    describe("when the route has no email or doctype", () => {
      it("should return the false for the email and the default HTML5 docType", () => {
        const result = RequestHandler.getEmailAttributes({});
        expect(result.email).toEqual(false);
        expect(result.docType).toEqual("<!DOCTYPE html>");
      });
    });
  });

  describe("enableComponentCaching", () => {
    let mockCache;
    beforeEach(() => {
      mockCache = {
        enableCaching: jest.fn(),
        setCachingConfig: jest.fn()
      };
    });

    describe("when it hasn't yet been called", () => {
      describe("outside of production", () => {
        it("shouldn't enable caching", () => {
          RequestHandler.enableComponentCaching({}, false, mockCache);
          expect(mockCache.enableCaching).not.toBeCalled();
        });
      });

      describe("when no config is set", () => {
        it("should pass `false` to enableComponentCaching", () => {
          RequestHandler.enableComponentCaching(undefined, true, mockCache); // eslint-disable-line no-undefined
          expect(mockCache.enableCaching).toBeCalledWith(false);
        });
      });

      describe("when config is set", () => {
        it("should pass `true` to enableComponentCaching", () => {
          RequestHandler.enableComponentCaching({}, true, mockCache);
          expect(mockCache.enableCaching).toBeCalledWith(true);
        });

        it("should pass the provided `componentCacheConfig` to setCachingConfig", () => {
          const config = {components: {"Home": {}}};
          RequestHandler.enableComponentCaching(config, true, mockCache);
          expect(mockCache.setCachingConfig).toBeCalledWith(config);
        });
      });
    });
  });
});
