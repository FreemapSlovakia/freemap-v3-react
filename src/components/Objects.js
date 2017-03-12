import React from 'react';
import { connect } from 'react-redux';

import { poiTypeGroups, poiTypes } from 'fm3/poiTypes';
import { setObjectsFilter } from 'fm3/actions/objectsActions';
import { setTool } from 'fm3/actions/mapActions';

import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import NavDropdown from 'react-bootstrap/lib/NavDropdown';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Navbar from 'react-bootstrap/lib/Navbar';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';

class Objects extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      selections: new Set()
    };
  }

  showObjects() {
    this.props.onSearch([ ...this.state.selections ]
      .map(i => poiTypes[i])
      .map(({ key, value }) => `node["${key}"="${value}"]`)); // TODO move to logic?
  }

  select(i) {
    const s = new Set(this.state.selections);
    if (s.has(i)) {
      s.delete(i);
    } else {
      s.add(i);
    }

    this.setState({ selections: s });
  }

  render() {
    const { onCancel } = this.props;
    const { selections } = this.state;

    const b = (fn, ...args) => fn.bind(this, ...args);

    const selectedTitle = [ ...selections ].map(i => poiTypes[i].title).join(', ') || 'Zvoľ katrgóriu';

    return (
      <Nav>
        <Navbar.Text><i className={`fa fa-star`} aria-hidden="true"/> Hľadať POIs</Navbar.Text>
        <NavDropdown eventKey={3} title={selectedTitle} id="basic-nav-dropdown">
          {poiTypeGroups.map(({ id, title }) => (
            [
              <MenuItem key={id + '_'} divider/>,
              <MenuItem key={id} header>{title}</MenuItem>,
              poiTypes.map(({ group, title }, i) => group === id &&
                <MenuItem key={i} eventKey={i} onSelect={b(this.select)} active={selections.has(i)}>
                  {title}
                </MenuItem>
              )
            ]
          ))}
        </NavDropdown>
        <Navbar.Form pullLeft>
          <Button onClick={b(this.showObjects)} disabled={!selections.size}>Zobraz</Button>
        </Navbar.Form>
        <NavItem onClick={onCancel}><Glyphicon glyph="remove"/> Zavrieť</NavItem>
      </Nav>
    );
  }

}

Objects.propTypes = {
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
)(Objects);
