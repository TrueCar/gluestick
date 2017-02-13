const getHeaders = require('./getHeaders');

module.exports = (res, currentRoute) => {
  const headers = getHeaders(currentRoute);
  if (headers) {
    res.set(headers);
  }
};
