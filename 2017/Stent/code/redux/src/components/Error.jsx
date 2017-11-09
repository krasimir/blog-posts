import React from 'react';
import PropTypes from 'prop-types';
import Link from './Link.jsx';

const Error = ({ message, tryAgain }) => (
  <div className='tac'>
    <p className='error'>{ message }</p>
    <Link onClick={ tryAgain }>Try again</Link>
  </div>
);

Error.defaultProps = {
  message: 'Ops ...'
}

Error.propTypes = {
  message: PropTypes.string,
  tryAgain: PropTypes.func.isRequired
}

export default Error;