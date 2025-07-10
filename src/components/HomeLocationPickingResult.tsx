import { LeafletMouseEvent } from 'leaflet';
import { type ReactElement, useCallback } from 'react';
import { FaHome } from 'react-icons/fa';
import { useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { setSelectingHomeLocation } from '../actions/mainActions.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { RichMarker } from './RichMarker.js';

export function HomeLocationPickingResult(): ReactElement | null {
  const dispatch = useDispatch();

  useMapEvent(
    'click',
    useCallback(
      ({ latlng }: LeafletMouseEvent) => {
        dispatch(
          setSelectingHomeLocation({ lat: latlng.lat, lon: latlng.lng }),
        );
      },
      [dispatch],
    ),
  );

  const selectingHomeLocation = useAppSelector(
    (state) => state.main.selectingHomeLocation,
  );

  return !selectingHomeLocation ? null : (
    <RichMarker
      position={{
        lat: selectingHomeLocation.lat,
        lng: selectingHomeLocation.lon,
      }}
      interactive={false}
      faIcon={<FaHome />}
    />
  );
}
