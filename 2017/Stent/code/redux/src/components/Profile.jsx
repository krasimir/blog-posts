import React from 'react';
import PropTypes from 'prop-types';
import Link from './Link.jsx';

export default function Profile({ name, viewProfile, logout }) {
  return (
    <div>
      Welcome, { name }
      <hr />
      <Link onClick={ viewProfile }>Profile</Link><br />
      <Link onClick={ logout }>Log out</Link><br />
    </div>
  );
}

Profile.defaultProps = {
  viewProfile: () => {},
  logout: () => {}
}

Profile.propTypes = {
  name: PropTypes.string,
  viewProfile: PropTypes.func,
  logout: PropTypes.func
}