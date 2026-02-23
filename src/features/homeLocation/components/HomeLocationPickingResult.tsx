import { setSelectingHomeLocation } from '@features/homeLocation/model/actions.js';
import { RichMarker } from '@shared/components/RichMarker.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { LeafletMouseEvent } from 'leaflet';
import { type ReactElement, useCallback } from 'react';
import { FaHome } from 'react-icons/fa';
import { useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';

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
    (state) => state.homeLocation.selectingHomeLocation,
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
