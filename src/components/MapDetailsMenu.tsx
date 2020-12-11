import React, { ReactElement, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import Button from 'react-bootstrap/lib/Button';

import {
  mapDetailsSetSubtool,
  mapDetailsSetUserSelectedPosition,
} from 'fm3/actions/mapDetailsActions';

import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { useMapEvent } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';

export function MapDetailsMenu(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const subtool = useSelector((state: RootState) => state.mapDetails.subtool);

  const handleMapClick = useCallback(
    ({ latlng }: LeafletMouseEvent) => {
      if (subtool !== null) {
        dispatch(
          mapDetailsSetUserSelectedPosition({
            lat: latlng.lat,
            lon: latlng.lng,
          }),
        );
      }
    },
    [dispatch, subtool],
  );

  useMapEvent('click', handleMapClick);

  return (
    <Button
      onClick={() => {
        dispatch(mapDetailsSetSubtool('track-info'));
      }}
      active={subtool === 'track-info'}
      title={m?.mapDetails.road}
    >
      <FontAwesomeIcon icon="road" />
      <span className="hidden-xs"> {m?.mapDetails.road}</span>
    </Button>
  );
}
