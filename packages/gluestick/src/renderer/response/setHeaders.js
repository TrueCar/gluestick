/* @flow */
import type { Response } from '../../types';

const getHeaders = require('./getHeaders');

module.exports = (res: Response, currentRoute: Object): void => {
  const headers = getHeaders(currentRoute);
  if (headers) {
    res.set(headers);
  }
};
