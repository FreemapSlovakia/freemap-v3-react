import { ReactElement } from 'react';
import { Button, ButtonToolbar, Card } from 'react-bootstrap';
import { FaRegMap, FaSave, FaUnlink } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { setActiveModal } from '../actions/mainActions.js';
import { mapsDisconnect, mapsSave } from '../actions/mapsActions.js';
import { useAppSelector } from '../hooks/reduxSelectHook.js';
import { useMessages } from '../l10nInjector.js';

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
