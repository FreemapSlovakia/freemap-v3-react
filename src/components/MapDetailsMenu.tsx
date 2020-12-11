import React, { ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import Button from 'react-bootstrap/lib/Button';

import {
  mapDetailsSetSubtool,
  mapDetailsSetUserSelectedPosition,
} from 'fm3/actions/mapDetailsActions';

import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { LeafletMouseEvent } from 'leaflet';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';

export function MapDetailsMenu(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const subtool = useSelector((state: RootState) => state.mapDetails.subtool);

  useEffect(() => {
    const map = getMapLeafletElement();

    if (!map) {
      return;
    }

    const handleMapClick = ({ latlng }: LeafletMouseEvent) => {
      if (subtool !== null) {
        dispatch(
          mapDetailsSetUserSelectedPosition({
            lat: latlng.lat,
            lon: latlng.lng,
          }),
        );
      }
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [dispatch, subtool]);

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
