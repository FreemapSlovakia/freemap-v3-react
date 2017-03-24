import React from 'react';
import 'fm3/styles/fontAwesomeIcon.scss';

export default function FontAwesomeIcon({ icon, style }) {
  return (
    <span className="fa-icon-container">
      <i className={`fa fa-${icon}`} aria-hidden="true" style={style || {}}/>
    </span>
  );
}

FontAwesomeIcon.propTypes = {
  icon: React.PropTypes.string,
  style: React.PropTypes.any
};
