import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { login } from './actions';

class Profile extends React.Component {
  constructor(props) {
    super(props);

    this._submit = this._submit.bind(this);
    this._tryAgain = this._tryAgain.bind(this);
    this._credentials = null;
  }
  _getCredentials() {
    return this._credentials = {
      username: this.refs.username.value,
      password: this.refs.password.value
    };
  }
  _submit(event) {
    event.preventDefault();
    this.props.login(this._getCredentials());
  }
  _tryAgain(event) {
    event.preventDefault();
    this.props.login(this._credentials);
  }
  _renderLoginForm() {
    return (
      <form>
        <input type='text' ref='username' placeholder='Username' />
        <input type='password' ref='password' placeholder='Password' />
        <button onClick={ this._submit }>Submit</button>
      </form>
    );
  }
  _renderLoadingScreen() {
    return <p className='tac'>Loading. please wait.</p>;
  }
  _renderProfile() {
    return (
      <div>
        Welcome, { this.props.name }
        <hr />
        <a href="#">Profile</a><br />
        <a href="#">Log out</a>
      </div>
    );
  }
  _renderError() {
    return (
      <div className='tac'>
        Ops ...<br />
        <a href="#" onClick={ this._tryAgain }>Try again</a>
      </div>
    );
  }
  render() {
    const { isRequestInFlight, isSuccessful, isFailed } = this.props;

    if (isRequestInFlight) {
      return this._renderLoadingScreen();
    } else if (isSuccessful) {
      return this._renderProfile();
    } else if (isFailed) {
      return this._renderError();
    }
    return this._renderLoginForm();
  }
}

Profile.propTypes = {
  login: PropTypes.func,
  tryAgain: PropTypes.func,
  isRequestInFlight: PropTypes.bool,
  isSuccessful: PropTypes.bool,
  isFailed: PropTypes.bool,
  name: PropTypes.string
}

const mapStateToProps = state => ({
  isRequestInFlight: state.requestInFlight,
  isSuccessful: state.user !== null,
  isFailed: state.error !== null,
  name: state.user ? state.user.name : null
});

const mapDispatchToProps = dispatch => ({
  login: data => dispatch(login(data))
});

export default connect(mapStateToProps, mapDispatchToProps)(Profile);