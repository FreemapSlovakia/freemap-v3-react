import { LeafletMouseEvent } from 'leaflet';
import { type ReactElement, useCallback, useState } from 'react';
import { Circle, useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { searchSetQuery } from '../actions/searchActions.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { isEventOnMap } from '../mapUtils.js';
import type { LatLon } from '../types/common.js';

export function MapDetailsTool(): ReactElement | null {
  const dispatch = useDispatch();

  const [latLon, setLatLon] = useState<LatLon>();

  useMapEvent(
    'click',
    useCallback(
      (e: LeafletMouseEvent) => {
        dispatch(
          searchSetQuery({
            query:
              '@' + e.latlng.lat.toFixed(6) + ',' + e.latlng.lng.toFixed(6),
          }),
        );
      },
      [dispatch],
    ),
  );

  useMapEvent(
    'mousemove',
    useCallback(({ latlng, originalEvent }: LeafletMouseEvent) => {
      setLatLon(
        isEventOnMap(originalEvent)
          ? { lat: latlng.lat, lon: latlng.lng }
          : undefined,
      );
    }, []),
  );

  useMapEvent(
    'mouseout',
    useCallback(() => {
      setLatLon(undefined);
    }, []),
  );

  const hasNearby = useAppSelector(
    (state) => !state.mapDetails.excludeSources.includes('overpass-nearby'),
  );

  return latLon && hasNearby ? (
    <Circle
      interactive={false}
      center={[latLon.lat, latLon.lon]}
      radius={33}
      stroke={false}
    />
  ) : null;
}
