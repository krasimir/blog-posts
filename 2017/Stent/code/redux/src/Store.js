import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { Auth } from './reducers';
import saga from './saga';

const sagaMiddleware = createSagaMiddleware();
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  Auth,
  composeEnhancers(applyMiddleware(sagaMiddleware))
);

sagaMiddleware.run(saga)

export default store;