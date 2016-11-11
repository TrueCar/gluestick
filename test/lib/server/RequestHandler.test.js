import React from "react";
import { expect } from "chai";
import { stub, spy } from "sinon";
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
      expect(key).to.equal("h:www.example.com u:/the-path");
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
        get: stub().returns("Sup brah!")
      };
      streamResponse = spy();
    });

    context("when a cached result exists", () => {
      beforeEach(() => {
        mockCache = {
          get: stub().returns("Sup brah!")
        };
      });

      it("should return true", () => {
        const result = RequestHandler.renderCachedResponse(req, res, mockCache, streamResponse);
        expect(result).to.equal(true);
      });

      it("should use the correct key when looking up the cached value", () => {
        RequestHandler.renderCachedResponse(req, res, mockCache, streamResponse);
        const key = RequestHandler.getCacheKey(req);
        expect(mockCache.get.calledWith(key)).to.equal(true);
      });

      it("should pass the cached result, req, and res object to streamResponse", () => {
        RequestHandler.renderCachedResponse(req, res, mockCache, streamResponse);
        expect(streamResponse.calledWith(req, res, "Sup brah!")).to.equal(true);
      });
    });

    context("when cached result does not exist", () => {
      beforeEach(() => {
        mockCache = {
          get: stub().returns(null)
        };
      });

      it("should return false", () => {
        const result = RequestHandler.renderCachedResponse(req, res, mockCache, streamResponse);
        expect(result).to.equal(false);
      });

      it("should not call streamResponse", () => {
        RequestHandler.renderCachedResponse(req, res, mockCache, streamResponse);
        expect(streamResponse.called).to.equal(false);
      });
    });
  });

  describe("matchRoute", () => {
    let req, getRoutes, store;

    beforeEach(() => {
      req = {
        url: "/abc123"
      };

      getRoutes = stub().returns(
        <Route>
          <Route name="test1" path="abc123" />
          <Route name="test2" path="321xyz" />
          <Redirect name="test3" from="a" to="b" />
        </Route>
      );

      store = {
        getState: spy(),
        dispatch: spy()
      };
    });

    context("when a matching route (not a redirect) exists", () => {
      it("should return the renderProps", (done) => {
        RequestHandler.matchRoute(req, getRoutes, store).then(({redirectLocation, renderProps}) => {
          expect(redirectLocation).to.be.null;
          expect(renderProps).to.not.be.undefined;
          done();
        });
      });
    });

    context("when a matching redirect exists", () => {
      beforeEach(() => {
        req = {
          url: "a"
        };
      });

      it("should return the redirectLocation", (done) => {
        RequestHandler.matchRoute(req, getRoutes, store).then(({redirectLocation, renderProps}) => {
          expect(redirectLocation).to.not.be.null;
          expect(redirectLocation.pathname).to.equal("/b");
          expect(renderProps).to.be.undefined;
          done();
        });
      });
    });

    context("when no matching route exists", () => {
      beforeEach(() => {
        req = {
          url: "zzzz"
        };
      });

      it("should forward to the promise `catch` with an error", (done) => {
        RequestHandler.matchRoute(req, getRoutes, store).then(({redirectLocation, renderProps}) => {
          expect(redirectLocation).to.be.undefined;
          expect(renderProps).to.be.undefined;
          done();
        });
      });
    });
  });

  describe("redirect", () => {
    it("should call the response object `redirect` method with 301 and path + search", () => {
      const res = {
        redirect: spy()
      };
      const redirectLocation = {
        pathname: "/abc",
        search: "?hi"
      };
      RequestHandler.redirect(res, redirectLocation);
      expect(res.redirect.calledWith(301, redirectLocation.pathname + redirectLocation.search)).to.equal.true;
    });
  });

  describe("renderNotFound", () => {
    let res, showHelpText, end, status;
    beforeEach(() => {
      end = spy();
      status = stub();
      res = {
        status,
        end
      };
      res.status.returns(res);
      showHelpText = spy();
    });

    it("should show React 404 help text", () => {
      RequestHandler.renderNotFound(res, showHelpText);
      expect(showHelpText.calledWith(MISSING_404_TEXT)).to.equal.true;
    });

    it("should set 404 status and end", () => {
      RequestHandler.renderNotFound(res, showHelpText);
      expect(res.status.calledWith(404)).to.equal.true;
      expect(res.end.calledWith("Not Found")).to.equal.true;
    });
  });

  describe("runPreRenderHooks", () => {
    it("forwards arguments to runBeforeRoutes", () => {
      const req = {
        url: "/abc"
      };
      const renderProps = {};
      const store = {};
      const runBeforeRoutes = spy();
      RequestHandler.runPreRenderHooks(req, renderProps, store, runBeforeRoutes);
      expect(runBeforeRoutes.calledWith(store, renderProps, {isServer: true, request: req})).to.equal.true;
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
      expect(RequestHandler.getCurrentRoute(renderProps)).to.equal([...renderProps.routes].pop());
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

    context("when no redux state, not a 404 route and no route status override", () => {
      it("should return 200", () => {
        expect(RequestHandler.getStatusCode(state, currentRoute)).to.equal(200);
      });
    });

    context("when route status override", () => {
      beforeEach(() => {
        currentRoute = {path: "abc", status: 999};
      });
      it("should return the route's status", () => {
        const status = RequestHandler.getStatusCode(state, currentRoute);
        expect(status).to.equal(999);
      });
    });

    context("when status is set in redux state", () => {
      beforeEach(() => {
        state._gluestick = {
          statusCode: 201
        };
      });
      it("should return the status code set in redux", () => {
        const status = RequestHandler.getStatusCode(state, currentRoute);
        expect(status).to.equal(201);
      });
    });

    context("when route name is the 404 constant name", () => {
      beforeEach(() => {
        currentRoute = {path: "abc", name: ROUTE_NAME_404_NOT_FOUND};
      });
      it("should return 404", () => {
        const status = RequestHandler.getStatusCode(state, currentRoute);
        expect(status).to.equal(404);
      });
    });
  });

  describe("setHeaders", () => {
    let res, currentRoute, getHeaders;
    beforeEach(() => {
      res = {
        set: spy()
      };
    });
    context("when the route specifies headers", () => {
      beforeEach(() => {
        currentRoute = {path: "abc", headers: {a: "hi"}};
      });
      it("should set the headers on the response object", () => {
        RequestHandler.setHeaders(res, currentRoute);
        expect(res.set.calledWith(currentRoute.headers)).to.equal.true;
      });
    });

    context("when the route does not specify headers", () => {
      it("should not set any headers on the response object", () => {
        RequestHandler.setHeaders(res, currentRoute, getHeaders);
        expect(res.set.called).to.equal.false;
      });
    });
  });

  describe("prepareOutput", () => {
    let req, renderRequirements, renderProps, config, envVariables, getHead,
        Entry, webpackIsomorphicTools;

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
          getState: stub().returns({})
        },
        getRoutes: () => routes,
        fileName: "abc"
      };

      renderProps = {
        routes
      };

      config = {};
      envVariables = {bestFood: "burritos"};
      getHead = stub().returns(<div />);
      Entry = class extends React.Component {
        render () {
          return (
            <div>hi</div>
          );
        }
      };
      webpackIsomorphicTools = {
        assets: stub()
      };
    });

    context("without a custom render method", () => {
      context("when the route is an email route", () => {
        let result;
        beforeEach(async () => {
          renderProps.routes[0].email = true;
          result = await RequestHandler.prepareOutput(req, renderRequirements,
            renderProps, config, envVariables, getHead, Entry,
            webpackIsomorphicTools);
        });
        it("should return a responseString", () => {
          expect(result.responseString).to.not.be.undefined;
        });

        it("should not pass head to Index", () => {
          expect(result.rootElement.props.head).to.be.undefined;
        });

        it("should not include react-id attributes in html because it uses renderToStaticMarkup", () => {
          expect(result.rootElement.props.body.props.html).to.not.contain("data-reactid");
        });
      });

      context("when the route is not an email route", () => {
        let result;
        beforeEach(async () => {
          delete renderProps.routes[0].email;
          result = await RequestHandler.prepareOutput(req, renderRequirements,
            renderProps, config, envVariables, getHead, Entry,
            webpackIsomorphicTools);
        });

        it("should return a responseString", () => {
          expect(result.responseString).to.not.be.undefined;
        });

        it("should pass head to Index", () => {
          expect(result.rootElement.props.head).to.not.be.null;
        });

        it("should include react-id attributes in html because it uses renderToString", () => {
          // html is a stream so we have to convert it to a string to test it
          expect(result.rootElement.props.body.props.html).to.contain("data-reactid");
        });
      });
    });

    context("with a custom render method", () => {
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
          renderProps, updatedConfig, envVariables, getHead, Entry,
          webpackIsomorphicTools);
        expect(result.rootElement.props.body.props.html).to.equal("<div>That body!</div>");
      });

      context("not an email", () => {
        beforeEach(async () => {
          delete renderProps.routes[0].email;
          result = await RequestHandler.prepareOutput(req, renderRequirements,
            renderProps, updatedConfig, envVariables, getHead, Entry,
            webpackIsomorphicTools);
        });

        it("should pass headContent to getHead", () => {
          expect(getHead.lastCall.args[2]).to.equal(headJSX);
        });
      });

      context("an email", () => {
        beforeEach(async () => {
          renderProps.routes[0].email = true;
          result = await RequestHandler.prepareOutput(req, renderRequirements,
            renderProps, updatedConfig, envVariables, getHead, Entry,
            webpackIsomorphicTools);
        });

        it("should pass headContent to getHead", async () => {
          expect(result.rootElement.props.head).to.equal(headJSX);
        });
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
      res.writeHead = spy();
      status = 200;
      const responseString = "abc";

      output={responseString};
      cache = {
        set: spy()
      };
      logger = {
        debug: spy()
      };
      currentRoute = {path: "/", docType: "<!FakeDoc>"};
      //streamResponse = spy();
    });

    it("should pass along the status and route Attrs", () => {
      streamResponse = spy();
      RequestHandler.cacheAndRender(req, res, currentRoute, status, output, cache, streamResponse, logger, true);
      const streamArgs = streamResponse.lastCall.args[2];
      expect(streamResponse.calledWith(req, res)).to.be.true;
      expect(streamArgs.status).to.equal(status);
      expect(streamArgs.docType).to.equal("<!FakeDoc>");
    });

    context("when caching is enabled for the currentRoute", () => {
      beforeEach(() => {
        currentRoute.cache = true;
      });

      it("should set the status, string and docType to the cache on the cacheKey", (done) => {
        RequestHandler.cacheAndRender(req, res, currentRoute, status, output, cache, streamResponse, logger, true);
        // wait for next tick since so streams have time to be piped
        setTimeout(() => {
          expect(cache.set.called).to.be.true;
          const key = RequestHandler.getCacheKey(req);
          expect(cache.set.calledWith(key, {status, responseString: "abc", docType: "<!FakeDoc>"})).to.be.true;
          done();
        }, 0);
      });

      context("when cacheTTL is set on the current route", () => {
        beforeEach(() => {
          currentRoute.cacheTTL = 5;
          RequestHandler.cacheAndRender(req, res, currentRoute, status, output, cache, streamResponse, logger, true);
        });

        it("should set cache converting cacheTTL to miliseconds", (done) => {
          // wait for next tick since so streams have time to be piped
          setTimeout(() => {
            expect(cache.set.lastCall.args[2]).to.equal(5000);
            done();
          }, 0);
        });
      });
    });

    context("when caching is not enabled for the currentRoute", () => {
      beforeEach(() => {
        currentRoute.cache = false;
      });

      it("should not call cache.set", (done) => {
        RequestHandler.cacheAndRender(req, res, currentRoute, status, output, cache, streamResponse, logger, true);
        // wait for next tick since so streams have time to be piped
        setTimeout(() => {
          expect(cache.set.called).to.equal(false);
          done();
        }, 0);
      });
    });
  });

  describe("getEmailAttributes", () => {
    context("when the route has an email attribute and no doctype", () => {
      it("should return the email attribute and the default HTML5 doctype", () => {
        const result = RequestHandler.getEmailAttributes({email: true});
        expect(result.email).to.equal.true;
        expect(result.docType).to.equal("<!DOCTYPE html>");
      });
    });

    context("when the route has an email and a doctype", () => {
      it("should return the email attribute and custom docType", () => {
        const result = RequestHandler.getEmailAttributes({email: true, docType: "<!XML>"});
        expect(result.email).to.equal.true;
        expect(result.docType).to.equal("<!XML>");
      });
    });

    context("when the route has no email or doctype", () => {
      it("should return the false for the email and the default HTML5 docType", () => {
        const result = RequestHandler.getEmailAttributes({});
        expect(result.email).to.equal.false;
        expect(result.docType).to.equal("<!DOCTYPE html>");
      });
    });
  });

  describe("enableComponentCaching", () => {
    let mockCache;
    beforeEach(() => {
      mockCache = {
        enableCaching: spy(),
        setCachingConfig: spy()
      };
    });

    context("when it hasn't yet been called", () => {
      context("outside of production", () => {
        it("shouldn't enable caching", () => {
          RequestHandler.enableComponentCaching({}, false, mockCache);
          expect(mockCache.enableCaching.called).to.equal(false);
        });
      });

      context("when no config is set", () => {
        it("should pass `false` to enableComponentCaching", () => {
          RequestHandler.enableComponentCaching(undefined, true, mockCache); // eslint-disable-line no-undefined
          expect(mockCache.enableCaching.calledWith(false)).to.equal(true);
        });
      });

      context("when config is set", () => {
        it("should pass `true` to enableComponentCaching", () => {
          RequestHandler.enableComponentCaching({}, true, mockCache);
          expect(mockCache.enableCaching.calledWith(true)).to.equal(true);
        });

        it("should pass the provided `componentCacheConfig` to setCachingConfig", () => {
          const config = {components: {"Home": {}}};
          RequestHandler.enableComponentCaching(config, true, mockCache);
          expect(mockCache.setCachingConfig.calledWith(config)).to.equal(true);
        });
      });
    });
  });
});

