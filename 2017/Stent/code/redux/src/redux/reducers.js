import { LOGIN, LOGOUT, TRY_AGAIN, LOGIN_SUCCESSFUL, LOGIN_FAILED } from './constants';

const initialState = {
  user: null,
  error: null,
  requestInFlight: false,
  credentials: null
}

export const Auth = (state = initialState, { type, payload }) => {
  switch(type) {
    case LOGIN:
      return {
        ...state,
        requestInFlight: true,
        credentials: payload
      };
    case LOGIN_SUCCESSFUL:
      return {
        user: payload,
        error: null,
        requestInFlight: false,
        credentials: null
      };
    case LOGIN_FAILED:
      return {
        ...state,
        error: payload,
        requestInFlight: false
      };
    case LOGOUT:
      return initialState;
    case TRY_AGAIN:
      return {
        ...state,
        requestInFlight: true
      }
    default:
      return initialState;
  }
}