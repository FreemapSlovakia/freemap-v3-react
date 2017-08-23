import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Circle } from 'react-leaflet';

import * as FmPropTypes from 'fm3/propTypes';

import mapEventEmitter from 'fm3/emitters/mapEventEmitter';

import GalleryViewerModal from 'fm3/components/GalleryViewerModal';
import GalleryFilterModal from 'fm3/components/GalleryFilterModal';
import AsyncGalleryUploadModal from 'fm3/components/AsyncGalleryUploadModal';
import GalleryLayer from 'fm3/components/GalleryLayer';
import RichMarker from 'fm3/components/RichMarker';

import { galleryRequestImages, gallerySetPickingPosition } from 'fm3/actions/galleryActions';


import 'fm3/styles/gallery.scss';

class GalleryResult extends React.Component {
  static propTypes = {
    onImageRequest: PropTypes.func.isRequired,
    onPositionPick: PropTypes.func.isRequired,
    activeImageId: PropTypes.number,
    zoom: PropTypes.number.isRequired,
    isPickingPosition: PropTypes.bool,
    pickingPosition: FmPropTypes.point,
    uploadSeq: PropTypes.number.isRequired,
    showFilter: PropTypes.bool,
    showUploadModal: PropTypes.bool,
    filter: PropTypes.object.isRequired,
  }

  state = {};

  componentWillMount() {
    mapEventEmitter.on('mapClick', this.handleMapClick);
    mapEventEmitter.on('mouseMove', this.handleMouseMove);
    mapEventEmitter.on('mouseOut', this.handleMouseOut);
  }

  componentWillUnmount() {
    mapEventEmitter.removeListener('mapClick', this.handleMapClick);
    mapEventEmitter.removeListener('mouseMove', this.handleMouseMove);
    mapEventEmitter.removeListener('mouseOut', this.handleMouseOut);
  }

  handleMapClick = (lat, lon) => {
    if (this.props.isPickingPosition) {
      this.props.onPositionPick(lat, lon);
    } else {
      this.props.onImageRequest(lat, lon);
    }
  }

  handleMouseMove = (lat, lon) => {
    this.setState({ lat, lon });
  }

  handleMouseOut = () => {
    this.setState({ lat: undefined, lon: undefined });
  }

  handlePositionMarkerDragEnd = (e) => {
    const coords = e.target.getLatLng();
    this.props.onPositionPick(coords.lat, coords.lng);
  }

  render() {
    const { activeImageId, zoom, isPickingPosition, pickingPosition, uploadSeq, showFilter, showUploadModal, filter } = this.props;

    return (
      <div>
        {pickingPosition &&
          <RichMarker
            draggable
            position={L.latLng(pickingPosition.lat, pickingPosition.lon)}
            onDragend={this.handlePositionMarkerDragEnd}
          />
        }

        {this.state.lat && this.state.lon && !isPickingPosition &&
          <Circle
            center={[this.state.lat, this.state.lon]}
            radius={5000 / 2 ** zoom * 1000}
            stroke={false}
          />
        }

        {!isPickingPosition && <GalleryLayer key={`${uploadSeq}-${JSON.stringify(filter)}`} filter={filter} />}

        {activeImageId && <GalleryViewerModal />}

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
    zoom: state.map.zoom,
    isPickingPosition: state.gallery.pickingPositionForId !== null,
    pickingPosition: state.gallery.pickingPosition,
    uploadSeq: state.gallery.uploadSeq,
    showFilter: state.gallery.showFilter,
    showUploadModal: state.gallery.showUploadModal,
    filter: state.gallery.filter,
  }),
  dispatch => ({
    onImageRequest(lat, lon) {
      dispatch(galleryRequestImages(lat, lon));
    },
    onPositionPick(lat, lon) {
      dispatch(gallerySetPickingPosition(lat, lon));
    },
  }),
)(GalleryResult);
