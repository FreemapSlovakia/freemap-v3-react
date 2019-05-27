import React from 'react';
import PropTypes from 'prop-types';
import 'fm3/font/styles.css';

export default function FontAwesomeIcon({ icon, ...props }) {
  return (
    <i
      {...props}
      className={`fa-fw fa ${
        icon.startsWith('!') ? icon.slice(1) : `fa-${icon}`
      } ${props.className || ''}`}
      aria-hidden="true"
    />
  );
}

FontAwesomeIcon.propTypes = {
  icon: PropTypes.string.isRequired,
  className: PropTypes.string,
};
