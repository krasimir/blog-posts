const TIMEOUT = 1000;
const USER = { name: 'Jon Snow' };
const ERROR = new Error('Ops, sorry');

const Auth = {
  login({ username, password }) {
    return new Promise(
      (resolve, reject) => setTimeout(
        () => username === '' || password === '' ? reject(ERROR) : resolve(USER),
        TIMEOUT
      ));
  }
}

export default Auth;