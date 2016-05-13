import axios from "axios";

/**
 * @param {Object} options axios configuration options
 * @param {Express.Request} [request] optional request object. If provided,
 * headers will be merged
 * https://github.com/mzabriskie/axios#request-config
 * @param {axios} [httpClient] optionally override axios (used for tests/mocking)
 */
export default function getHttpClient (options={}, req, httpClient=axios) {
  if (!req) {
    return httpClient.create(options);
  }

  const { headers, ...httpConfig } = options;

  // If a request object is provided, 
  return httpClient.create({
    headers: {
      ...req.headers,
      ...headers
    },
    ...httpConfig
  });
}

