import React from "react";
import { expect } from "chai";
import { stub, spy } from "sinon";
import * as RequestHandler from "../../../src/lib/server/RequestHandler";
import { Route, Redirect } from "react-router";
import { MISSING_404_TEXT } from "../../../src/lib/server/helpText";
import {
    ROUTE_NAME_404_NOT_FOUND
} from "gluestick-shared";

describe.only("lib/server/RequestHandler", () => {
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

  });

  describe("cacheAndRender", () => {

  });

  describe("getEmailAttributes", () => {

  });
});
