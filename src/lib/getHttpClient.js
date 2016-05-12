import axios from "axios";

/**
 * @param {Object} options axios configuration options
 * @param {Express.Request} [request] optional request object. If provided,
 * headers will be merged
 * https://github.com/mzabriskie/axios#request-config
 * @param {axios} [axios] optionally override axios (used for tests/mocking)
 */
export default function getHttpClient (options, req, axios) {
  if (!req) {
    return axios.create(options);
  }

  const { headers, ...httpConfig } = options;

  // If a request object is provided, 
  return axios.create({
    headers: {
      ...req.headers,
      ...headers
    },
    ...httpConfig
  });
}

