import { useCallback, ReactElement } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { RichMarker } from 'fm3/components/RichMarker';

import { gallerySetPickingPosition } from 'fm3/actions/galleryActions';

import 'fm3/styles/gallery.scss';
import { RootState } from 'fm3/storeCreator';
import { DragEndEvent, LeafletMouseEvent } from 'leaflet';
import { useMapEvent } from 'react-leaflet';

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
    ({ latlng }: LeafletMouseEvent) => {
      if (isPickingPosition) {
        handlePositionPick(latlng.lat, latlng.lng);
      }
    },
    [isPickingPosition, handlePositionPick],
  );

  useMapEvent('click', handleMapClick);

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
          eventHandlers={{
            dragend: handlePositionMarkerDragEnd,
          }}
        />
      )}
      {showPosition && image && (
        <RichMarker position={{ lat: image.lat, lng: image.lon }} />
      )}
    </>
  );
}
