import React from 'react';
import { connect } from 'react-redux';

import { poiTypeGroups, poiTypes } from 'fm3/poiTypes';
import { setObjectsFilter } from 'fm3/actions/objectsActions';
import { setTool } from 'fm3/actions/mainActions';

import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import NavDropdown from 'react-bootstrap/lib/NavDropdown';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Navbar from 'react-bootstrap/lib/Navbar';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

function ObjectsMenu({ onSearch, onCancel }) {

  function select(i) {
    onSearch(poiTypes[i].filter);
  }

  // FIXME wrapper element Nav is not OK here. Actually no wrapper element must be used.
  return (
    <Nav>
      <Navbar.Text><FontAwesomeIcon icon="map-marker"/> Miesta</Navbar.Text>
      <NavDropdown title="Zvoľ katrgóriu" id="basic-nav-dropdown">
        {poiTypeGroups.map(({ id: gid, title }) => (
          [
            <MenuItem key={gid + '_'} divider/>,
            <MenuItem key={gid} header>{title}</MenuItem>,
            poiTypes.map(({ group, title, id }, i) => group === gid &&
              <MenuItem key={i} eventKey={i} onSelect={select}>
                <img src={require(`../images/mapIcons/${group}-${id}.png`)}/> {title}
              </MenuItem>
            )
          ]
        ))}
      </NavDropdown>
      <Navbar.Form pullLeft>
        <Button>Exportuj do GPX</Button>
      </Navbar.Form>
      <NavItem onClick={onCancel}><Glyphicon glyph="remove"/> Zavrieť</NavItem>
    </Nav>
  );

}

ObjectsMenu.propTypes = {
  onSearch: React.PropTypes.func.isRequired,
  onCancel: React.PropTypes.func.isRequired
};

export default connect(
  function () {
    return {
    };
  },
  function (dispatch) {
    return {
      onSearch(filter) {
        dispatch(setObjectsFilter(filter));
      },
      onCancel() {
        dispatch(setTool(null));
      }
    };
  }
)(ObjectsMenu);
