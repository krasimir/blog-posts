import React from 'react';
import PropTypes from 'prop-types';
import LoginForm from './LoginForm.jsx';
import Profile from './Profile.jsx';
import Error from './Error.jsx';
import { connect } from 'stent/lib/react';
import { LOGIN_FORM, LOADING, TRY_AGAIN, WRONG_CREDENTIALS, PROFILE } from '../stent/states';

class Widget extends React.Component {
  constructor(props) {
    super(props);

    this.renderMap = {
      [LOGIN_FORM]: <LoginForm submit={ props.login } />,
      [LOADING]: <p className='tac'>Loading. please wait.</p>,
      [TRY_AGAIN]: <Error tryAgain={ props.tryAgain } message='Connection problem!' />,
      [WRONG_CREDENTIALS]: (
        <div>
          <LoginForm submit={ props.login } />
          <p className='error'>Missing or invalid data.</p>
        </div>
      ),
      [PROFILE]: <Profile name={ props.name } logout={ props.logout } />
    }
  }
  render() {
    return this.renderMap[this.props.state];
  }
}

Widget.propTypes = {
  login: PropTypes.func,
  tryAgain: PropTypes.func,
  logout: PropTypes.func,
  state: PropTypes.string
}

export default connect(Widget)
  .with('LoginFormSM')
  .map(machine => ({
    login: machine.submit,
    tryAgain: machine.tryAgain,
    logout: machine.logout,
    state: machine.state.name
  }));