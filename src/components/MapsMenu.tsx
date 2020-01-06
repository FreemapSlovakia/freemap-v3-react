import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import Button from 'react-bootstrap/lib/Button';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';

import { withTranslator, Translator } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';
import { mapsCreate, mapsRename } from 'fm3/actions/mapsActions';
import { selectFeature } from 'fm3/actions/mainActions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

const MapsMenuInt: React.FC<Props> = ({
  onSelect,
  onRename,
  onCreate,
  maps,
  id,
  t,
}) => (
  <>
    <DropdownButton
      id="maps-dropdown"
      title={maps.find(map => map.id === id)?.name ?? ''}
    >
      {maps.map(map => (
        <MenuItem key={map.id} eventKey={map.id} onSelect={onSelect}>
          {map.name}
        </MenuItem>
      ))}
    </DropdownButton>{' '}
    <Button onClick={onCreate}>
      <FontAwesomeIcon icon="eye" />
      <span className="hidden-md hidden-sm hidden-xs"> {t('maps.create')}</span>
    </Button>{' '}
    <Button onClick={onRename}>
      <FontAwesomeIcon icon="mobile" />
      <span className="hidden-md hidden-sm hidden-xs"> {t('maps.rename')}</span>
    </Button>
  </>
);

const mapStateToProps = (state: RootState) => ({
  maps: state.maps.maps,
  id: state.maps.id,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onSelect(id: any) {
    dispatch(selectFeature({ type: 'maps', id }));
  },
  onRename() {
    dispatch(mapsRename());
  },
  onCreate() {
    dispatch(mapsCreate());
  },
});

export const MapsMenu = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(MapsMenuInt));
