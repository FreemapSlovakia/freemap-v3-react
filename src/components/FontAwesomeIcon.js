import React from 'react';

export default function FontAwesomeIcon({ icon }) {
  return (
    <i className={`fa-fw fa fa-${icon}`} aria-hidden="true" />
  );
}

FontAwesomeIcon.propTypes = {
  icon: React.PropTypes.string,
};
