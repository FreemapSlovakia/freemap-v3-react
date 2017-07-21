import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Circle, TileLayer } from 'react-leaflet';

import mapEventEmitter from 'fm3/emitters/mapEventEmitter';

import GalleryViewerModal from 'fm3/components/GalleryViewerModal';

import { galleryRequestImages } from 'fm3/actions/galleryActions';

import 'fm3/styles/gallery.scss';

class GalleryResult extends React.Component {
  static propTypes = {
    onImageRequest: PropTypes.func.isRequired,
    activeImageId: PropTypes.number,
    zoom: PropTypes.number.isRequired,
    pickingPosition: PropTypes.bool,
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
    if (this.props.pickingPosition) {
      // TODO
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

  render() {
    const { activeImageId, zoom, pickingPosition } = this.props;

    return (
      <div>
        {!pickingPosition &&
          <TileLayer
            url="http://t1.freemap.sk/data/layers/presets/X~I/{z}/{x}/{y}t.png"
            maxZoom={20}
            minZoom={8}
            maxNativeZoom={16}
            zIndex={100}
          />
        }

        {this.state.lat && this.state.lon && !pickingPosition &&
          <Circle
            center={[this.state.lat, this.state.lon]}
            radius={5000 / 2 ** zoom * 1000}
            stroke={false}
          />
        }

        {activeImageId && <GalleryViewerModal />}
      </div>
    );
  }
}

export default connect(
  state => ({
    images: state.gallery.images,
    activeImageId: state.gallery.activeImageId,
    zoom: state.map.zoom,
    pickingPosition: state.gallery.pickingPositionForId !== null,
  }),
  dispatch => ({
    onImageRequest(lat, lon) {
      dispatch(galleryRequestImages(lat, lon));
    },
  }),
)(GalleryResult);
