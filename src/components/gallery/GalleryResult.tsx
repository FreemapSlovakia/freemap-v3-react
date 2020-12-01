import React, { useEffect, useCallback, ReactElement } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { mapEventEmitter } from 'fm3/mapEventEmitter';

import { RichMarker } from 'fm3/components/RichMarker';

import { gallerySetPickingPosition } from 'fm3/actions/galleryActions';

import 'fm3/styles/gallery.scss';
import { RootState } from 'fm3/storeCreator';
import { DragEndEvent } from 'leaflet';

export function GalleryResult(): ReactElement {
  const dispatch = useDispatch();

  const image = useSelector((state: RootState) => state.gallery.image);

  const isPickingPosition = useSelector(
    (state: RootState) => state.gallery.pickingPositionForId !== null,
  );

  const pickingPosition = useSelector(
    (state: RootState) => state.gallery.pickingPosition,
  );

  const showPosition = useSelector(
    (state: RootState) => state.gallery.showPosition,
  );

  const handlePositionPick = useCallback(
    (lat: number, lon: number) => {
      dispatch(gallerySetPickingPosition({ lat, lon }));
    },
    [dispatch],
  );

  // TODO mode to GalleryMenu to be consistent with other tools
  const handleMapClick = useCallback(
    (lat: number, lon: number) => {
      if (isPickingPosition) {
        handlePositionPick(lat, lon);
      }
    },
    [isPickingPosition, handlePositionPick],
  );

  useEffect(() => {
    mapEventEmitter.on('mapClick', handleMapClick);

    return () => {
      mapEventEmitter.removeListener('mapClick', handleMapClick);
    };
  }, [handleMapClick]);

  const handlePositionMarkerDragEnd = useCallback(
    (e: DragEndEvent) => {
      const coords = e.target.getLatLng();
      handlePositionPick(coords.lat, coords.lng);
    },
    [handlePositionPick],
  );

  return (
    <>
      {pickingPosition && (
        <RichMarker
          draggable
          position={{ lat: pickingPosition.lat, lng: pickingPosition.lon }}
          ondragend={handlePositionMarkerDragEnd}
        />
      )}
      {showPosition && image && (
        <RichMarker position={{ lat: image.lat, lng: image.lon }} />
      )}
    </>
  );
}
