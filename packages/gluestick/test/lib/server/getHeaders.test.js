import getHeaders from "../../../src/lib/server/getHeaders";

describe("lib/server/getHeaders", () => {

  it("returns null if no headers provided", () => {
    expect(getHeaders({})).toBeNull();
  });

  it("returns the headers object provided to the route", () => {
    const headers = {
      "cache-control": "public, max-age: 50000"
    };
    expect(getHeaders({headers})).toEqual(headers);
  });

  it("returns headers provided via a callback on the route", () => {
    const headers = {
      "cache-control": "public, max-age: 50000"
    };
    const cb = () => headers;
    expect(getHeaders({headers: cb})).toEqual(headers);
  });

});
