import React from 'react';

export default function FontAwesomeIcon({ icon, style }) {
  return (
    <i className={`fa-fw fa fa-${icon}`} aria-hidden="true" style={style || {}} />
  );
}

FontAwesomeIcon.propTypes = {
  icon: React.PropTypes.string,
  style: React.PropTypes.object,
};
