import React from 'react';
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
import { DragEndEvent } from 'leaflet';
import { showGalleryViewer } from 'fm3/selectors/mainSelectors';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

class GalleryModals extends React.Component<Props> {
  componentDidMount() {
    mapEventEmitter.on('mapClick', this.handleMapClick);
  }

  componentWillUnmount() {
    mapEventEmitter.removeListener('mapClick', this.handleMapClick);
  }

  // TODO mode to GalleryMenu to be consistent with other tools
  handleMapClick = (lat: number, lon: number) => {
    if (this.props.isPickingPosition) {
      this.props.onPositionPick(lat, lon);
    }
  };

  handlePositionMarkerDragEnd = (e: DragEndEvent) => {
    const coords = e.target.getLatLng();
    this.props.onPositionPick(coords.lat, coords.lng);
  };

  render() {
    const { showGalleryViewer, showFilter, showUploadModal } = this.props;

    return (
      <>
        {showGalleryViewer && <GalleryViewerModal />}
        {showFilter && <GalleryFilterModal />}
        {showUploadModal && <AsyncGalleryUploadModal />}
      </>
    );
  }
}

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
