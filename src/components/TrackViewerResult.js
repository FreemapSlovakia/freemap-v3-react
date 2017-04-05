import React from 'react';
import { connect } from 'react-redux';
import { GeoJSON, Tooltip } from 'react-leaflet';
import * as FmPropTypes from 'fm3/propTypes';
import MarkerWithInnerLabel from 'fm3/components/leaflet/MarkerWithInnerLabel';
import strftime from 'strftime';

class TrackViewerResult extends React.Component {

  static propTypes = {
    trackGeojson: React.PropTypes.any,
    startPoints: React.PropTypes.arrayOf(React.PropTypes.shape({
      lat: React.PropTypes.number.isRequired,
      lon: React.PropTypes.number.isRequired,
      lengthInKm: React.PropTypes.number.isRequired,
      startTime: React.PropTypes.string,
    })),
    finishPoints: React.PropTypes.arrayOf(React.PropTypes.shape({
      lat: React.PropTypes.number.isRequired,
      lon: React.PropTypes.number.isRequired,
      lengthInKm: React.PropTypes.number.isRequired,
      finishTime: React.PropTypes.string,
    })),
  }
  render() {
    const { trackGeojson, startPoints, finishPoints } = this.props;
    const keyToAssureProperRefresh = Math.random(); // otherwise GeoJSON will still display the first data
    const onEachFeature = (feature, layer) => {
      if (feature.geometry.type === 'Point' && feature.properties.name) {
        // cannot move this into trackViewerLogic as we need to know the layer to bind to.
        layer.bindTooltip(feature.properties.name, { direction: 'right', className: 'compact' });
      }
    };
    return trackGeojson && (
      <div>
        <GeoJSON
          data={trackGeojson}
          interactive={false}
          key={keyToAssureProperRefresh}
          onEachFeature={onEachFeature}
          style={{ weight: 6, opacity: 0.85 }}
        />

        {startPoints.map((p, i) => (
          <MarkerWithInnerLabel
            faIcon="play"
            key={String(i)}
            faIconLeftPadding="2px"
            color="#409a40"
            interactive={false}
            position={L.latLng(p.lat, p.lon)}
          >
            { p.startTime &&
              <Tooltip offset={new L.Point(9, -25)} direction="right" permanent>
                <span>{strftime('%H:%M', new Date(p.startTime))}</span>
              </Tooltip> }
          </MarkerWithInnerLabel>
          ))}
        {finishPoints.map((p, i) => (
          <MarkerWithInnerLabel
            faIcon="stop"
            key={String(i)}
            faIconLeftPadding="2px"
            color="#d9534f"
            interactive={false}
            position={L.latLng(p.lat, p.lon)}
          >
            <Tooltip offset={new L.Point(9, -25)} direction="right" permanent>
              <span>
                {p.finishTime ? strftime('%H:%M', new Date(p.finishTime)) : ''}
                {p.finishTime ? ', ' : ''}
                {p.lengthInKm.toFixed(1)}km</span>
            </Tooltip>
          </MarkerWithInnerLabel>
          ))}
      </div>
    );
  }
}

export default connect(
  state => ({
    trackGeojson: state.trackViewer.trackGeojson,
    startPoints: state.trackViewer.startPoints,
    finishPoints: state.trackViewer.finishPoints,
  }),
  () => ({}),
)(TrackViewerResult);
