import { deleteFeature } from 'fm3/actions/mainActions';
import {
  mapsCreate,
  mapsLoad,
  mapsRename,
  mapsSave,
} from 'fm3/actions/mapsActions';
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { ReactElement } from 'react';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { useDispatch, useSelector } from 'react-redux';

export function MapsMenu(): ReactElement {
  const m = useMessages();

  const maps = useSelector((state: RootState) => state.maps.maps);

  const id = useSelector((state: RootState) => state.maps.id);

  const authenticated = useSelector((state: RootState) => !!state.auth.user);

  const dispatch = useDispatch();

  return (
    <>
      <DropdownButton
        rootCloseEvent="mousedown"
        id="maps-dropdown"
        variant="secondary"
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
        <Button
          className="ml-1"
          variant="secondary"
          onClick={() => {
            dispatch(mapsSave());
          }}
        >
          <FontAwesomeIcon icon="floppy-o" />
          <span className="d-none d-md-inline"> {m?.maps.save}</span>
        </Button>
      )}
      <Button
        className="ml-1"
        variant="secondary"
        onClick={() => {
          dispatch(mapsCreate());
        }}
        disabled={!authenticated}
      >
        <FontAwesomeIcon icon="plus" />
        <span className="d-none d-md-inline"> {m?.maps.create}</span>
      </Button>
      {authenticated && id !== undefined && (
        <Button
          className="ml-1"
          variant="secondary"
          onClick={() => {
            dispatch(mapsRename());
          }}
        >
          <FontAwesomeIcon icon="pencil" />
          <span className="d-md-none d-sm-none d-none"> {m?.maps.rename}</span>
        </Button>
      )}
      {authenticated && id !== undefined && (
        <Button
          className="ml-1"
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
      )}
    </>
  );
}
