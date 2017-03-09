import { SET_STATUS_CODE } from './actions';

const INITIAL_STATE = {};

/**
 * This reducer handles GlueStick server-side actions.
 *
 * It also exists to prevent an error when no other reducers have been added.
 */
export default function _gluestick(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SET_STATUS_CODE: {
      return {
        ...state,
        statusCode: action.statusCode,
      };
    }
    default:
      return state;
  }
}
