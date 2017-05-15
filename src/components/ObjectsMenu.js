import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { poiTypeGroups, poiTypes } from 'fm3/poiTypes';
import { objectsSetFilter, objectsExportGpx } from 'fm3/actions/objectsActions';
import { setTool } from 'fm3/actions/mainActions';
import { mapRefocus } from 'fm3/actions/mapActions';
import { toastsAdd } from 'fm3/actions/toastsActions';

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
      .map(({ group, title, id, icon }) => (
        <MenuItem key={id} eventKey={id} onSelect={this.select}>
          <img src={require(`../images/mapIcons/${icon}.png`)} alt={`${group}-${icon}`} /> {title}
        </MenuItem>
      ));

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

  select = (id) => {
    if (this.props.zoom < 12) {
      this.props.onLowZoom(id);
    } else {
      this.props.onSearch(id);
    }
  }

  render() {
    const { onCancel, onGpxExport, objectsFound } = this.props;

    // FIXME wrapper element Nav is not OK here. Actually no wrapper element must be used.
    return (
      <div>
        <Navbar.Form pullLeft>
          <Dropdown
            className="dropdown-long"
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
          {' '}
          <Button onClick={onGpxExport} disabled={!objectsFound} title="Exportuj do GPX">
            <FontAwesomeIcon icon="share" /><span className="hidden-sm"> Exportuj do GPX</span>
          </Button>
        </Navbar.Form>
        <Nav pullRight>
          <NavItem onClick={onCancel}><Glyphicon glyph="remove" /> Zavrieť</NavItem>
        </Nav>
      </div>
    );
  }
}

ObjectsMenu.propTypes = {
  onSearch: PropTypes.func.isRequired,
  onLowZoom: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onGpxExport: PropTypes.func.isRequired,
  zoom: PropTypes.number.isRequired,
  objectsFound: PropTypes.bool.isRequired,
};

export default connect(
  state => ({
    zoom: state.map.zoom,
    objectsFound: !!state.objects.objects.length,
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
    onLowZoom(/* typeId */) {
      dispatch(toastsAdd({
        collapseKey: 'objects.lowZoom',
        message: 'Vyhľadávanie miest je možné až od priblíženia úrovne 12.',
        style: 'warning',
        cancelType: 'SET_TOOL',
        actions: [
          {
            // name: 'Priblíž a hľadaj', TODO
            name: 'Priblíž',
            action: [
              mapRefocus({ zoom: 12 }),
              // objectsSetFilter(typeId) it won't work correctly because it uses bounds before refocus
            ],
          },
        ],
      }));
    },
  }),
)(withRouter(ObjectsMenu));
