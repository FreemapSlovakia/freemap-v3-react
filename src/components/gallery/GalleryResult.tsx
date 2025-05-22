import { DragEndEvent, LeafletMouseEvent } from 'leaflet';
import { type ReactElement, useCallback } from 'react';
import { useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { gallerySetPickingPosition } from '../../actions/galleryActions.js';
import { RichMarker } from '../../components/RichMarker.js';
import { useAppSelector } from '../../hooks/reduxSelectHook.js';
import '../../styles/gallery.scss';

export function GalleryResult(): ReactElement {
  const dispatch = useDispatch();

  const image = useAppSelector((state) => state.gallery.image);

  const isPickingPosition = useAppSelector(
    (state) => state.gallery.pickingPositionForId !== null,
  );

  const pickingPosition = useAppSelector(
    (state) => state.gallery.pickingPosition,
  );

  const showPosition = useAppSelector((state) => state.gallery.showPosition);

  const handlePositionPick = useCallback(
    (lat: number, lon: number) => {
      dispatch(gallerySetPickingPosition({ lat, lon }));
    },
    [dispatch],
  );

  // TODO move to GalleryMenu to be consistent with other tools
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
        <RichMarker
          position={{ lat: image.lat, lng: image.lon }}
          interactive={false}
        />
      )}
    </>
  );
}
