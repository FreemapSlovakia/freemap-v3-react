import { LeafletMouseEvent } from 'leaflet';
import { ReactElement, useCallback, useState } from 'react';
import { Circle, useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { galleryRequestImages } from '../../actions/galleryActions.js';
import { useAppSelector } from '../../hooks/reduxSelectHook.js';
import { isEventOnMap } from '../../mapUtils.js';
import { LatLon } from '../../types/common.js';

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
