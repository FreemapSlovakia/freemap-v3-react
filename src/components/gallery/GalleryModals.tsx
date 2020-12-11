import React, { useCallback, ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  AsyncGalleryFilterModal,
  AsyncGalleryViewerModal,
  AsyncGalleryUploadModal,
} from 'fm3/components/AsyncComponents';

import { gallerySetPickingPosition } from 'fm3/actions/galleryActions';
import { RootState } from 'fm3/storeCreator';
import { showGalleryViewer as shouldShowGalleryViewer } from 'fm3/selectors/mainSelectors';

import 'fm3/styles/gallery.scss';
import { useMapEvent } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';

export function GalleryModals(): ReactElement {
  const dispatch = useDispatch();

  const isPickingPosition = useSelector(
    (state: RootState) => state.gallery.pickingPositionForId !== null,
  );

  const showFilter = useSelector(
    (state: RootState) => state.gallery.showFilter,
  );

  const showGalleryViewer = useSelector((state: RootState) =>
    shouldShowGalleryViewer(state),
  );

  const showUploadModal = useSelector(
    (state: RootState) =>
      state.gallery.showUploadModal &&
      state.auth.user &&
      !state.auth.user.notValidated,
  );

  const handleMapClick = useCallback(
    ({ latlng }: LeafletMouseEvent) => {
      if (isPickingPosition) {
        dispatch(
          gallerySetPickingPosition({ lat: latlng.lat, lon: latlng.lng }),
        );
      }
    },
    [isPickingPosition, dispatch],
  );

  useMapEvent('click', handleMapClick);

  return (
    <>
      {showGalleryViewer && <AsyncGalleryViewerModal />}
      {showFilter && <AsyncGalleryFilterModal />}
      {showUploadModal && <AsyncGalleryUploadModal />}
    </>
  );
}
