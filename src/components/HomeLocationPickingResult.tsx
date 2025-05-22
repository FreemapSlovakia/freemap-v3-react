import { LeafletMouseEvent } from 'leaflet';
import { type ReactElement, useCallback } from 'react';
import { FaHome } from 'react-icons/fa';
import { useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { setSelectingHomeLocation } from '../actions/mainActions.js';
import { useAppSelector } from '../hooks/reduxSelectHook.js';
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
      // eventHandlers={{
      //   dragstart: onSelects[i],
      //   dragend: handleDragEnd,
      //   drag: handleDrag,
      // }}
      position={{
        lat: selectingHomeLocation.lat,
        lng: selectingHomeLocation.lon,
      }}
      // draggable={!window.fmEmbedded && activeIndex === i}
      interactive={false}
      faIcon={<FaHome />}
    />
  );
}
