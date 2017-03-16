const COOKIE_OPTS = {
  domain: v => v,
  encode: v => v,
  expires: v => new Date(v),
  httpOnly: () => true,
  maxAge: v => Number(v),
  path: v => v,
  secure: () => true,
  signed: () => true,
};

function Cookie(name = null, value = null, options = {}) {
  this.name = name;
  this.value = value;
  this.options = options;
}

Cookie.prototype.toString = function toString(incoming = true) {
  if (!this.name) {
    return '';
  }

  const kvs = [`${this.name}=${encodeURIComponent(this.value)}`];
  const bvs = [];

  if (!incoming) {
    return kvs[0];
  }

  Object.keys(COOKIE_OPTS).forEach(attr => {
    const value = this.options[attr];

    if (typeof (value) === 'boolean') {
      bvs.push(attr.charAt(0).toUpperCase() + attr.slice(1));
    } else if (typeof (value) !== 'undefined') {
      kvs.push(`${attr}=${value}`);
    }
  });

  return kvs.concat(bvs).join('; ').trim();
};

function camelCase(string) {
  return string.replace(/-([a-z])/ig, (match, l) => {
    return l.toUpperCase();
  });
}

export function parse(cookieString) {
  const cookies = [];
  let c = new Cookie();

  cookieString.split(';').forEach(s => {
    const m = /([\w%-.]+)=(.*)/g.exec(s.trim());
    let k = s.trim();
    let v;

    if (m !== null) {
      [k, v] = m.splice(1);
    }

    const optionName = camelCase(k.charAt(0).toLowerCase() + k.slice(1));

    if (Object.hasOwnProperty.call(COOKIE_OPTS, optionName)) {
      const value = COOKIE_OPTS[optionName](v);
      c.options[optionName] = value;
    } else {
      if (c.name !== null) {
        cookies.push(c);
        c = new Cookie();
      }
      c.name = k;
      c.value = decodeURIComponent(v);
    }
  });
  cookies.push(c);

  return cookies;
}

export function merge(oldCookieString, newCookieString) {
  const oldCookieJar = oldCookieString ? parse(oldCookieString) : [];
  const newCookieJar = newCookieString ? parse(newCookieString) : [];

  const merged = [];
  oldCookieJar.forEach(cookie => {
    if (!newCookieJar.some(c => c.name === cookie.name)) {
      merged.push(cookie);
    }
  });
  return merged.concat(newCookieJar).join('; ').trim();
}
