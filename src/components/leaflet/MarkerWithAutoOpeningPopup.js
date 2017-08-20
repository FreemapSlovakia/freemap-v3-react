import React from 'react';
import MarkerWithInnerLabel from 'fm3/components/leaflet/MarkerWithInnerLabel';

export default class MarkerWithAutoOpeningPopup extends React.Component {
  componentDidMount() {
    this.marker.markerRef.leafletElement.openPopup();
  }

  componentDidUpdate() {
    this.marker.markerRef.leafletElement.openPopup();
  }

  render() {
    return <MarkerWithInnerLabel ref={(m) => { this.marker = m; }} {...this.props} />;
  }
}
