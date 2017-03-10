import React from 'react';
import { connect } from 'react-redux';

// TODO remove import { poiTypeGroups, poiTypes } from 'fm3/poiTypes';
import { setObjectsFilter } from 'fm3/actions/objectsActions';
import { setTool } from 'fm3/actions/mapActions';

import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import NavDropdown from 'react-bootstrap/lib/NavDropdown';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Navbar from 'react-bootstrap/lib/Navbar';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';

class ObjectsModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      selections: new Set()
    };
  }

  showObjects() {
    // this.props.onSearch([ ...this.state.selections ]
    //   .map(i => poiTypes[i])
    //   .map(({ key, value }) => `node["${key}"="${value}"]`)); // TODO move to logic?
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
    const { categories, subcategories, onCancel } = this.props;
    const { selections } = this.state;

    const b = (fn, ...args) => fn.bind(this, ...args);

    const title = subcategories.filter(({ id }) => selections.has(id)).map(({ name }) => name).join(', ') || 'Zvoľ katrgóriu';

    return (
      <Nav>
        <Navbar.Text><i className={`fa fa-star`} aria-hidden="true"/> Hľadať POIs</Navbar.Text>
        <NavDropdown eventKey={3} title={title} id="basic-nav-dropdown">
          {categories.map(({ id: cid, name }) => (
            [
              <MenuItem key={cid + '_'} divider/>,
              <MenuItem key={cid} header>{name}</MenuItem>,
              subcategories.map(({ id, name, category_id }) => category_id === cid &&
                <MenuItem key={id} eventKey={id} onSelect={b(this.select)} active={selections.has(id)}>
                  {name}
                </MenuItem>
              )
            ]
          ))}
        </NavDropdown>
        <NavItem onClick={onCancel}><Glyphicon glyph="remove"/> Zavrieť</NavItem>
      </Nav>
    );
  }

}

ObjectsModal.propTypes = {
  onSearch: React.PropTypes.func.isRequired,
  onCancel: React.PropTypes.func.isRequired,
  categories: React.PropTypes.array.isRequired,
  subcategories: React.PropTypes.array.isRequired
};

export default connect(
  function (state) {
    return {
      categories: state.objects.categories,
      subcategories: state.objects.subcategories
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
)(ObjectsModal);
