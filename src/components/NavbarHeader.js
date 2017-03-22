import React from 'react';
import { connect } from 'react-redux';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import Navbar from 'react-bootstrap/lib/Navbar';
import { resetMap } from 'fm3/actions/mapActions';

import 'fm3/styles/navbarHeader.scss';

const humanNameForToolToShowInNavbar = {
  'route-planner': 'Plánovač',
  'measure': 'Meranie',
  'measure-ele': 'Meranie',
  'measure-area': 'Meranie'
};

const iconForTool = {
  'route-planner': 'map-signs',
  'measure': 'arrows-h',
  'measure-ele': 'long-arrow-up',
  'measure-area': 'square'
};

function NavbarHeader({ tool, onResetMap }) {
  return (
    <Navbar.Header>
      <Navbar.Brand>
        <div
          onClick={onResetMap}
          id="freemap-logo"
        />
      </Navbar.Brand>
      {humanNameForToolToShowInNavbar[tool] &&
        <Navbar.Text style={{ display: 'inline-block', paddingLeft: '10px' }}>
          <span><FontAwesomeIcon icon={iconForTool[tool]}/> {humanNameForToolToShowInNavbar[tool]}</span>
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
