import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Circle } from 'react-leaflet';

import mapEventEmitter from 'fm3/emitters/mapEventEmitter';

import { galleryRequestImages } from 'fm3/actions/galleryActions';

class GalleryPicker extends React.Component {
  static propTypes = {
    onImageRequest: PropTypes.func.isRequired,
    zoom: PropTypes.number.isRequired,
  };

  state = {};

  componentDidMount() {
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
    this.props.onImageRequest(lat, lon);
  };

  handleMouseMove = (lat, lon, originalEvent) => {
    if (originalEvent.target.classList.contains('leaflet-container')) {
      this.setState({ lat, lon });
    } else {
      this.setState({ lat: undefined, lon: undefined });
    }
  };

  handleMouseOut = () => {
    this.setState({ lat: undefined, lon: undefined });
  };

  render() {
    const { zoom } = this.props;
    const { lat, lon } = this.state;

    return lat && lon ? (
      <Circle
        interactive={false}
        center={[lat, lon]}
        radius={(5000 / 2 ** zoom) * 1000}
        stroke={false}
      />
    ) : null;
  }
}

export default connect(
  state => ({
    zoom: state.map.zoom,
  }),
  dispatch => ({
    onImageRequest(lat, lon) {
      dispatch(galleryRequestImages(lat, lon));
    },
  }),
)(GalleryPicker);
