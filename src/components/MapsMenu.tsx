import { setActiveModal } from 'fm3/actions/mainActions';
import { mapsLoad, mapsSave } from 'fm3/actions/mapsActions';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement } from 'react';
import Button from 'react-bootstrap/Button';
import { FaRegMap, FaSave, FaUnlink } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

export function MapsMenu(): ReactElement {
  const m = useMessages();

  const mapName = useSelector((state) => state.maps.name);

  const id = useSelector((state) => state.maps.id);

  const authenticated = useSelector((state) => !!state.auth.user);

  const dispatch = useDispatch();

  return (
    <>
      <Button
        variant="primary"
        onClick={() => dispatch(setActiveModal('maps'))}
        title={m?.tools.maps}
      >
        <FaRegMap />
      </Button>

      <span className="align-self-center ml-1 mr-2">{mapName}</span>

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
        title={m?.maps.disconnect}
      >
        <FaUnlink />
      </Button>
    </>
  );
}
