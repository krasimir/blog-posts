const TIMEOUT = 1000;
const USER = { foo: 'bar' };
const ERROR = new Error('Ops, sorry');

export default function Auth() {
  return {
    login({ username, password }) {
      return new Promise(
        (resolve, reject) => setTimeout(
          () => username === '' || password === '' ? reject(USER) : resolve(ERROR),
          TIMEOUT
        ));
    }
  }
}