/* @flow */

import type { CookieOptions } from '../types';

const COOKIE_OPTS: CookieOptions = {
  domain: v => v,
  encode: v => v,
  expires: v => new Date(v),
  httpOnly: () => true,
  maxAge: v => Number(v),
  path: v => v,
  secure: () => true,
  signed: () => true,
};

function Cookie(
  name: ?string = null,
  value: ?string = null,
  options: ?Object = {},
) {
  this.name = name;
  this.value = value;
  this.options = options;
}

// $FlowFixMe
Cookie.prototype.toString = function toString(incoming: boolean = true) {
  if (!this.name) {
    return '';
  }

  const kvs: string[] = [`${this.name}=${encodeURIComponent(this.value)}`];
  const bvs: string[] = [];

  if (!incoming) {
    return kvs[0];
  }

  Object.keys(COOKIE_OPTS).forEach((attr: string) => {
    const value: ?string | ?boolean = this.options[attr];

    if (typeof value === 'boolean') {
      bvs.push(attr.charAt(0).toUpperCase() + attr.slice(1));
    } else if (typeof value !== 'undefined' && value) {
      kvs.push(`${attr}=${value}`);
    }
  });

  return kvs.concat(bvs).join('; ').trim();
};

function camelCase(string: string): string {
  return string.replace(/-([a-z])/gi, (match, l) => {
    return l.toUpperCase();
  });
}

export function parse(cookieString: string): Object[] {
  const cookies: Object[] = [];
  let c: Cookie = new Cookie();

  cookieString.split(';').forEach(s => {
    const m = /([\w%-.]+)=(.*)/g.exec(s.trim());
    let k: string = s.trim();
    let v: ?string;

    if (m !== null) {
      [k, v] = m.splice(1);
    }

    const optionName: string = camelCase(
      k.charAt(0).toLowerCase() + k.slice(1),
    );

    if (Object.hasOwnProperty.call(COOKIE_OPTS, optionName)) {
      const value: number | string | boolean | Date = COOKIE_OPTS[optionName](
        v,
      );
      c.options[optionName] = value;
    } else {
      if (c.name !== null) {
        cookies.push(c);
        c = new Cookie();
      }
      c.name = k;
      c.value = v && decodeURIComponent(v);
    }
  });
  cookies.push(c);

  return cookies;
}

export function merge(
  oldCookieString: string,
  newCookieString: string,
): string {
  const oldCookieJar: Object[] = oldCookieString ? parse(oldCookieString) : [];
  const newCookieJar: Object[] = newCookieString ? parse(newCookieString) : [];

  const merged: Object[] = [];
  oldCookieJar.forEach((cookie: Object) => {
    if (!newCookieJar.some((c: Object) => c.name === cookie.name)) {
      merged.push(cookie);
    }
  });
  return merged.concat(newCookieJar).join('; ').trim();
}
