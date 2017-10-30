import { takeLatest, call, put } from 'redux-saga/effects';
import { LOGIN, loginSuccessful, loginFailed } from './actions';
import Auth from './Auth';

export default function * saga() {
  yield takeLatest(LOGIN, function * ({ payload }) {
    try {
      const userData = yield call(Auth.login, payload);
      yield put(loginSuccessful(userData));
    } catch (error) {
      yield put(loginFailed(error));
    }
  });
}