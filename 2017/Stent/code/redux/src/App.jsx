import "babel-polyfill";
import React from 'react';
import ReactDOM from 'react-dom';
import Widget from './components/Widget.jsx';
import { Provider } from 'react-redux';

import store from './Store';

class App extends React.Component {
  render() {
    return (
      <main>
        <Widget />
      </main>
    );
  }
}

ReactDOM.render(
  <Provider store={ store }><App /></Provider>,
  document.querySelector('#content')
);
