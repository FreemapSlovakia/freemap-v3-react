import React from 'react';
import RichMarker from 'fm3/components/leaflet/RichMarker';

export default class MarkerWithAutoOpeningPopup extends React.Component {
  componentDidMount() {
    this.marker.markerRef.leafletElement.openPopup();
  }

  componentDidUpdate() {
    this.marker.markerRef.leafletElement.openPopup();
  }

  render() {
    return <RichMarker ref={(m) => { this.marker = m; }} {...this.props} />;
  }
}
