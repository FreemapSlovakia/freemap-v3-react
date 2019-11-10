import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { poiTypeGroups, poiTypes } from 'fm3/poiTypes';
import { objectsSetFilter } from 'fm3/actions/objectsActions';
import { mapRefocus } from 'fm3/actions/mapActions';
import { toastsAdd } from 'fm3/actions/toastsActions';

import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import Dropdown from 'react-bootstrap/lib/Dropdown';
import MenuItem from 'react-bootstrap/lib/MenuItem';

import { withTranslator, Translator } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

interface State {
  filter: string;
  dropdownOpened: boolean;
}

class ObjectsMenuInt extends React.Component<Props, State> {
  state: State = {
    filter: '',
    dropdownOpened: false,
  };

  getGroupMenuItems = ({ id: gid }: { id: number }, showDivider: boolean) => {
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
        {showDivider && <MenuItem divider />}
        <MenuItem header>{t(`objects.categories.${gid}`)}</MenuItem>
        {items}
      </React.Fragment>
    );
  };

  handleFilterSet = (e: React.FormEvent<FormControl>) => {
    this.setState({ filter: (e.target as HTMLInputElement).value });
  };

  handleToggle = () => {
    this.setState(state => ({
      dropdownOpened: !state.dropdownOpened,
    }));
  };

  handleSelect = (id: any) => {
    if (this.props.zoom < 12) {
      this.props.onLowZoom();
    } else {
      this.props.onSearch(id as number);
    }
  };

  render() {
    const { t } = this.props;

    const FormGroup2 = FormGroup as any; // hacked missing attribute "bsRole" in type

    return (
      <>
        <Dropdown
          className="dropdown-long"
          id="objectsMenuDropdown"
          onToggle={this.handleToggle}
          open={this.state.dropdownOpened}
        >
          <FormGroup2 bsRole="toggle">
            <FormControl
              type="text"
              placeholder={t('objects.type')}
              onChange={this.handleFilterSet}
              value={this.state.filter}
            />
          </FormGroup2>
          <Dropdown.Menu>
            {poiTypeGroups.map((pointTypeGroup, i) =>
              this.getGroupMenuItems(pointTypeGroup, i > 0),
            )}
          </Dropdown.Menu>
        </Dropdown>
      </>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  zoom: state.map.zoom,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onSearch(typeId: number) {
    dispatch(objectsSetFilter(typeId));
  },
  onLowZoom() {
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

export const ObjectsMenu = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(ObjectsMenuInt));
