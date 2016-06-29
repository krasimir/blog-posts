import React from 'react';

export default class Navigation extends React.Component {
  render() {
    return (
      <ul>
        { this.props.links.map((link, i) => this._renderLink(link, i))}
      </ul>
    )
  }
  _renderLink(label, index) {
    return <li key={ index }><a href={ '#' + label }>{ label }</a></li>;
  }
}