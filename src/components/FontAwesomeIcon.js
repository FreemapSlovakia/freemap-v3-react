import React from 'react';

export default function FontAwesomeIcon({ icon, color }) {
  return (
    <i className={`fa-fw fa fa-${icon}`} style={{ color }} aria-hidden="true" />
  );
}

FontAwesomeIcon.propTypes = {
  icon: React.PropTypes.string,
  color: React.PropTypes.string,
};
