import { setActiveModal } from 'fm3/actions/mainActions';
import { mapsDisconnect, mapsSave } from 'fm3/actions/mapsActions';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import ButtonToolbar from 'react-bootstrap/esm/ButtonToolbar';
import { FaRegMap, FaSave, FaUnlink } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

export function MapsMenu(): ReactElement {
  const m = useMessages();

  const activeMap = useAppSelector((state) => state.maps.activeMap);

  const dispatch = useDispatch();

  return (
    <Card className="fm-toolbar mx-2 mt-2">
      <ButtonToolbar>
        <Button
          variant="primary"
          onClick={() => dispatch(setActiveModal('maps'))}
          title={m?.tools.maps}
        >
          <FaRegMap />
        </Button>

        <span className="align-self-center ms-1 me-2">
          {activeMap?.name ?? '???'}
        </span>

        {activeMap?.canWrite && (
          <Button
            className="ms-1"
            variant="secondary"
            onClick={() => dispatch(mapsSave(undefined))}
            title={m?.maps.save}
          >
            <FaSave />
          </Button>
        )}

        <Button
          className="ms-1"
          variant="secondary"
          onClick={() => dispatch(mapsDisconnect())}
          title={m?.maps.disconnect}
        >
          <FaUnlink />
        </Button>
      </ButtonToolbar>
    </Card>
  );
}
