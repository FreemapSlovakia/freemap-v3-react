import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { LeafletMouseEvent } from 'leaflet';
import { type ReactElement, useCallback, useState } from 'react';
import { Circle, useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { isEventOnMap } from '../../../mapUtils.js';
import type { LatLon } from '../../../types/common.js';
import { galleryRequestImages } from '../model/actions.js';

export function GalleryPicker(): ReactElement | null {
  const zoom = useAppSelector((state) => state.map.zoom);

  const dispatch = useDispatch();

  const [latLon, setLatLon] = useState<LatLon>();

  useMapEvent(
    'click',
    useCallback(
      ({ latlng }: LeafletMouseEvent) => {
        dispatch(galleryRequestImages({ lat: latlng.lat, lon: latlng.lng }));
      },
      [dispatch],
    ),
  );

  useMapEvent(
    'mousemove',
    useCallback(({ latlng, originalEvent }: LeafletMouseEvent) => {
      if (isEventOnMap(originalEvent)) {
        setLatLon({ lat: latlng.lat, lon: latlng.lng });
      } else {
        setLatLon(undefined);
      }
    }, []),
  );

  useMapEvent(
    'mouseout',
    useCallback(() => {
      setLatLon(undefined);
    }, []),
  );

  return !latLon ? null : (
    <Circle
      interactive={false}
      center={[latLon.lat, latLon.lon]}
      radius={(5000 / 2 ** zoom) * 1000}
      stroke={false}
    />
  );
}
