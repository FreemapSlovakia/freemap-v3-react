import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import * as FmPropTypes from 'fm3/propTypes';

import mapEventEmitter from 'fm3/emitters/mapEventEmitter';

import GalleryViewerModal from 'fm3/components/GalleryViewerModal';
import GalleryFilterModal from 'fm3/components/GalleryFilterModal';
import AsyncGalleryUploadModal from 'fm3/components/AsyncGalleryUploadModal';
import RichMarker from 'fm3/components/RichMarker';

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
    const {
      activeImageId, isPickingPosition, pickingPosition, showFilter, showUploadModal,
    } = this.props;

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
  }),
  dispatch => ({
    onPositionPick(lat, lon) {
      dispatch(gallerySetPickingPosition(lat, lon));
    },
  }),
)(GalleryResult);
