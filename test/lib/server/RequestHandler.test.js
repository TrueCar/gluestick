import { expect } from "chai";
import { stub, spy } from "sinon";
import * as RequestHandler from "../../../src/lib/server/RequestHandler";

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

  });

  describe("redirect", () => {

  });

  describe("renderNotFound", () => {

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
