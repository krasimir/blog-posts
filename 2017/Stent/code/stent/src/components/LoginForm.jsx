import React from 'react';
import PropTypes from 'prop-types';

export default class LoginForm extends React.Component {
  _submit() {
    this.props.submit({
      username: this.refs.username.value,
      password: this.refs.password.value
    })
  }
  render() {
    return (
      <form>
        <input type='text' ref='username' placeholder='Username' />
        <input type='password' ref='password' placeholder='Password' />
        <button onClick={ () => this._submit() }>Submit</button>
      </form>
    );
  }
}

LoginForm.propTypes = {
  submit: PropTypes.func.isRequired
}