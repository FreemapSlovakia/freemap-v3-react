import React, { useEffect, useCallback, useState, ReactElement } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Circle } from 'react-leaflet';

import { mapEventEmitter } from 'fm3/mapEventEmitter';

import { galleryRequestImages } from 'fm3/actions/galleryActions';
import { RootState } from 'fm3/storeCreator';
import { LatLon } from 'fm3/types/common';

export function GalleryPicker(): ReactElement | null {
  const zoom = useSelector((state: RootState) => state.map.zoom);

  const dispatch = useDispatch();

  const [latLon, setLatLon] = useState<LatLon>();

  const handleMapClick = useCallback(
    (lat: number, lon: number) => {
      dispatch(galleryRequestImages({ lat, lon }));
    },
    [dispatch],
  );

  const handleMouseMove = useCallback(
    (lat: number, lon: number, originalEvent: MouseEvent) => {
      if (
        originalEvent.target &&
        (originalEvent.target as HTMLElement).classList.contains(
          'leaflet-container',
        )
      ) {
        setLatLon({ lat, lon });
      } else {
        setLatLon(undefined);
      }
    },
    [],
  );

  const handleMouseOut = useCallback(() => {
    setLatLon(undefined);
  }, []);

  useEffect(() => {
    mapEventEmitter.on('mapClick', handleMapClick);
    mapEventEmitter.on('mouseMove', handleMouseMove);
    mapEventEmitter.on('mouseOut', handleMouseOut);
    return () => {
      mapEventEmitter.removeListener('mapClick', handleMapClick);
      mapEventEmitter.removeListener('mouseMove', handleMouseMove);
      mapEventEmitter.removeListener('mouseOut', handleMouseOut);
    };
  }, [handleMapClick, handleMouseMove, handleMouseOut]);

  return !latLon ? null : (
    <Circle
      interactive={false}
      center={[latLon.lat, latLon.lon]}
      radius={(5000 / 2 ** zoom) * 1000}
      stroke={false}
    />
  );
}
