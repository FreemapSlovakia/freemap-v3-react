import React from 'react';
import PropTypes from 'prop-types';

export default function FontAwesomeIcon({ icon, ...props }) {
  return (
    <i {...props} className={`fa-fw fa fa-${icon} ${props.className || ''}`} aria-hidden="true" />
  );
}

FontAwesomeIcon.propTypes = {
  icon: PropTypes.string,
  color: PropTypes.string,
  className: PropTypes.string,
};
