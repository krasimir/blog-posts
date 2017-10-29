import React from 'react';
import PropTypes from 'prop-types';

class Profile extends React.Component {
  constructor(props) {
    super(props);

    this._submitForm = this._submitForm.bind(this);

  }
  _submitForm(event) {
    event.preventDefault();

    const username = this.refs.username.value;
    const password = this.refs.password.value;

    
  }
  _renderLoginForm() {
    return (
      <form>
        <input type='text' ref='username' placeholder='Username' />
        <input type='text' ref='password' placeholder='Password' />
        <button onClick={ this._submitForm }>Submit</button>
      </form>
    );
  }
  render() {
    return this._renderLoginForm();
  }
}

Profile.propTypes = {
  
}

export default Profile;