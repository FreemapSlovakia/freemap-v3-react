import React from 'react';
import { connect } from 'react-redux';
import { setTool } from 'fm3/actions/mainActions';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';

function TrackViewerMenu({ onCancel }) {
  return (
    <div>
      <Nav>
        <NavItem onClick={onCancel}><Glyphicon glyph="remove" /> Zavrieť</NavItem>
      </Nav>
    </div>
  );
}

TrackViewerMenu.propTypes = {
  onCancel: React.PropTypes.func.isRequired,
};

export default connect(
  () => ({}),
  dispatch => ({
    onCancel() {
      dispatch(setTool(null));
    },
  }),
)(TrackViewerMenu);
