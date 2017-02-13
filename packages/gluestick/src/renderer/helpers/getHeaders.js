module.exports = (route) => {
  if (!{}.hasOwnProperty.call(route, 'headers')) {
    return null;
  }

  const headersHashOrFunc = route.headers;
  let headers;

  if (typeof headersHashOrFunc === 'function') {
    headers = headersHashOrFunc();
  } else if (typeof headersHashOrFunc === 'object') {
    headers = headersHashOrFunc;
  }

  return headers;
};
