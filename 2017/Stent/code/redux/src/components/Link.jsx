import React from 'react';
import PropTypes from 'prop-types';

export default class Link extends React.Component {
  _handleClick(event) {
    event.preventDefault();
    this.props.onClick();
  }
  render() {
    return <a href="#" onClick={ event => this._handleClick(event) }>{ this.props.children }</a>
  }
}

Link.propTypes = {
  onClick: PropTypes.func.isRequired
}