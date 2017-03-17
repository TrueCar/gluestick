/* @flow */

export type SetStatusCode = 'SET_STATUS_CODE';

export type RouteName404NotFound = 'ROUTE_NAME_404_NOT_FOUND';

export type CookieOptions = {
  domain: (string) => string;
  encode: (string) => string;
  expires: (string) => Date;
  httpOnly: () => boolean;
  maxAge: (string) => number;
  path: (string) => string;
  secure: () => boolean;
  signed: () => boolean;
};
