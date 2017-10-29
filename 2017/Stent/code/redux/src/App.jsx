import React from 'react';
import ReactDOM from 'react-dom';
import Profile from './Profile.jsx';

class App extends React.Component {
  render() {
    return (
      <main>
        <Profile />
      </main>
    );
  }
}

ReactDOM.render(<App />, document.querySelector('#content'));
