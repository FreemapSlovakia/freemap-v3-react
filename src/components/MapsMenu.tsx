import { setActiveModal } from 'fm3/actions/mainActions';
import { mapsDisconnect, mapsSave } from 'fm3/actions/mapsActions';
import { useScrollClasses } from 'fm3/hooks/useScrollClasses';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import ButtonToolbar from 'react-bootstrap/esm/ButtonToolbar';
import { FaRegMap, FaSave, FaUnlink } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

export function MapsMenu(): ReactElement {
  const m = useMessages();

  const activeMap = useSelector((state) => state.maps.activeMap);

  const dispatch = useDispatch();

  const sc = useScrollClasses('horizontal');

  return (
    <div className="fm-ib-scroller fm-ib-scroller-top" ref={sc}>
      <div />

      <Card className="fm-toolbar mx-2 mt-2">
        <ButtonToolbar>
          <Button
            variant="primary"
            onClick={() => dispatch(setActiveModal('maps'))}
            title={m?.tools.maps}
          >
            <FaRegMap />
          </Button>

          <span className="align-self-center ml-1 mr-2">
            {activeMap?.name ?? '???'}
          </span>

          {activeMap?.canWrite && (
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
            onClick={() => dispatch(mapsDisconnect())}
            title={m?.maps.disconnect}
          >
            <FaUnlink />
          </Button>
        </ButtonToolbar>
      </Card>
    </div>
  );
}
