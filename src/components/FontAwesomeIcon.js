import React from 'react';
import 'fm3/styles/fontAwesomeIcon.scss';

export default class FontAwesomeIcon extends React.Component {
  render() {
    return (
      <span className="fa-icon-container">
        <i className={`fa fa-${this.props.icon}`} aria-hidden="true"/>
      </span>
    );
  }
}

FontAwesomeIcon.propTypes = {
  icon: React.PropTypes.string
};