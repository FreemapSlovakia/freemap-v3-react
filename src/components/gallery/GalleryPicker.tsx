import React from 'react';
import { connect } from 'react-redux';
import { Circle } from 'react-leaflet';

import { mapEventEmitter } from 'fm3/mapEventEmitter';

import { galleryRequestImages } from 'fm3/actions/galleryActions';
import { RootState } from 'fm3/storeCreator';
import { Dispatch } from 'redux';
import { RootAction } from 'fm3/actions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

interface State {
  lat?: number;
  lon?: number;
}

class GalleryPicker extends React.Component<Props, State> {
  state: State = {};

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

  handleMapClick = (lat: number, lon: number) => {
    this.props.onImageRequest(lat, lon);
  };

  handleMouseMove = (lat: number, lon: number, originalEvent: MouseEvent) => {
    if (
      originalEvent.target &&
      (originalEvent.target as HTMLElement).classList.contains(
        'leaflet-container',
      )
    ) {
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

const mapStateToProps = (state: RootState) => ({
  zoom: state.map.zoom,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onImageRequest(lat: number, lon: number) {
    dispatch(galleryRequestImages({ lat, lon }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(GalleryPicker);
