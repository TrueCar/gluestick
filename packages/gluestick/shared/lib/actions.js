/* @flow */

import type { SetStatusCode } from '../types';

type SetStatusCodeAction = {
  type: SetStatusCode,
  statusCode: number,
};

export const SET_STATUS_CODE: SetStatusCode = 'SET_STATUS_CODE';

export function set404StatusCode(): SetStatusCodeAction {
  return setStatusCode(404);
}

export function setStatusCode(statusCode: number): SetStatusCodeAction {
  return {
    type: SET_STATUS_CODE,
    statusCode,
  };
}
