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

    const elems = [];

    if (pickingPosition) {
      elems.push(
        <RichMarker
          key="DGukc5859i"
          draggable
          position={L.latLng(pickingPosition.lat, pickingPosition.lon)}
          onDragend={this.handlePositionMarkerDragEnd}
        />,
      );
    }

    if (!isPickingPosition && activeImageId) {
      elems.push(<GalleryViewerModal key="4hDH4B4mwr" />);
    }

    if (showFilter) {
      elems.push(<GalleryFilterModal key="pICrAO8qUI" />);
    }

    if (showUploadModal) {
      elems.push(<AsyncGalleryUploadModal key="ybN1tzcF9K" />);
    }

    return elems;
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
