import React from "react";
import { expect } from "chai";
import { stub, spy } from "sinon";
import * as RequestHandler from "../../../src/lib/server/RequestHandler";
import { Route, Redirect } from "react-router";
import { MISSING_404_TEXT } from "../../../src/lib/server/helpText";

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

  });

  describe("getCurrentRoute", () => {

  });

  describe("getStatusCode", () => {

  });

  describe("setHeaders", () => {

  });

  describe("prepareOutput", () => {

  });

  describe("cacheAndRender", () => {

  });

  describe("getEmailAttributes", () => {

  });
});
