import { CONNECTION_ERROR, VALIDATION_ERROR } from './errors';

const TIMEOUT = 1000;
const USER = { name: 'Jon Snow' };

const Auth = {
  login({ username, password }) {
    return new Promise(
      (resolve, reject) => setTimeout(function () {
        if (username === '' || password === '') {
          return reject(new Error(VALIDATION_ERROR));
        } else if (username === 'no way' && password === 'no way') {
          return reject(new Error(CONNECTION_ERROR));
        }
        resolve(USER);
      }, TIMEOUT)
    );
  }
}

export default Auth;