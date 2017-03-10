import React from 'react';

export default class FontAwesomeIcon extends React.Component {
  render() {
    return (
      <i className={`fa fa-${this.props.icon}`} aria-hidden="true"/>
    );
  }
}

FontAwesomeIcon.propTypes = {
  icon: React.PropTypes.string
};