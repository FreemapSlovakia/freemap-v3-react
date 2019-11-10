import React, { useEffect, useCallback } from 'react';
import { connect } from 'react-redux';

import { mapEventEmitter } from 'fm3/mapEventEmitter';

import GalleryViewerModal from 'fm3/components/gallery/GalleryViewerModal';
import GalleryFilterModal from 'fm3/components/gallery/GalleryFilterModal';
import AsyncGalleryUploadModal from 'fm3/components/gallery/AsyncGalleryUploadModal';

import { gallerySetPickingPosition } from 'fm3/actions/galleryActions';

import 'fm3/styles/gallery.scss';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';
import { Dispatch } from 'redux';
import { showGalleryViewer } from 'fm3/selectors/mainSelectors';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const GalleryModals: React.FC<Props> = ({
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
      {showGalleryViewer && <GalleryViewerModal />}
      {showFilter && <GalleryFilterModal />}
      {showUploadModal && <AsyncGalleryUploadModal />}
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  activeImageId: state.gallery.activeImageId,
  isPickingPosition: state.gallery.pickingPositionForId !== null,
  showFilter: state.gallery.showFilter,
  showUploadModal: state.gallery.showUploadModal,
  showPosition: state.gallery.showPosition,
  showGalleryViewer: showGalleryViewer(state),
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onPositionPick(lat: number, lon: number) {
    dispatch(gallerySetPickingPosition({ lat, lon }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(GalleryModals);
