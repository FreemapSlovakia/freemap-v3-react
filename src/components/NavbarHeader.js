import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import Navbar from 'react-bootstrap/lib/Navbar';
import { mapReset } from 'fm3/actions/mapActions';
import * as FmPropTypes from 'fm3/propTypes';

import 'fm3/styles/navbarHeader.scss';

const humanNameForToolToShowInNavbar = {
  'route-planner': 'Plánovač',
  measure: 'Meranie',
  'measure-ele': 'Meranie',
  'measure-area': 'Meranie',
  'track-viewer': 'Prehliadač trás',
  objects: 'Miesta',
  'info-point': 'Odkaz na mapu',
  changesets: 'Zmeny v mape',
};

const iconForTool = {
  'route-planner': 'map-signs',
  measure: 'arrows-h',
  'measure-ele': 'long-arrow-up',
  'measure-area': 'square',
  'track-viewer': 'road',
  objects: 'map-marker',
  'info-point': 'link',
  changesets: 'pencil',
};

function NavbarHeader({ tool, onMapReset }) {
  return (
    <Navbar.Header>
      <Navbar.Brand>
        <button id="freemap-logo" onClick={onMapReset} />
      </Navbar.Brand>
      {humanNameForToolToShowInNavbar[tool] &&
        <Navbar.Text style={{ display: 'inline-block', paddingLeft: '10px' }}>
          <span><FontAwesomeIcon icon={iconForTool[tool]} /> {humanNameForToolToShowInNavbar[tool]}</span>
        </Navbar.Text>}
      <Navbar.Toggle />
    </Navbar.Header>
  );
}

NavbarHeader.propTypes = {
  tool: FmPropTypes.tool,
  onMapReset: PropTypes.func.isRequired,
};

export default connect(
  state => ({
    tool: state.main.tool,
  }),
  dispatch => ({
    onMapReset() {
      dispatch(mapReset());
    },
  }),
)(NavbarHeader);
