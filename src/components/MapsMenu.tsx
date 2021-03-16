import { deleteFeature } from 'fm3/actions/mainActions';
import {
  mapsCreate,
  mapsLoad,
  mapsRename,
  mapsSave,
} from 'fm3/actions/mapsActions';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { ReactElement } from 'react';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import { FaPencilAlt, FaPlus, FaSave, FaTrash } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

export function MapsMenu(): ReactElement {
  const m = useMessages();

  const maps = useSelector((state: RootState) => state.maps.maps);

  const id = useSelector((state: RootState) => state.maps.id);

  const authenticated = useSelector((state: RootState) => !!state.auth.user);

  const dispatch = useDispatch();

  return (
    <>
      <Dropdown
        className="ml-1"
        onSelect={(id) => {
          dispatch(mapsLoad({ id: id ? Number(id) : undefined }));
        }}
      >
        <Dropdown.Toggle
          id="maps-dropdown"
          variant="secondary"
          disabled={!authenticated}
        >
          {maps.find((map) => map.id === id)?.name ?? m?.maps.noMap}
        </Dropdown.Toggle>
        <Dropdown.Menu
          popperConfig={{
            strategy: 'fixed',
          }}
        >
          <Dropdown.Item eventKey={undefined}>{m?.maps.noMap}</Dropdown.Item>

          {maps.map((map) => (
            <Dropdown.Item key={map.id} eventKey={String(map.id)}>
              {map.name}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
      {authenticated && id !== undefined && (
        <Button
          className="ml-1"
          variant="secondary"
          onClick={() => {
            dispatch(mapsSave());
          }}
        >
          <FaSave />
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
        <FaPlus />
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
          <FaPencilAlt />
          <span className="d-none d-md-inline"> {m?.maps.rename}</span>
        </Button>
      )}
      {authenticated && id !== undefined && (
        <Button
          className="ml-1"
          variant="danger"
          onClick={() => {
            dispatch(deleteFeature());
          }}
        >
          <FaTrash />
          <span className="d-none d-md-inline">
            {' '}
            {m?.maps.delete} <kbd>Del</kbd>
          </span>
        </Button>
      )}
    </>
  );
}
