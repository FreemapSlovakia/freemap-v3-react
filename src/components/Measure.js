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

class Objects extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { onCancel, onSetTool, tool } = this.props;

    const b = (fn, ...args) => fn.bind(this, ...args);

    // FIXME wrapper element Nav is not OK here. Actually no wrapper element must be used.
    return (
      <div>
        <Nav>
          <Navbar.Text><FontAwesomeIcon icon="arrows-h"/> Meranie</Navbar.Text>
        </Nav>
        <Navbar.Form pullLeft>
          <ButtonGroup>
            <Button onClick={b(onSetTool, 'measure')} active={tool === 'measure'}>
              <FontAwesomeIcon icon="arrows-h"/> Vzdialenosť
            </Button>
            <Button onClick={b(onSetTool, 'measure-ele')} active={tool === 'measure-ele'}>
              <FontAwesomeIcon icon="long-arrow-up"/> Výška a poloha
            </Button>
            <Button onClick={b(onSetTool, 'measure-area')} active={tool === 'measure-area'}>
              <FontAwesomeIcon icon="square"/> Plocha
            </Button>
          </ButtonGroup>
        </Navbar.Form>
        <Nav>
          <NavItem onClick={onCancel}><Glyphicon glyph="remove"/> Zavrieť</NavItem>
        </Nav>
      </div>
    );
  }

}

Objects.propTypes = {
  tool: React.PropTypes.string,
  onSetTool: React.PropTypes.func.isRequired,
  onCancel: React.PropTypes.func.isRequired
};

export default connect(
  function (state) {
    return {
      tool: state.main.tool
    };
  },
  function (dispatch) {
    return {
      onSetTool(tool) {
        dispatch(setTool(tool));
      },
      onCancel() {
        dispatch(setTool(null));
      }
    };
  }
)(Objects);
