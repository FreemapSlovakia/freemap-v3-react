import React from 'react';
import { Marker } from 'react-leaflet';

export default class MarkerWithAutoOpeningPopup extends React.Component {
  componentDidMount() {
    this.marker.leafletElement.openPopup();
  }

  componentDidUpdate() {
    this.marker.leafletElement.openPopup();
  }

  render() {
    return <Marker ref={(m) => { this.marker = m; }} {...this.props} />;
  }
}
