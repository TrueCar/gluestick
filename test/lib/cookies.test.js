import { merge, parse } from "../../src/lib/cookies";
import { expect } from "chai";

describe("lib/cookies", () => {
  describe("parse", () => {
    it("parses a cookie's name and value from a string", () => {
      const cookieJar = parse("foo=barbaz==");
      expect(cookieJar.length).to.equal(1);
      expect(cookieJar[0].name).to.equal("foo");
      expect(cookieJar[0].value).to.equal("barbaz==");
    });

    it("parses a cookie containing an empty value", () => {
      const cookieJar = parse("foo=;");
      expect(cookieJar[0].name).to.equal("foo");
      expect(cookieJar[0].value).to.equal("");
    });

    it("parses a cookie's name containing alpha-numeric characters from a string", () => {
      const cookieJar = parse("foo0123foo=barbaz==");
      expect(cookieJar.length).to.equal(1);
      expect(cookieJar[0].name).to.equal("foo0123foo");
      expect(cookieJar[0].value).to.equal("barbaz==");
    });

    it("parses a cookie's path from a string", () => {
      const cookieJar = parse("foo=barbaz==; path=/");
      expect(cookieJar.length).to.equal(1);
      const cookie = cookieJar[0];
      expect(cookie.name).to.equal("foo");
      expect(cookie.options.path).to.equal("/");
    });

    it("parses a cookie's date from a string", () => {
      const cookieJar = parse("foo=true; expires=Fri, 31 Dec 9999 23:59:59 GMT");
      expect(cookieJar.length).to.equal(1);
      const cookie = cookieJar[0];
      expect(cookie.name).to.equal("foo");
      expect(cookie.options.expires.getTime()).to.equal(new Date("Fri, 31 Dec 9999 23:59:59 GMT").getTime());
    });

    it("parses a cookie's domain from a string", () => {
      const cookieJar = parse("foo=true; domain=subdomain.example.com");
      expect(cookieJar.length).to.equal(1);
      const cookie = cookieJar[0];
      expect(cookie.name).to.equal("foo");
      expect(cookie.options.domain).to.equal("subdomain.example.com");
    });

    it("parses a cookie's max-age from a string", () => {
      const cookieJar = parse("foo=bar; max-age=86400");
      expect(cookieJar.length).to.equal(1);
      const cookie = cookieJar[0];
      expect(cookie.name).to.equal("foo");
      expect(cookie.options.maxAge).to.equal(86400);
    });

    it("parses a cookie's httpOnly option from a string", () => {
      const cookieJar = parse("foo=barbaz==; path=/; HttpOnly");
      expect(cookieJar.length).to.equal(1);
      expect(cookieJar[0].name).to.equal("foo");
      expect(cookieJar[0].options.httpOnly).to.equal(true);
    });

    it("parses multiple cookies from a string", () => {
      const cookieJar = parse("foo=barbaz==; path=/xyz; a=bcdef");
      expect(cookieJar.length).to.equal(2);
      expect(cookieJar[0].name).to.equal("foo");
      expect(cookieJar[0].value).to.equal("barbaz==");
      expect(cookieJar[0].options.path).to.equal("/xyz");
      expect(cookieJar[1].name).to.equal("a");
      expect(cookieJar[1].value).to.equal("bcdef");
    });
  });

  describe("merge", () => {
    it("merges cookie strings containing unique cookies", () => {
      const oldCookies = "foo=baz==";
      const newCookies = "some-thing-a=true; path=/; some_thing_b=false; path=/; some_thing_c=hi; path=/; HttpOnly";
      const result = merge(oldCookies, newCookies);
      expect(result).to.equal("foo=baz%3D%3D; some-thing-a=true; path=/; some_thing_b=false; path=/; some_thing_c=hi; path=/; HttpOnly");
    });

    it("uses the newest value of a cookie if one exists", () => {
      const oldCookies = "foo=baz==";
      const newCookies = "some-thing-a=true; path=/; foo=hi; path=/";
      const result = merge(oldCookies, newCookies);
      expect(result).to.equal("some-thing-a=true; path=/; foo=hi; path=/");
    });

    it("handles invalid old cookies", () => {
      const newCookies = "some-thing-a=true; path=/; foo=hi; path=/";
      expect(merge(undefined, newCookies)).to.equal(newCookies); // eslint-disable-line no-undefined
      expect(merge(null, newCookies)).to.equal(newCookies);
      expect(merge("", newCookies)).to.equal(newCookies);
    });

    it("handles invalid new cookies", () => {
      const oldCookies = "foo=baz==";
      expect(merge(oldCookies, undefined)).to.equal("foo=baz%3D%3D"); // eslint-disable-line no-undefined
      expect(merge(oldCookies, null)).to.equal("foo=baz%3D%3D");
      expect(merge(oldCookies, "")).to.equal("foo=baz%3D%3D");
    });
  });

  describe("Cookie => toString", () => {
    it("should return a cookie string with option attributes when incoming", () => {
      const cookies = parse("some-thing-a=true; path=/; foo=hi; path=/ HttpOnly");
      expect(`${cookies[0]}`).to.equal("some-thing-a=true; path=/");
      expect(`${cookies[1]}`).to.equal("foo=hi; path=/ HttpOnly");
    });

    it("should return a cookie string without option attributes when outgoing", () => {
      const cookies = parse("some-thing-a=true; path=/; foo=hi; path=/ HttpOnly");
      expect(cookies[0].toString(false)).to.equal("some-thing-a=true");
      expect(cookies[1].toString(false)).to.equal("foo=hi");
    });

    it("returns an empty string if cookie value doesn't have name", () => {
      const cookies = parse("");
      expect(cookies[0].toString()).to.equal("");
    }); 
  });
});
