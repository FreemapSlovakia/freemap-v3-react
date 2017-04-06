import React from 'react';
import { connect } from 'react-redux';
import { GeoJSON, Tooltip } from 'react-leaflet';
import MarkerWithInnerLabel from 'fm3/components/leaflet/MarkerWithInnerLabel';
import strftime from 'strftime';
import turfLineSlice from '@turf/line-slice';
import turfLineDistance from '@turf/line-distance';

class TrackViewerResult extends React.Component {

  static propTypes = {
    trackGeojson: React.PropTypes.any,
    startPoints: React.PropTypes.arrayOf(React.PropTypes.shape({
      lat: React.PropTypes.number.isRequired,
      lon: React.PropTypes.number.isRequired,
      startTime: React.PropTypes.string,
    })),
    finishPoints: React.PropTypes.arrayOf(React.PropTypes.shape({
      lat: React.PropTypes.number.isRequired,
      lon: React.PropTypes.number.isRequired,
      lengthInKm: React.PropTypes.number.isRequired,
      finishTime: React.PropTypes.string,
    })),
  }

  state = {
    infoLat: undefined,
    infoLon: undefined,
    infoDistanceKm: undefined,
  }

  // we keep here only business logic which needs access to the layer (otherwise use trackViewerLogic)
  onEachFeature = (feature, layer) => {
    if (feature.geometry.type === 'Point' && feature.properties.name) {
      layer.bindTooltip(feature.properties.name, { direction: 'right', className: 'compact' });
    }

    if (feature.geometry.type === 'LineString') {
      layer.on('click', (e) => { this.showInfoPoint(e, feature); });
      layer.on('mouseover', (e) => { this.showInfoPoint(e, feature); });
      layer.on('mouseout', () => {
        this.setState({ infoLat: undefined, infoLon: undefined, infoDistanceKm: undefined });
      });
    }
  };

  showInfoPoint = (e, feature) => {
    const infoLat = e.latlng.lat;
    const infoLon = e.latlng.lng;
    const infoDistanceKm = this.computeInfoDistanceKm(infoLat, infoLon, feature);
    this.setState({ infoLat, infoLon, infoDistanceKm });
  }

  computeInfoDistanceKm = (infoLat, infoLon, geojsonLineString) => {
    const p1 = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: geojsonLineString.geometry.coordinates[0] },
    };
    const p2 = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [infoLon, infoLat] },
    };
    const s = turfLineSlice(p1, p2, geojsonLineString);
    return turfLineDistance(s);
  }

  render() {
    const { trackGeojson, startPoints, finishPoints } = this.props;
    const keyToAssureProperRefresh = JSON.stringify(trackGeojson).length; // otherwise GeoJSON will still display the first data

    return trackGeojson && (
      <div>
        <GeoJSON
          data={trackGeojson}
          key={keyToAssureProperRefresh}
          onEachFeature={this.onEachFeature}
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

          {this.state.infoLat &&
            <MarkerWithInnerLabel
              faIcon="info"
              faIconLeftPadding="2px"
              color="grey"
              interactive={false}
              position={L.latLng(this.state.infoLat, this.state.infoLon)}
            >
              <Tooltip className="compact" offset={new L.Point(9, -25)} direction="right" permanent>
                <span>
                  {this.state.infoDistanceKm.toFixed(1)}km
                </span>
              </Tooltip>
            </MarkerWithInnerLabel>}
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
