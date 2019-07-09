import React from 'react';
import { connect } from 'react-redux';

import mapEventEmitter from 'fm3/emitters/mapEventEmitter';

import GalleryViewerModal from 'fm3/components/gallery/GalleryViewerModal';
import GalleryFilterModal from 'fm3/components/gallery/GalleryFilterModal';
import AsyncGalleryUploadModal from 'fm3/components/gallery/AsyncGalleryUploadModal';
import RichMarker from 'fm3/components/RichMarker';

import { gallerySetPickingPosition } from 'fm3/actions/galleryActions';

import 'fm3/styles/gallery.scss';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';
import { Dispatch } from 'redux';
import { DragEndEvent } from 'leaflet';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

interface IState {}

class GalleryResult extends React.Component<Props, IState> {
  state: IState = {};

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
    const {
      activeImageId,
      isPickingPosition,
      pickingPosition,
      showFilter,
      showUploadModal,
      showPosition,
      image,
    } = this.props;

    return (
      <>
        {pickingPosition && (
          <RichMarker
            draggable
            position={{ lat: pickingPosition.lat, lng: pickingPosition.lon }}
            ondragend={this.handlePositionMarkerDragEnd}
          />
        )}
        {showPosition && image && (
          <RichMarker position={{ lat: image.lat, lng: image.lon }} />
        )}
        {!isPickingPosition && activeImageId && !showPosition && (
          <GalleryViewerModal />
        )}
        {showFilter && <GalleryFilterModal />}
        {showUploadModal && <AsyncGalleryUploadModal />}
      </>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  image: state.gallery.image,
  activeImageId: state.gallery.activeImageId,
  isPickingPosition: state.gallery.pickingPositionForId !== null,
  pickingPosition: state.gallery.pickingPosition,
  showFilter: state.gallery.showFilter,
  showUploadModal: state.gallery.showUploadModal,
  showPosition: state.gallery.showPosition,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onPositionPick(lat: number, lon: number) {
    dispatch(gallerySetPickingPosition({ lat, lon }));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(GalleryResult);
