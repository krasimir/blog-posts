import React from 'react';
import PropTypes from 'prop-types';
import Link from './Link.jsx';

export default class Profile extends React.Component {
  render() {
    return (
      <div>
        Welcome, { this.props.name }
        <hr />
        <Link onClick={ this.props.viewProfile }>Profile</Link><br />
        <Link onClick={ this.props.logout }>Log out</Link><br />
      </div>
    );
  }
}

Profile.propTypes = {
  name: PropTypes.string,
  viewProfile: PropTypes.func,
  logout: PropTypes.func
}