import React from 'react';
import PropTypes from 'prop-types';
import LoginForm from './LoginForm.jsx';
import Profile from './Profile.jsx';
import Error from './Error.jsx';
import { CONNECTION_ERROR } from '../services/errors';

class Widget extends React.Component {
  render() {
    const { isInProgress, isSuccessful, isFailed } = this.props;

    if (isInProgress) {
      return <p className='tac'>Loading. please wait.</p>;
    } else if (isSuccessful) {
      return <Profile name={ this.props.name } logout={ this.props.logout } />;
    } else if (isFailed) {
      return this.props.isConnectionError ?
        <Error
          tryAgain={ this.props.tryAgain } 
          message='Connection problem!' /> :
        (<div>
          <LoginForm submit={ this.props.login } />
          <p className='error'>Missing or invalid data.</p>
        </div>)
    }
    return <LoginForm submit={ this.props.login } />;
  }
}

Widget.defaultProps = {
  login: () => {},
  tryAgain: () => {},
  logout: () => {},
  isInProgress: false,
  isSuccessful: false,
  isFailed: false,
  isConnectionError: false
}

Widget.propTypes = {
  login: PropTypes.func,
  tryAgain: PropTypes.func,
  logout: PropTypes.func,
  isInProgress: PropTypes.bool,
  isSuccessful: PropTypes.bool,
  isFailed: PropTypes.bool,
  isConnectionError: PropTypes.bool,
  name: PropTypes.string
}

export default Widget;