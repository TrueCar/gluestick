import { merge, parse } from '../cookies';

describe('lib/cookies', () => {
  describe('parse', () => {
    it("parses a cookie's name and value from a string", () => {
      const cookieJar = parse('foo=barbaz==');
      expect(cookieJar.length).toEqual(1);
      expect(cookieJar[0].name).toEqual('foo');
      expect(cookieJar[0].value).toEqual('barbaz==');
    });

    it('parses a cookie containing an empty value', () => {
      const cookieJar = parse('foo=;');
      expect(cookieJar[0].name).toEqual('foo');
      expect(cookieJar[0].value).toEqual('');
    });

    it("parses a cookie's name containing alpha-numeric characters from a string", () => {
      const cookieJar = parse('foo0123foo=barbaz==');
      expect(cookieJar.length).toEqual(1);
      expect(cookieJar[0].name).toEqual('foo0123foo');
      expect(cookieJar[0].value).toEqual('barbaz==');
    });

    it("parses a cookie's path from a string", () => {
      const cookieJar = parse('foo=barbaz==; path=/');
      expect(cookieJar.length).toEqual(1);
      const cookie = cookieJar[0];
      expect(cookie.name).toEqual('foo');
      expect(cookie.options.path).toEqual('/');
    });

    it("parses a cookie's date from a string", () => {
      const cookieJar = parse(
        'foo=true; expires=Fri, 31 Dec 9999 23:59:59 GMT',
      );
      expect(cookieJar.length).toEqual(1);
      const cookie = cookieJar[0];
      expect(cookie.name).toEqual('foo');
      expect(cookie.options.expires.getTime()).toEqual(
        new Date('Fri, 31 Dec 9999 23:59:59 GMT').getTime(),
      );
    });

    it("parses a cookie's domain from a string", () => {
      const cookieJar = parse('foo=true; domain=subdomain.example.com');
      expect(cookieJar.length).toEqual(1);
      const cookie = cookieJar[0];
      expect(cookie.name).toEqual('foo');
      expect(cookie.options.domain).toEqual('subdomain.example.com');
    });

    it("parses a cookie's max-age from a string", () => {
      const cookieJar = parse('foo=bar; max-age=86400');
      expect(cookieJar.length).toEqual(1);
      const cookie = cookieJar[0];
      expect(cookie.name).toEqual('foo');
      expect(cookie.options.maxAge).toEqual(86400);
    });

    it("parses a cookie's httpOnly option from a string", () => {
      const cookieJar = parse('foo=barbaz==; path=/; HttpOnly');
      expect(cookieJar.length).toEqual(1);
      expect(cookieJar[0].name).toEqual('foo');
      expect(cookieJar[0].options.httpOnly).toEqual(true);
    });

    it('parses multiple cookies from a string', () => {
      const cookieJar = parse('foo=barbaz==; path=/xyz; a=bcdef');
      expect(cookieJar.length).toEqual(2);
      expect(cookieJar[0].name).toEqual('foo');
      expect(cookieJar[0].value).toEqual('barbaz==');
      expect(cookieJar[0].options.path).toEqual('/xyz');
      expect(cookieJar[1].name).toEqual('a');
      expect(cookieJar[1].value).toEqual('bcdef');
    });
  });

  describe('merge', () => {
    it('merges cookie strings containing unique cookies', () => {
      const oldCookies = 'foo=baz==';
      const newCookies =
        'some-thing-a=true; path=/; some_thing_b=false; path=/; some_thing_c=hi; path=/; HttpOnly';
      const result = merge(oldCookies, newCookies);
      expect(result).toEqual(
        'foo=baz%3D%3D; some-thing-a=true; path=/; some_thing_b=false; path=/; some_thing_c=hi; path=/; HttpOnly',
      );
    });

    it('uses the newest value of a cookie if one exists', () => {
      const oldCookies = 'foo=baz==';
      const newCookies = 'some-thing-a=true; path=/; foo=hi; path=/';
      const result = merge(oldCookies, newCookies);
      expect(result).toEqual('some-thing-a=true; path=/; foo=hi; path=/');
    });

    it('handles invalid old cookies', () => {
      const newCookies = 'some-thing-a=true; path=/; foo=hi; path=/';
      expect(merge(undefined, newCookies)).toEqual(newCookies); // eslint-disable-line no-undefined
      expect(merge(null, newCookies)).toEqual(newCookies);
      expect(merge('', newCookies)).toEqual(newCookies);
    });

    it('handles invalid new cookies', () => {
      const oldCookies = 'foo=baz==';
      expect(merge(oldCookies, undefined)).toEqual('foo=baz%3D%3D'); // eslint-disable-line no-undefined
      expect(merge(oldCookies, null)).toEqual('foo=baz%3D%3D');
      expect(merge(oldCookies, '')).toEqual('foo=baz%3D%3D');
    });
  });

  describe('Cookie => toString', () => {
    it('should return a cookie string with option attributes when incoming', () => {
      const cookies = parse(
        'some-thing-a=true; path=/; foo=hi; path=/ HttpOnly',
      );
      expect(`${cookies[0]}`).toEqual('some-thing-a=true; path=/');
      expect(`${cookies[1]}`).toEqual('foo=hi; path=/ HttpOnly');
    });

    it('should return a cookie string without option attributes when outgoing', () => {
      const cookies = parse(
        'some-thing-a=true; path=/; foo=hi; path=/ HttpOnly',
      );
      expect(cookies[0].toString(false)).toEqual('some-thing-a=true');
      expect(cookies[1].toString(false)).toEqual('foo=hi');
    });

    it("returns an empty string if cookie value doesn't have name", () => {
      const cookies = parse('');
      expect(cookies[0].toString()).toEqual('');
    });
  });
});
