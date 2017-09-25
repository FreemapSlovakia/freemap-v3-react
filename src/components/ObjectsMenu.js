import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { poiTypeGroups, poiTypes } from 'fm3/poiTypes';
import { objectsSetFilter } from 'fm3/actions/objectsActions';
import { mapRefocus } from 'fm3/actions/mapActions';
import { toastsAdd } from 'fm3/actions/toastsActions';

import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import Dropdown from 'react-bootstrap/lib/Dropdown';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Panel from 'react-bootstrap/lib/Panel';

class ObjectsMenu extends React.Component {
  static propTypes = {
    onSearch: PropTypes.func.isRequired,
    onLowZoom: PropTypes.func.isRequired,
    zoom: PropTypes.number.isRequired,
  };

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
    return (
      <Panel className="tool-panel">
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
      </Panel>
    );
  }
}

export default connect(
  state => ({
    zoom: state.map.zoom,
  }),
  dispatch => ({
    onSearch(typeId) {
      dispatch(objectsSetFilter(typeId));
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
)(ObjectsMenu);
