import { LOGIN, LOGOUT, TRY_AGAIN, LOGIN_SUCCESSFUL, LOGIN_FAILED } from './constants';

export const login = data => ({ type: LOGIN, payload: data });
export const logout = data => ({ type: LOGOUT });
export const tryAgain = () => ({ type: TRY_AGAIN });
export const loginSuccessful = userData => ({ type: LOGIN_SUCCESSFUL, payload: userData });
export const loginFailed = error => ({ type: LOGIN_FAILED, payload: error });