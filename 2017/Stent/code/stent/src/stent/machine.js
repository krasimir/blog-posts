import { Machine } from 'stent';
import { call } from 'stent/lib/helpers';
import Auth from '../services/Auth';
import { CONNECTION_ERROR, VALIDATION_ERROR } from '../services/errors';
import { LOGIN_FORM, LOADING, TRY_AGAIN, WRONG_CREDENTIALS, PROFILE } from './states';

const InitialState = { name: 'login form' };

Machine.create(InitialState, {
  [LOGIN_FORM]: {
    'submit': function * (state, credentials) {
      yield LOADING;
      try {
        const user = yield call(Auth.submit, credentials);

        this.success(user);
      } catch (error) {
        this.error(error);
      }
    }
  },
  [LOADING]: {
    'success': function (state, user) {
      return { name: PROFILE, user };
    },
    'error': function (state, { message }) {
      return message === CONNECTION_ERROR ?
        { name: TRY_AGAIN } : WRONG_CREDENTIALS;
    }
  },
  [TRY_AGAIN]: {
    'try again': function (state) {

    }
  },
  [WRONG_CREDENTIALS]: {

  },
  [PROFILE]: {

  }
});