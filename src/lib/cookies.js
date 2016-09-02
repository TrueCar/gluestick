const COOKIE_OPTS = {
  domain: v => v,
  encode: v => v,
  expires: v => new Date(v),
  httpOnly: () => true,
  maxAge: v => Number(v),
  path: v => v,
  secure: () => true,
  signed: () => true
};

function Cookie(name=null, value=null, options={}) {
  this.name = name;
  this.value = value;
  this.options = options;
}

Cookie.prototype.toString = function() {
  const keyValues = [`${this.name}=${this.value}`];
  const boolValues = [];

  Object.keys(COOKIE_OPTS).forEach(attribute => {
    const value = this.options[attribute];
    if (typeof(value) === "boolean") {
      boolValues.push(attribute.charAt(0).toUpperCase() + attribute.slice(1));
    }
    else if (typeof(value) !== "undefined") {
      keyValues.push(`${attribute}=${value}`);
    }
  });

  return keyValues.concat(boolValues).join("; ").trim();
};

function camelCase(string) {
  return string.replace(/-([a-z])/ig, (match, l) => {
    return l.toUpperCase();
  });
}

export function parse(cookieString) {
  const cookies = [];
  let c = new Cookie();

  cookieString.split(";").forEach(s => {
    const m = new RegExp("([a-zA-Z\-\_]+)=([a-zA-Z0-9\%\-\_\=\/\.\,\:\\s]+)", "g").exec(s.trim());

    let k = s.trim(), v;

    if (m !== null) {
      [k, v] = m.splice(1);
    }

    const optionName = camelCase(k.charAt(0).toLowerCase() + k.slice(1));

    if (COOKIE_OPTS.hasOwnProperty(optionName)) {
      const value = COOKIE_OPTS[optionName](v);
      c.options[optionName] = value;
    }
    else {
      if (c.name !== null) {
        cookies.push(c);
        c = new Cookie();
      }
      c.name = k;
      c.value = v;
    }
  });
  cookies.push(c);

  return cookies;
}

export function merge(oldCookieString, newCookieString) {
  const oldCookieJar = !!oldCookieString ? parse(oldCookieString) : [];
  const newCookieJar = parse(newCookieString);

  const merged = [];
  oldCookieJar.forEach(cookie => {
    if (!newCookieJar.some(c => c.name === cookie.name)) {
      merged.push(cookie);
    }
  });
  return merged.concat(newCookieJar).join("; ").trim();
}
