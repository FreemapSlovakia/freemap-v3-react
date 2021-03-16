import { mapDetailsSetSubtool } from 'fm3/actions/mapDetailsActions';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { ReactElement } from 'react';
import Button from 'react-bootstrap/Button';
import { FaRoad } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { DeleteButton } from './DeleteButton';

export function MapDetailsMenu(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const subtool = useSelector((state: RootState) => state.mapDetails.subtool);

  const canDelete = useSelector(
    (state: RootState) => !!state.trackViewer.trackGeojson,
  );

  return (
    <>
      <Button
        className="ml-1"
        variant="secondary"
        onClick={() => {
          dispatch(mapDetailsSetSubtool('track-info'));
        }}
        active={subtool === 'track-info'}
        title={m?.mapDetails.road}
      >
        <FaRoad />
        <span className="d-none d-sm-inline"> {m?.mapDetails.road}</span>
      </Button>
      {canDelete && <DeleteButton />}
    </>
  );
}
