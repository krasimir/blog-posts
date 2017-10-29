import React from 'react';
import ReactDOM from 'react-dom';
import Profile from './Profile.jsx';
import { Provider } from 'react-redux';

import store from './Store';

class App extends React.Component {
  render() {
    return (
      <main>
        <Profile />
      </main>
    );
  }
}

ReactDOM.render(
  <Provider store={ store }><App /></Provider>,
  document.querySelector('#content')
);
