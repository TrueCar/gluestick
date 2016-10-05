/*global beforeEach describe it*/
import { expect } from "chai";
import getHeaders from "../../../src/lib/server/getHeaders";

describe("lib/server/getHeaders", () => {

  it("returns null if no headers provided", () => {
    expect(getHeaders({})).to.be.null;
  });

  it("returns the headers object provided to the route", () => {
    const headers = {
      "cache-control": "public, max-age: 50000"
    };
    expect(getHeaders({headers})).to.deep.equal(headers);
  });

  it("returns headers provided via a callback on the route", () => {
    const headers = {
      "cache-control": "public, max-age: 50000"
    };
    const cb = () => headers;
    expect(getHeaders({headers: cb})).to.deep.equal(headers);
  });

});
