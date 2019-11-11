import React, { useEffect, useCallback } from 'react';
import { connect } from 'react-redux';

import { mapEventEmitter } from 'fm3/mapEventEmitter';

import { RichMarker } from 'fm3/components/RichMarker';

import { gallerySetPickingPosition } from 'fm3/actions/galleryActions';

import 'fm3/styles/gallery.scss';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';
import { Dispatch } from 'redux';
import { DragEndEvent } from 'leaflet';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const GalleryResultInt: React.FC<Props> = ({
  pickingPosition,
  showPosition,
  image,
  isPickingPosition,
  onPositionPick,
}) => {
  // TODO mode to GalleryMenu to be consistent with other tools
  const handleMapClick = useCallback(
    (lat: number, lon: number) => {
      if (isPickingPosition) {
        onPositionPick(lat, lon);
      }
    },
    [isPickingPosition, onPositionPick],
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
      onPositionPick(coords.lat, coords.lng);
    },
    [onPositionPick],
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
};

const mapStateToProps = (state: RootState) => ({
  image: state.gallery.image,
  isPickingPosition: state.gallery.pickingPositionForId !== null,
  pickingPosition: state.gallery.pickingPosition,
  showPosition: state.gallery.showPosition,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onPositionPick(lat: number, lon: number) {
    dispatch(gallerySetPickingPosition({ lat, lon }));
  },
});

export const GalleryResult = connect(
  mapStateToProps,
  mapDispatchToProps,
)(GalleryResultInt);
