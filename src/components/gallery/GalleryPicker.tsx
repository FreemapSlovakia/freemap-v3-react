import { galleryRequestImages } from 'fm3/actions/galleryActions';
import { LatLon } from 'fm3/types/common';
import { LeafletMouseEvent } from 'leaflet';
import { ReactElement, useCallback, useState } from 'react';
import { Circle, useMapEvent } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';

export function GalleryPicker(): ReactElement | null {
  const zoom = useSelector((state) => state.map.zoom);

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
      if (
        originalEvent.target &&
        (originalEvent.target as HTMLElement).classList.contains(
          'leaflet-container',
        )
      ) {
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
