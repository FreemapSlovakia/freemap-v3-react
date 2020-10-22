import React, { useEffect, useCallback } from 'react';
import { connect } from 'react-redux';

import { mapEventEmitter } from 'fm3/mapEventEmitter';

import {
  AsyncGalleryFilterModal,
  AsyncGalleryViewerModal,
  AsyncGalleryUploadModal,
} from 'fm3/components/AsyncComponents';

import { gallerySetPickingPosition } from 'fm3/actions/galleryActions';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';
import { Dispatch } from 'redux';
import { showGalleryViewer } from 'fm3/selectors/mainSelectors';

import 'fm3/styles/gallery.scss';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const GalleryModalsInt: React.FC<Props> = ({
  showGalleryViewer,
  showFilter,
  showUploadModal,
  onPositionPick,
  isPickingPosition,
}) => {
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

  return (
    <>
      {showGalleryViewer && <AsyncGalleryViewerModal />}
      {showFilter && <AsyncGalleryFilterModal />}
      {showUploadModal && <AsyncGalleryUploadModal />}
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  activeImageId: state.gallery.activeImageId,
  isPickingPosition: state.gallery.pickingPositionForId !== null,
  showFilter: state.gallery.showFilter,
  showUploadModal:
    state.gallery.showUploadModal &&
    state.auth.user &&
    !state.auth.user.notValidated,
  showPosition: state.gallery.showPosition,
  showGalleryViewer: showGalleryViewer(state),
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onPositionPick(lat: number, lon: number) {
    dispatch(gallerySetPickingPosition({ lat, lon }));
  },
});

export const GalleryModals = connect(
  mapStateToProps,
  mapDispatchToProps,
)(GalleryModalsInt);
