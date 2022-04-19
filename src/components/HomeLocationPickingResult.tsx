import { setSelectingHomeLocation } from 'fm3/actions/mainActions';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { LeafletMouseEvent } from 'leaflet';
import { ReactElement, useCallback } from 'react';
import { FaHome } from 'react-icons/fa';
import { useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { RichMarker } from './RichMarker';

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

  if (!selectingHomeLocation) {
    return null;
  }

  return (
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
