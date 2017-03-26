import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';

import { poiTypeGroups, poiTypes } from 'fm3/poiTypes';
import { objectsSetFilter, objectsExportGpx } from 'fm3/actions/objectsActions';
import { setTool } from 'fm3/actions/mainActions';

import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import Dropdown from 'react-bootstrap/lib/Dropdown';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Navbar from 'react-bootstrap/lib/Navbar';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

class ObjectsMenu extends React.Component {

  state = {
    filter: '',
    dropdownOpened: false,
    focused: false,
  }

  getGroupMenuItems = ({ id: gid, title: groupTitle }) => {
    const items = poiTypes
        .filter(({ group }) => group === gid)
        .filter(({ title }) => title.toLowerCase().indexOf(this.state.filter.toLowerCase()) !== -1)
        .map(({ group, title, id, icon }) =>
          <MenuItem key={id} eventKey={id} onSelect={this.select}>
            <img src={require(`../images/mapIcons/${icon}.png`)} alt={`${group}-${icon}`} /> {title}
          </MenuItem>,
    );

    return items.length === 0 ? null : [
      <MenuItem key={`${gid}_`} divider />,
      <MenuItem key={gid} header>{groupTitle}</MenuItem>,
      items,
    ];
  }

  handleFilterSet = (e) => {
    this.setState({ filter: e.target.value });
  }

  handleFilterFocus = () => {
    this.setState({ focused: true });
  }

  handleFilterBlur = () => {
    this.setState({ focused: false });
  }

  handleToggle = () => {
    this.setState({ dropdownOpened: !this.state.dropdownOpened || this.state.focused });
  }

  validateZoom = () => {
    if (this.props.zoom < 12) {
      const to = this.props.location.search.replace(/\bmap=\d+/, 'map=12'); // TODO this is ugly. Rework after introducing react-url-query
      this.props.onShowToast('info', null, <span>Vyhľadávanie miest funguje až od priblíženia <Link to={to}>úrovne 12</Link>.</span>);
    }
  }

  select = (id) => {
    this.props.onSearch(id);
  }

  render() {
    const { onCancel, onGpxExport } = this.props;

    // FIXME wrapper element Nav is not OK here. Actually no wrapper element must be used.
    return (
      <Nav>
        <Navbar.Text><FontAwesomeIcon icon="map-marker" /> Miesta</Navbar.Text>
        <Navbar.Form pullLeft>
          <Dropdown
            id="objectsMenuDropdown"
            onToggle={this.handleToggle}
            open={this.state.dropdownOpened}
          >
            <FormGroup bsRole="toggle">
              <FormControl
                type="text"
                placeholder="Typ"
                onChange={this.handleFilterSet}
                value={this.state.filter}
                onFocus={this.handleFilterFocus}
                onBlur={this.handleFilterBlur}
              />
            </FormGroup>
            <Dropdown.Menu>
              {poiTypeGroups.map(pointTypeGroup => this.getGroupMenuItems(pointTypeGroup))}
            </Dropdown.Menu>
          </Dropdown>
        </Navbar.Form>
        <Navbar.Form pullLeft>
          <Button onClick={onGpxExport}>Exportuj do GPX</Button>
        </Navbar.Form>
        <NavItem onClick={onCancel}><Glyphicon glyph="remove" /> Zavrieť</NavItem>
      </Nav>
    );
  }
}

ObjectsMenu.propTypes = {
  onSearch: React.PropTypes.func.isRequired,
  onCancel: React.PropTypes.func.isRequired,
  onShowToast: React.PropTypes.func.isRequired,
  onGpxExport: React.PropTypes.func.isRequired,
  zoom: React.PropTypes.number.isRequired,
  location: React.PropTypes.object.isRequired,
};

export default connect(
  state => ({
    zoom: state.map.zoom,
  }),
  dispatch => ({
    onSearch(typeId) {
      dispatch(objectsSetFilter(typeId));
    },
    onGpxExport() {
      dispatch(objectsExportGpx());
    },
    onCancel() {
      dispatch(setTool(null));
    },
  }),
)(withRouter(ObjectsMenu));
