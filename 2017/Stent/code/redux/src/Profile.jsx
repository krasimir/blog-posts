import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { login } from './actions';

class Profile extends React.Component {
  constructor(props) {
    super(props);

    this._submitForm = this._submitForm.bind(this);
  }
  _submitForm(event) {
    event.preventDefault();
    this.props.login({
      username: this.refs.username.value,
      password: this.refs.password.value
    });
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
  _renderLoadingScreen() {
    return <p className='tac'>Loading. please wait.</p>;
  }
  render() {
    const { isRequestInFlight } = this.props;

    if (isRequestInFlight) {
      return this._renderLoadingScreen();
    }
    return this._renderLoginForm();
  }
}

Profile.propTypes = {
  login: PropTypes.func.isRequired,
  isRequestInFlight: PropTypes.bool.isRequired
}

const mapStateToProps = state => ({
  isRequestInFlight: state.requestInFlight
});

const mapDispatchToProps = dispatch => ({
  login: data => dispatch(login(data))
});

export default connect(mapStateToProps, mapDispatchToProps)(Profile);