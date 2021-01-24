import { mapDetailsSetSubtool } from 'fm3/actions/mapDetailsActions';
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { ReactElement } from 'react';
import Button from 'react-bootstrap/Button';
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
        variant="secondary"
        onClick={() => {
          dispatch(mapDetailsSetSubtool('track-info'));
        }}
        active={subtool === 'track-info'}
        title={m?.mapDetails.road}
      >
        <FontAwesomeIcon icon="road" />
        <span className="d-none d-sm-inline"> {m?.mapDetails.road}</span>
      </Button>
      {canDelete && <DeleteButton />}
    </>
  );
}
