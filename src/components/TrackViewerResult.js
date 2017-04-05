import React from 'react';
import { connect } from 'react-redux';
import { GeoJSON } from 'react-leaflet';

class TrackViewerResult extends React.Component {

  static propTypes = {
    trackGeojson: React.PropTypes.any,
  }

  render() {
    const { trackGeojson } = this.props;
    const keyToAssureProperRefresh = Math.random(); // otherwise GeoJSON will still display the first data
    return trackGeojson && (
      <GeoJSON data={trackGeojson} key={keyToAssureProperRefresh} style={{ weight: 6, opacity: 0.85 }} />
    );
  }
}

export default connect(
  state => ({
    trackGeojson: state.trackViewer.trackGeojson,
  }),
  () => ({}),
)(TrackViewerResult);
