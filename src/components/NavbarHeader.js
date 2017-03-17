import React from 'react';
import { connect } from 'react-redux';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import Navbar from 'react-bootstrap/lib/Navbar';
import { resetMap } from 'fm3/actions/mapActions';

import 'fm3/styles/navbarHeader.scss';

function NavbarHeader({ tool, onResetMap }) {
  return (
    <Navbar.Header>
      <Navbar.Brand>
        <img
          onClick={onResetMap}
          className="freemap-logo"
          src={require('fm3/images/freemap-logo.png')}
        />
      </Navbar.Brand>
      {tool === 'route-planner' &&
        <Navbar.Text style={{ display: 'inline-block', paddingLeft: '10px' }}>
          <span><FontAwesomeIcon icon="map-signs"/> Plánovač</span>
        </Navbar.Text>}
      <Navbar.Toggle/>
    </Navbar.Header>
  );
}

NavbarHeader.propTypes = {
  tool: React.PropTypes.string,
  onResetMap: React.PropTypes.func.isRequired
};

export default connect(
  function (state) {
    return {
      tool: state.main.tool
    };
  },
  function (dispatch) {
    return {
      onResetMap() {
        dispatch(resetMap());
      }
    };
  }
)(NavbarHeader);
