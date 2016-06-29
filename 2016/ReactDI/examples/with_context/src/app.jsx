import React from 'react';
import ReactDOM from 'react-dom';
import Header from './Header.jsx';

class App extends React.Component {
  render() {
    return (
      <section>
        <Header />
        <hr />
        <h1>Hello world</h1>
      </section>
    );
  }
};

ReactDOM.render(<App />, document.querySelector('#container'));


