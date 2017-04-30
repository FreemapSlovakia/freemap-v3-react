import React from 'react';
import PropTypes from 'prop-types';

export default function FontAwesomeIcon({ icon, color }) {
  return (
    <i className={`fa-fw fa fa-${icon}`} style={{ color }} aria-hidden="true" />
  );
}

FontAwesomeIcon.propTypes = {
  icon: PropTypes.string,
  color: PropTypes.string,
};
