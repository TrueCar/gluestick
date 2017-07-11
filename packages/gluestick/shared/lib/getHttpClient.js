/* @flow */

import axios from 'axios';
import { merge, parse } from './cookies';

/**
 * @param {Object} options axios configuration options
 * @param {Express.Request} [request] optional request object. If provided,
 * headers will be merged
 * https://github.com/mzabriskie/axios#request-config
 * @param {axios} [httpClient] optionally override axios (used for tests/mocking)
 */
export default function getHttpClient(
  options: Object = {},
  req: Object,
  res: Object,
  httpClient: () => Object = axios,
) {
  const {
    headers,
    modifyInstance,
    ...httpConfig
  }: { headers: Object, modifyInstance: Function } = options;
  let client;

  // If there is no request object then we are in the browser and we don't need
  // to worry about cookies but we still need to pass headers and options and
  // give developers a chance to modify the instance
  if (!req) {
    const defaultHeaders: Object = httpClient.defaults.headers || {};
    client = httpClient.create({
      headers: { ...defaultHeaders, ...headers },
      ...httpConfig,
    });

    if (modifyInstance) {
      client = modifyInstance(client);
    }

    return client;
  }

  const protocol: string = req.secure ? 'https://' : 'http://';

  // If a request object is provided, then we want to merge the custom headers
  // with the headers that we sent from the browser in the request.
  client = httpClient.create({
    baseURL: protocol + req.headers.host,
    headers: {
      ...req.headers,
      ...headers,
    },
    ...httpConfig,
  });

  const outgoingCookies: string = req.headers.cookie;
  let incomingCookies: string = '';

  // Send outgoing cookies received from the browser in each outgoing request
  // along with any new cookies that we have received in API calls to fullfill
  // this request.
  client.interceptors.request.use((config: Object) => {
    // convert incoming cookies to outgoing cookies, strip off the options with
    // `toString(false)`
    const newCookies: string = parse(incomingCookies)
      .map(c => c.toString(false))
      .join('; ');
    const output: Object = {
      ...config,
      headers: {
        ...config.headers,
        cookie: merge(
          outgoingCookies,
          merge(config.headers.cookie, newCookies),
        ),
      },
    };

    return output;
  });

  client.interceptors.response.use(response => {
    const cookiejar: ?(string[]) = response.headers['set-cookie'];

    if (Array.isArray(cookiejar)) {
      const cookieString: string = cookiejar.join('; ');

      // @TODO: This will append all of the cookies sent back from server side
      // requests in the initial page load. There is a potential issue if you are
      // hitting 3rd party APIs. If site A sets a cookie and site B sets a cookie
      // with the same key, then it will overwrite A's cookie and possibly create
      // undesired effects. Currently, the suggested solution for dealing with
      // this problem is to make the API requests to A or B in the browser and
      // not in gsBeforeRoute for apps where that is an issue.
      const mergedCookieString: string = merge(incomingCookies, cookieString);
      const cookies: Object[] = parse(mergedCookieString);
      res.removeHeader('Set-Cookie');
      cookies.forEach((cookie: Object) => {
        res.append('Set-Cookie', cookie.toString());
      });

      // Ensure that any subsequent requests are passing the cookies.
      // This is for instances where there is no browser persisting the
      // cookies.
      //
      // @NOTE: This used to use the axios instance.defaults.headers… but it
      // turns out axios recycles that object and cookies were being leaked
      // across requests from different users! Now we just use our own string
      // and add it using the request interceptor.
      incomingCookies = mergedCookieString;
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
