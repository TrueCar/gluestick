import axios from "axios";

/**
 * @param {Object} options axios configuration options
 * @param {Express.Request} [request] optional request object. If provided,
 * headers will be merged
 * https://github.com/mzabriskie/axios#request-config
 * @param {axios} [httpClient] optionally override axios (used for tests/mocking)
 */
export default function getHttpClient (options={}, req, res, httpClient=axios) {
  const { headers, modifyInstance, ...httpConfig } = options;
  let client;

  // If there is no request object then we are in the browser and we don't need
  // to worry about headers or cookies but we still need to pass options and
  // give developers a chance to modify the instance
  if (!req) {
    client = httpClient.create(httpConfig);

    if (modifyInstance) {
      client = modifyInstance(client);
    }

    return client;
  }

  const protocol = req.secure ? "https://" : "http://";

  // If a request object is provided, then we want to merge the custom headers
  // with the headers that we sent from the browser in the request.
  client = httpClient.create({
    baseURL: protocol + req.headers.host,
    headers: {
      ...req.headers,
      ...headers
    },
    ...httpConfig
  });

  client.interceptors.response.use((response) => {
    const cookiejar = response.headers["set-cookie"];

    if (Array.isArray(cookiejar)) {
      const cookieString = cookiejar.join("; ");

      // Set all of the cookies sent back from server side requests in the initial page load.
      res.header("Set-Cookie", cookieString);

      // Ensure that any subsequent requests are passing the cookies.
      // This is for instances where there is no browser persisting the cookies.
      client.defaults.headers.cookie = cookieString;
    }

    return response;
  });

  // Provide a hook where developers can have early access to the httpClient
  // instance so that they can do things like add interceptors.
  if (modifyInstance) {
    client = modifyInstance(client, res);
  }

  return client;
}
