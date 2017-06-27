import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Navbar from 'react-bootstrap/lib/Navbar';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

import { changesetsSetDays, changesetsRefresh } from 'fm3/actions/changesetsActions';
import { setTool } from 'fm3/actions/mainActions';

function ChangesetsMenu({ days, zoom, onChangesetsSetDays, onChangesetsRefresh, onCancel }) {
  return (
    <div>
      <Navbar.Form pullLeft>
        <ButtonGroup>
          <DropdownButton title={`Zmeny novšie ako ${days} dni`} id="days">
            <MenuItem disabled={zoom <= 8} onClick={() => (zoom <= 8 ? false : onChangesetsSetDays(3))}>3 dni</MenuItem>
            <MenuItem disabled={zoom <= 9} onClick={() => (zoom <= 9 ? false : onChangesetsSetDays(7))}>7 dní</MenuItem>
            <MenuItem disabled={zoom <= 10} onClick={() => (zoom <= 10 ? false : onChangesetsSetDays(14))}>14 dní</MenuItem>
          </DropdownButton>
        </ButtonGroup>
        {' '}
        <ButtonGroup>
          <Button
            disabled={(zoom <= 8 && days === 3) || (zoom <= 9 && days === 7) || (zoom <= 10 && days === 14)}
            onClick={() => onChangesetsRefresh()}
            title="Stiahnuť zmeny"
          >
            <FontAwesomeIcon icon="refresh" /><span className="hidden-sm"> Stiahnuť zmeny</span>
          </Button>
        </ButtonGroup>
      </Navbar.Form>
      <Nav pullRight>
        <NavItem onClick={onCancel}><Glyphicon glyph="remove" /> Zavrieť</NavItem>
      </Nav>
    </div>
  );
}

ChangesetsMenu.propTypes = {
  days: PropTypes.number.isRequired,
  zoom: PropTypes.number.isRequired,
  onChangesetsSetDays: PropTypes.func.isRequired,
  onChangesetsRefresh: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default connect(
  state => ({
    days: state.changesets.days,
    zoom: state.map.zoom,
  }),
  dispatch => ({
    onChangesetsSetDays(days) {
      dispatch(changesetsSetDays(days));
    },
    onChangesetsRefresh() {
      dispatch(changesetsRefresh());
    },
    onCancel() {
      dispatch(setTool(null));
    },
  }),
)(ChangesetsMenu);
