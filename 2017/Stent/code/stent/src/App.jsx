import "babel-polyfill";
import React from 'react';
import ReactDOM from 'react-dom';
import './stent/machine';
import Widget from './components/Widget.jsx';

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
  <App />,
  document.querySelector('#content')
);
