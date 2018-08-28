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
    showPosition: PropTypes.bool,
    image: PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lon: PropTypes.number.isRequired,
    }),
  }

  state = {};

  componentDidMount() {
    mapEventEmitter.on('mapClick', this.handleMapClick);
  }

  componentWillUnmount() {
    mapEventEmitter.removeListener('mapClick', this.handleMapClick);
  }

  // TODO mode to GalleryMenu to be consistent with other tools
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
    const { activeImageId, isPickingPosition, pickingPosition, showFilter, showUploadModal, showPosition, image } = this.props;

    return (
      <React.Fragment>
        {pickingPosition && (
          <RichMarker
            draggable
            position={L.latLng(pickingPosition.lat, pickingPosition.lon)}
            onDragend={this.handlePositionMarkerDragEnd}
          />
        )}
        {showPosition && image && <RichMarker position={L.latLng(image.lat, image.lon)} />}
        {!isPickingPosition && activeImageId && !showPosition && <GalleryViewerModal />}
        {showFilter && <GalleryFilterModal />}
        {showUploadModal && <AsyncGalleryUploadModal />}
      </React.Fragment>
    );
  }
}

export default connect(
  state => ({
    image: state.gallery.image,
    activeImageId: state.gallery.activeImageId,
    isPickingPosition: state.gallery.pickingPositionForId !== null,
    pickingPosition: state.gallery.pickingPosition,
    showFilter: state.gallery.showFilter,
    showUploadModal: state.gallery.showUploadModal,
    showPosition: state.gallery.showPosition,
  }),
  dispatch => ({
    onPositionPick(lat, lon) {
      dispatch(gallerySetPickingPosition(lat, lon));
    },
  }),
)(GalleryResult);
