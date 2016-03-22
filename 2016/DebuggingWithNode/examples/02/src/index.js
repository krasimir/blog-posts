import React from 'react';
import ReactDOM from 'react-dom';
import Component from './Component.jsx';

window.onload = () => {
  ReactDOM.render(
    <Component />,
    document.querySelector('#container')
  );
};
