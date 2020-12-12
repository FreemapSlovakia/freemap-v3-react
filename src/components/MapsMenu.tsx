import { ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';

import { useMessages } from 'fm3/l10nInjector';
import {
  mapsCreate,
  mapsRename,
  mapsSave,
  mapsLoad,
} from 'fm3/actions/mapsActions';
import { deleteFeature } from 'fm3/actions/mainActions';
import { RootState } from 'fm3/storeCreator';
import { Button, ButtonGroup, DropdownButton } from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';

export function MapsMenu(): ReactElement {
  const m = useMessages();

  const maps = useSelector((state: RootState) => state.maps.maps);

  const id = useSelector((state: RootState) => state.maps.id);

  const authenticated = useSelector((state: RootState) => !!state.auth.user);

  const dispatch = useDispatch();

  return (
    <>
      <DropdownButton
        id="maps-dropdown"
        as={ButtonGroup}
        title={maps.find((map) => map.id === id)?.name ?? m?.maps.noMap}
        disabled={!authenticated}
        onSelect={(id: unknown) => {
          if (typeof id === 'number') {
            dispatch(mapsLoad({ id }));
          }
        }}
      >
        <Dropdown.Item eventKey={undefined}>{m?.maps.noMap}</Dropdown.Item>

        {maps.map((map) => (
          <Dropdown.Item key={map.id} eventKey={String(map.id)}>
            {map.name}
          </Dropdown.Item>
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
            <span className="d-md-none d-sm-none d-none"> {m?.maps.save}</span>
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
        <span className="d-md-none d-sm-none d-none"> {m?.maps.create}</span>
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
            <span className="d-md-none d-sm-none d-none">
              {' '}
              {m?.maps.rename}
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
            <span className="d-md-none d-sm-none d-none">
              {' '}
              {m?.maps.delete} <kbd>Del</kbd>
            </span>
          </Button>
        </>
      )}
    </>
  );
}
