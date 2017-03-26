import React from 'react';
import { connect } from 'react-redux';

import { setTool } from 'fm3/actions/mainActions';

import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Navbar from 'react-bootstrap/lib/Navbar';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';

function MeasurementMenu({ onCancel, onSetTool, tool }) {
  // FIXME wrapper element Nav is not OK here. Actually no wrapper element must be used.
  return (
    <div>
      <Navbar.Form pullLeft>
        <ButtonGroup>
          <Button onClick={() => onSetTool('measure')} active={tool === 'measure'}>
            <FontAwesomeIcon icon="arrows-h" /> Vzdialenosť
          </Button>
          <Button onClick={() => onSetTool('measure-ele')} active={tool === 'measure-ele'}>
            <FontAwesomeIcon icon="long-arrow-up" /> Výška a poloha
          </Button>
          <Button onClick={() => onSetTool('measure-area')} active={tool === 'measure-area'}>
            <FontAwesomeIcon icon="square" /> Plocha
          </Button>
        </ButtonGroup>
      </Navbar.Form>
      <Nav>
        <NavItem onClick={onCancel}><Glyphicon glyph="remove" /> Zavrieť</NavItem>
      </Nav>
    </div>
  );
}

MeasurementMenu.propTypes = {
  tool: React.PropTypes.string,
  onSetTool: React.PropTypes.func.isRequired,
  onCancel: React.PropTypes.func.isRequired,
};

export default connect(
  state => ({
    tool: state.main.tool,
  }),
  dispatch => ({
    onSetTool(tool) {
      dispatch(setTool(tool));
    },
    onCancel() {
      dispatch(setTool(null));
    },
  }),
)(MeasurementMenu);
