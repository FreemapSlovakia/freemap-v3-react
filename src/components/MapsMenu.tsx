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
import {
  mapsCreate,
  mapsRename,
  mapsSave,
  mapsLoad,
} from 'fm3/actions/mapsActions';
import { deleteFeature } from 'fm3/actions/mainActions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

const MapsMenuInt: React.FC<Props> = ({
  onSelect,
  onRename,
  onCreate,
  onSave,
  onDelete,
  maps,
  id,
  t,
}) => (
  <>
    <DropdownButton
      id="maps-dropdown"
      title={maps.find(map => map.id === id)?.name ?? t('maps.noMap')}
    >
      <MenuItem eventKey={undefined} onSelect={onSelect}>
        {t('maps.noMap')}
      </MenuItem>

      {maps.map(map => (
        <MenuItem key={map.id} eventKey={map.id} onSelect={onSelect}>
          {map.name}
        </MenuItem>
      ))}
    </DropdownButton>
    {id !== undefined && (
      <>
        {' '}
        <Button onClick={onSave}>
          <FontAwesomeIcon icon="floppy-o" />
          <span className="hidden-md hidden-sm hidden-xs">
            {' '}
            {t('maps.save')}
          </span>
        </Button>
      </>
    )}{' '}
    <Button onClick={onCreate}>
      <FontAwesomeIcon icon="plus" />
      <span className="hidden-md hidden-sm hidden-xs"> {t('maps.create')}</span>
    </Button>
    {id !== undefined && (
      <>
        {' '}
        <Button onClick={onRename}>
          <FontAwesomeIcon icon="pencil" />
          <span className="hidden-md hidden-sm hidden-xs">
            {' '}
            {t('maps.rename')}
          </span>
        </Button>
      </>
    )}
    {id !== undefined && (
      <>
        {' '}
        <Button onClick={onDelete}>
          <FontAwesomeIcon icon="trash" />
          <span className="hidden-md hidden-sm hidden-xs">
            {' '}
            {t('maps.delete')} <kbd>Del</kbd>
          </span>
        </Button>
      </>
    )}
  </>
);

const mapStateToProps = (state: RootState) => ({
  maps: state.maps.maps,
  id: state.maps.id,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onSelect(id: any) {
    dispatch(mapsLoad(id));
  },
  onRename() {
    dispatch(mapsRename());
  },
  onCreate() {
    dispatch(mapsCreate());
  },
  onSave() {
    dispatch(mapsSave());
  },
  onDelete() {
    dispatch(deleteFeature({ type: 'maps' }));
  },
});

export const MapsMenu = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(MapsMenuInt));
