import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';

import { setTool } from 'fm3/actions/mainActions';

function ChangesetsMenu({ onCancel }) {
  return (
    <div>
      <Nav pullRight>
        <NavItem onClick={onCancel}><Glyphicon glyph="remove" /> Zavrieť</NavItem>
      </Nav>
    </div>
  );
}

ChangesetsMenu.propTypes = {
  onCancel: PropTypes.func.isRequired,
};

export default connect(
  () => ({}),
  dispatch => ({
    onCancel() {
      dispatch(setTool(null));
    },
  }),
)(ChangesetsMenu);

