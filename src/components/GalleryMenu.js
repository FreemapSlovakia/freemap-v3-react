import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { setTool } from 'fm3/actions/mainActions';

import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';

function GalleryMenu({ onCancel }) {
  return (
    <Nav pullRight>
      <NavItem onClick={onCancel}><Glyphicon glyph="remove" /> Zavrieť</NavItem>
    </Nav>
  );
}

GalleryMenu.propTypes = {
  onCancel: PropTypes.func.isRequired,
};

export default connect(
  () => ({}),
  dispatch => ({
    onCancel() {
      dispatch(setTool(null));
    },
  }),
)(GalleryMenu);
