import React from 'react';
import PropTypes from 'prop-types';
import Link from './Link.jsx';

export default class Error extends React.Component {
  render() {
    return (
      <div className='tac'>
        Ops ...<br />
        <Link onClick={ this.props.tryAgain }>Try again</Link>
      </div>
    );
  }
}

Error.propTypes = {
  tryAgain: PropTypes.func.isRequired
}