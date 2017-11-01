export const LOGIN = 'LOGIN';
export const TRY_AGAIN = 'TRY_AGAIN';
export const LOGOUT = 'LOGOUT';
export const LOGIN_SUCCESSFUL = 'LOGIN_SUCCESSFUL';
export const LOGIN_FAILED = 'LOGIN_FAILED';

export const login = data => ({ type: LOGIN, payload: data });
export const logout = data => ({ type: LOGOUT });
export const tryAgain = () => ({ type: TRY_AGAIN });
export const loginSuccessful = userData => ({ type: LOGIN_SUCCESSFUL, payload: userData });
export const loginFailed = error => ({ type: LOGIN_FAILED, payload: error });