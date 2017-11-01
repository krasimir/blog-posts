import React from 'react';
import PropTypes from 'prop-types';
import Link from './Link.jsx';

export default class Error extends React.Component {
  render() {
    return (
      <div className='tac'>
        <p className='error'>{ this.props.message }</p>
        <Link onClick={ this.props.tryAgain }>Try again</Link>
      </div>
    );
  }
}

Error.defaultProps = {
  message: 'Ops ...'
}

Error.propTypes = {
  message: PropTypes.string,
  tryAgain: PropTypes.func.isRequired
}