export const SET_STATUS_CODE = "SET_STATUS_CODE";


export function set404StatusCode() {
  return setStatusCode(404);
}

export function setStatusCode(statusCode) {
  return {
    type: SET_STATUS_CODE,
    statusCode: statusCode
  };
}
