import React, { ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import Button from 'react-bootstrap/lib/Button';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';

import { useTranslator } from 'fm3/l10nInjector';
import {
  mapsCreate,
  mapsRename,
  mapsSave,
  mapsLoad,
} from 'fm3/actions/mapsActions';
import { deleteFeature } from 'fm3/actions/mainActions';
import { RootState } from 'fm3/storeCreator';

export function MapsMenu(): ReactElement {
  const t = useTranslator();

  const maps = useSelector((state: RootState) => state.maps.maps);

  const id = useSelector((state: RootState) => state.maps.id);

  const authenticated = useSelector((state: RootState) => !!state.auth.user);

  const dispatch = useDispatch();

  return (
    <>
      <DropdownButton
        id="maps-dropdown"
        title={maps.find((map) => map.id === id)?.name ?? t('maps.noMap')}
        disabled={!authenticated}
        onSelect={(id: unknown) => {
          if (typeof id === 'number') {
            dispatch(mapsLoad({ id }));
          }
        }}
      >
        <MenuItem eventKey={undefined}>{t('maps.noMap')}</MenuItem>

        {maps.map((map) => (
          <MenuItem key={map.id} eventKey={map.id}>
            {map.name}
          </MenuItem>
        ))}
      </DropdownButton>
      {authenticated && id !== undefined && (
        <>
          {' '}
          <Button
            onClick={() => {
              dispatch(mapsSave());
            }}
          >
            <FontAwesomeIcon icon="floppy-o" />
            <span className="hidden-md hidden-sm hidden-xs">
              {' '}
              {t('maps.save')}
            </span>
          </Button>
        </>
      )}{' '}
      <Button
        onClick={() => {
          dispatch(mapsCreate());
        }}
        disabled={!authenticated}
      >
        <FontAwesomeIcon icon="plus" />
        <span className="hidden-md hidden-sm hidden-xs">
          {' '}
          {t('maps.create')}
        </span>
      </Button>
      {authenticated && id !== undefined && (
        <>
          {' '}
          <Button
            onClick={() => {
              dispatch(mapsRename());
            }}
          >
            <FontAwesomeIcon icon="pencil" />
            <span className="hidden-md hidden-sm hidden-xs">
              {' '}
              {t('maps.rename')}
            </span>
          </Button>
        </>
      )}
      {authenticated && id !== undefined && (
        <>
          {' '}
          <Button
            onClick={() => {
              dispatch(deleteFeature({ type: 'maps' }));
            }}
          >
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
}
