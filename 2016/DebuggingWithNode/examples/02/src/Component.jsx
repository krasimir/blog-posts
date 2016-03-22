import React from 'react';

class Component extends React.Component {
  constructor(props) {
    super(props);

    this.state = { text: '' };
  }
  render() {
    return (
      <div>
        <input
          className='qa-input'
          type='text'
          ref='input'
          defaultValue={ this.state.text }
          onChange={ this._handleInput.bind(this) } />
        <h1>{ this.state.text }</h1>
      </div>
    );
  }
  _handleInput() {
    this.setState({
      text: this.refs.input.value.toUpperCase()
    });
  }
};

export default Component;
