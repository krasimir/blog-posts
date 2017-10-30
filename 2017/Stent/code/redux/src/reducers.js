import { LOGIN, LOGIN_SUCCESSFUL, LOGIN_FAILED } from './actions';

const initialState = {
  user: null,
  error: null,
  requestInFlight: false
}

export const Auth = (state = initialState, action) => {
  switch(action.type) {
    case LOGIN:
      return { ...state, requestInFlight: true };
    case LOGIN_SUCCESSFUL:
      return { user: action.payload, error: null, requestInFlight: false };
    case LOGIN_FAILED:
      return { user: null, error: action.payload, requestInFlight: false };
    default:
      return initialState;
  }
}