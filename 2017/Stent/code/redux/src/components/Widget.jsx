import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { login, tryAgain } from './actions';
import LoginForm from './LoginForm.jsx';
import Profile from './Profile.jsx';
import Error from './Error.jsx';

class Widget extends React.Component {
  render() {
    const { isInProgress, isSuccessful, isFailed } = this.props;

    if (isInProgress) {
      return <p className='tac'>Loading. please wait.</p>;
    } else if (isSuccessful) {
      return <Profile name={ this.props.name } />;
    } else if (isFailed) {
      return <Error tryAgain={ this.props.tryAgain } />;
    }
    return <LoginForm submit={ this.props.login } />;
  }
}

Widget.propTypes = {
  login: PropTypes.func,
  tryAgain: PropTypes.func,
  isInProgress: PropTypes.bool,
  isSuccessful: PropTypes.bool,
  isFailed: PropTypes.bool,
  name: PropTypes.string
}

const mapStateToProps = state => ({
  isInProgress: state.requestInFlight,
  isSuccessful: state.user !== null,
  isFailed: state.error !== null,
  name: state.user ? state.user.name : null
});

const mapDispatchToProps = dispatch => ({
  login: credentials => dispatch(login(credentials)),
  tryAgain: () => dispatch(tryAgain())
});

export default connect(mapStateToProps, mapDispatchToProps)(Widget);