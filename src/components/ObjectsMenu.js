import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { poiTypeGroups, poiTypes } from 'fm3/poiTypes';
import { objectsSetFilter } from 'fm3/actions/objectsActions';
import { mapRefocus } from 'fm3/actions/mapActions';
import { toastsAdd } from 'fm3/actions/toastsActions';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import Dropdown from 'react-bootstrap/lib/Dropdown';
import MenuItem from 'react-bootstrap/lib/MenuItem';

import injectL10n from 'fm3/l10nInjector';

class ObjectsMenu extends React.Component {
  static propTypes = {
    onSearch: PropTypes.func.isRequired,
    onLowZoom: PropTypes.func.isRequired,
    zoom: PropTypes.number.isRequired,
    t: PropTypes.func.isRequired,
  };

  state = {
    filter: '',
    dropdownOpened: false,
  };

  getGroupMenuItems = ({ id: gid }) => {
    const { t } = this.props;

    const items = poiTypes
      .filter(({ group }) => group === gid)
      .filter(
        ({ id }) =>
          t(`objects.subcategories.${id}`)
            .toLowerCase()
            .indexOf(this.state.filter.toLowerCase()) !== -1,
      )
      .map(({ group, id, icon }) => (
        <MenuItem key={id} eventKey={id} onSelect={this.handleSelect}>
          <img
            src={require(`../images/mapIcons/${icon}.png`)}
            alt={`${group}-${icon}`}
          />{' '}
          {t(`objects.subcategories.${id}`)}
        </MenuItem>
      ));

    return items.length === 0 ? null : (
      <React.Fragment key={gid}>
        <MenuItem divider />
        <MenuItem header>{t(`objects.categories.${gid}`)}</MenuItem>
        {items}
      </React.Fragment>
    );
  };

  handleFilterSet = e => {
    this.setState({ filter: e.target.value });
  };

  handleToggle = () => {
    this.setState(state => ({
      dropdownOpened: !state.dropdownOpened,
    }));
  };

  handleSelect = id => {
    if (this.props.zoom < 12) {
      this.props.onLowZoom(id);
    } else {
      this.props.onSearch(id);
    }
  };

  render() {
    const { t } = this.props;

    return (
      <>
        <span className="fm-label">
          <FontAwesomeIcon icon="map-marker" />
          <span className="hidden-xs"> {t('tools.objects')}</span>
        </span>{' '}
        <Dropdown
          className="dropdown-long"
          id="objectsMenuDropdown"
          onToggle={this.handleToggle}
          open={this.state.dropdownOpened}
        >
          <FormGroup bsRole="toggle">
            <FormControl
              type="text"
              placeholder={t('objects.type')}
              onChange={this.handleFilterSet}
              value={this.state.filter}
            />
          </FormGroup>
          <Dropdown.Menu>
            {poiTypeGroups.map(pointTypeGroup =>
              this.getGroupMenuItems(pointTypeGroup),
            )}
          </Dropdown.Menu>
        </Dropdown>
      </>
    );
  }
}

const mapStateToProps = state => ({
  zoom: state.map.zoom,
});

const mapDispatchToProps = dispatch => ({
  onSearch(typeId) {
    dispatch(objectsSetFilter(typeId));
  },
  onLowZoom(/* typeId */) {
    dispatch(
      toastsAdd({
        collapseKey: 'objects.lowZoomAlert',
        messageKey: 'objects.lowZoomAlert.message',
        style: 'warning',
        actions: [
          {
            // name: 'Priblíž a hľadaj', TODO
            nameKey: 'objects.lowZoomAlert.zoom',
            action: [mapRefocus({ zoom: 12 })],
          },
        ],
      }),
    );
  },
});

export default compose(
  injectL10n(),
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(ObjectsMenu);
