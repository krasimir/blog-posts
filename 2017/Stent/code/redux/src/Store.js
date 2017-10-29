import { combineReducers, createStore } from 'redux'
import { Auth } from './reducers';

const store = createStore(
  Auth,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;