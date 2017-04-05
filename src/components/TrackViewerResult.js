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
    const onEachFeature = (feature, layer) => {
      // does this feature have a property named popupContent?
      if (feature.geometry.type === 'Point' && feature.properties.name) {
        layer.bindTooltip(feature.properties.name, { direction: 'right', className: 'compact' });
      }
    };
    return trackGeojson && (
      <GeoJSON
        data={trackGeojson}
        key={keyToAssureProperRefresh}
        onEachFeature={onEachFeature}
        style={{ weight: 6, opacity: 0.85 }}
      />
    );
  }
}

export default connect(
  state => ({
    trackGeojson: state.trackViewer.trackGeojson,
  }),
  () => ({}),
)(TrackViewerResult);
