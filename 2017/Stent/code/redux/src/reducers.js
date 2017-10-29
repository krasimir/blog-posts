import { LOGIN } from './actions';

const initialState = {
  user: null,
  error: null,
  requestInFlight: false
}

export const Auth = (state = initialState, action) => {
  switch(action.type) {
    case LOGIN:
      return { ...state, requestInFlight: true };
    default:
      return initialState;
  }
}