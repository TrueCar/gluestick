import axios from "axios";

/**
 * @param {Object} options axios configuration options
 * @param {Express.Request} [request] optional request object. If provided,
 * headers will be merged
 * https://github.com/mzabriskie/axios#request-config
 * @param {axios} [httpClient] optionally override axios (used for tests/mocking)
 */
export default function getHttpClient (options={}, req, serverResponse, httpClient=axios) {
  if (!req) {
    return httpClient.create(options);
  }

  const { headers, ...httpConfig } = options;
  const protocol = req.secure ? "https://" : "http://";

  // If a request object is provided, then we want to merge the custom headers
  // with the headers that we sent from the browser in the request.
  const client = httpClient.create({
    baseURL: protocol + req.headers.host,
    headers: {
      ...req.headers,
      ...headers
    },
    ...httpConfig
  });

  client.interceptors.response.use((response) => {
    // @TODO: This will append all of the cookies sent back from server side
    // requests in the initial page load. There is a potential issue if you are
    // hitting 3rd party APIs. If site A sets a cookie and site B sets a cookie
    // with the same key, then it will overwrite A's cookie and possibly create
    // undesired effects. Currently, the suggested solution for dealing with
    // this problem is to make the API requests to A or B in the browser and
    // not in gsBeforeRoute for apps where that is an issue.
    serverResponse.append("Set-Cookie", response.headers["set-cookie"]);
    return response;
  });

  return client;
}

