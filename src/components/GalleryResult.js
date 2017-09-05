import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import * as FmPropTypes from 'fm3/propTypes';

import mapEventEmitter from 'fm3/emitters/mapEventEmitter';

import GalleryViewerModal from 'fm3/components/GalleryViewerModal';
import GalleryFilterModal from 'fm3/components/GalleryFilterModal';
import AsyncGalleryUploadModal from 'fm3/components/AsyncGalleryUploadModal';
import RichMarker from 'fm3/components/RichMarker';
import GalleryLayer from 'fm3/components/GalleryLayer';

import { gallerySetPickingPosition } from 'fm3/actions/galleryActions';


import 'fm3/styles/gallery.scss';

class GalleryResult extends React.Component {
  static propTypes = {
    onPositionPick: PropTypes.func.isRequired,
    activeImageId: PropTypes.number,
    isPickingPosition: PropTypes.bool,
    pickingPosition: FmPropTypes.point,
    showFilter: PropTypes.bool,
    showUploadModal: PropTypes.bool,
    show: PropTypes.bool,
    galleryDirtySeq: PropTypes.number.isRequired,
    galleryFilter: FmPropTypes.galleryFilter.isRequired,
  }

  state = {};

  componentWillMount() {
    mapEventEmitter.on('mapClick', this.handleMapClick);
  }

  componentWillUnmount() {
    mapEventEmitter.removeListener('mapClick', this.handleMapClick);
  }

  handleMapClick = (lat, lon) => {
    if (this.props.isPickingPosition) {
      this.props.onPositionPick(lat, lon);
    }
  }

  handlePositionMarkerDragEnd = (e) => {
    const coords = e.target.getLatLng();
    this.props.onPositionPick(coords.lat, coords.lng);
  }

  render() {
    const { activeImageId, isPickingPosition, pickingPosition, showFilter, showUploadModal, show, galleryDirtySeq, galleryFilter } = this.props;

    return (
      <div>
        {pickingPosition &&
          <RichMarker
            draggable
            position={L.latLng(pickingPosition.lat, pickingPosition.lon)}
            onDragend={this.handlePositionMarkerDragEnd}
          />
        }

        {!isPickingPosition && activeImageId && <GalleryViewerModal />}

        {showFilter && <GalleryFilterModal />}

        {showUploadModal && <AsyncGalleryUploadModal />}

        {show &&
          <GalleryLayer
            key={`${galleryDirtySeq}-${JSON.stringify(galleryFilter)}`}
            filter={galleryFilter}
          />
        }

      </div>
    );
  }
}

export default connect(
  state => ({
    images: state.gallery.images,
    activeImageId: state.gallery.activeImageId,
    isPickingPosition: state.gallery.pickingPositionForId !== null,
    pickingPosition: state.gallery.pickingPosition,
    showFilter: state.gallery.showFilter,
    showUploadModal: state.gallery.showUploadModal,
    show: state.gallery.show,
    galleryFilter: state.gallery.filter,
    galleryDirtySeq: state.gallery.dirtySeq,
  }),
  dispatch => ({
    onPositionPick(lat, lon) {
      dispatch(gallerySetPickingPosition(lat, lon));
    },
  }),
)(GalleryResult);
