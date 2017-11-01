import { takeLatest, call, put, select } from 'redux-saga/effects';
import { LOGIN, TRY_AGAIN, loginSuccessful, loginFailed } from './actions';
import { getCredentials } from './selectors';
import Auth from '../services/Auth';

export default function * saga() {
  yield takeLatest([ LOGIN, TRY_AGAIN ], function * () {
    try {
      const credentials = yield select(getCredentials);
      const userData = yield call(Auth.login, credentials);
      yield put(loginSuccessful(userData));
    } catch (error) {
      yield put(loginFailed(error));
    }
  });
}