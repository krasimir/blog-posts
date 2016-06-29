import React from 'react';
import Navigation from './Navigation.jsx';

export default class Header extends React.Component {
  render() {
    return (
      <Navigation
        links={ ['home', 'about', 'contacts'] } />
    );
  }
}