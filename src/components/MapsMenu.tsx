import { setActiveModal } from 'fm3/actions/mainActions';
import { mapsLoad, mapsSave } from 'fm3/actions/mapsActions';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement } from 'react';
import Button from 'react-bootstrap/Button';
import { FaRegMap, FaSave, FaUnlink } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

export function MapsMenu(): ReactElement {
  const m = useMessages();

  const maps = useSelector((state) => state.maps.maps);

  const id = useSelector((state) => state.maps.id);

  const authenticated = useSelector((state) => !!state.auth.user);

  const map = maps.find((map) => map.id === id);

  const dispatch = useDispatch();

  return (
    <>
      <Button
        variant="primary"
        onClick={() => dispatch(setActiveModal('maps'))}
      >
        <FaRegMap />
      </Button>

      <span className="align-self-center ml-1 mr-2">{map?.name}</span>

      {authenticated && id !== undefined && (
        <Button
          className="ml-1"
          variant="secondary"
          onClick={() => dispatch(mapsSave(undefined))}
          title={m?.maps.save}
        >
          <FaSave />
        </Button>
      )}

      <Button
        className="ml-1"
        variant="secondary"
        onClick={() => dispatch(mapsLoad({ id: undefined }))}
      >
        <FaUnlink />
        {/* <span className="d-none d-md-inline"> {m?.maps.save}</span> */}
      </Button>
    </>
  );
}
