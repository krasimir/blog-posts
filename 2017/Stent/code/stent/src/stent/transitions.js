import { call } from 'stent/lib/helpers';
import { CONNECTION_ERROR, VALIDATION_ERROR } from '../services/errors';
import Auth from '../services/Auth';
import { LOGIN_FORM, LOADING, TRY_AGAIN, WRONG_CREDENTIALS, PROFILE } from './states';

const submit = function * (state, credentials) {
  yield LOADING;
  try {
    const user = yield call(Auth.login, credentials);

    this.success(user);
  } catch (error) {
    this.error(error, credentials);
  }
};
const success = function (state, user) {
  return { name: PROFILE, user };
};
const error = function (state, error, credentials) {
  console.log(error, error.message);
  return error.message === CONNECTION_ERROR ?
    { name: TRY_AGAIN, credentials } :
    { name: WRONG_CREDENTIALS, error };
};
const tryAgain = function * ({ credentials }) {
  submit(credentials);
}

const transitions = {
  [LOGIN_FORM]: {
    'submit': submit
  },
  [LOADING]: {
    'success': success,
    'error': error
  },
  [TRY_AGAIN]: {
    'try again': tryAgain
  },
  [WRONG_CREDENTIALS]: LOGIN_FORM,
  [PROFILE]: {
    'view profile': () => {},
    'logout': LOGIN_FORM
  }
};

export default transitions;