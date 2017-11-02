import { Machine } from 'stent';
import { LOGIN_FORM } from './states';
import transitions from './transitions';

const InitialState = { name: LOGIN_FORM };
const machine = Machine.create(
  'LoginFormSM',
  { state: InitialState, transitions }
);