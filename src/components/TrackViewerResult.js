import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { GeoJSON, Tooltip } from 'react-leaflet';
import ElevationChartActivePoint from 'fm3/components/ElevationChartActivePoint';
import MarkerWithInnerLabel from 'fm3/components/leaflet/MarkerWithInnerLabel';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import turfLineSlice from '@turf/line-slice';
import turfLineDistance from '@turf/line-distance';
import LeafletHotline from 'leaflet-hotline'; // eslint-disable-line

const oneDecimalDigitNumberFormat = Intl.NumberFormat('sk', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const timeFormat = new Intl.DateTimeFormat('sk', { hour: 'numeric', minute: '2-digit' });

class TrackViewerResult extends React.Component {

  static propTypes = {
    trackGeojson: PropTypes.shape({}),
    startPoints: PropTypes.arrayOf(PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lon: PropTypes.number.isRequired,
      startTime: PropTypes.string,
    })),
    finishPoints: PropTypes.arrayOf(PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lon: PropTypes.number.isRequired,
      lengthInKm: PropTypes.number.isRequired,
      finishTime: PropTypes.string,
    })),
    displayingElevationChart: PropTypes.bool,
  }

  state = {
    infoLat: undefined,
    infoLon: undefined,
    infoDistanceKm: undefined,
  }

  componentWillUnmount() {
    this.removeColorizedEleTrackFromMap();
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

  setColorizedEleTrackOnMap = () => {
    this.removeColorizedEleTrackFromMap();
    if (this.props.displayingElevationChart) {
      const firstRealFeature = this.props.trackGeojson.features[0]; // eslint-disable-line
      const coords = firstRealFeature.geometry.coordinates;
      const eles = coords.map(lonLatEle => lonLatEle[2]);
      const maxEle = Math.max(...eles);
      const minEle = Math.min(...eles);
      const colorLineData = coords.map((lonLatEle) => {
        const lat = lonLatEle[1];
        const lon = lonLatEle[0];
        const ele = lonLatEle[2];
        const color = (ele - minEle) / (maxEle - minEle);

        return [lat, lon, color];
      });
      const line = L.hotline(colorLineData, { weight: 4 });
      line.isColorizedElePath = true;
      line.addTo(getMapLeafletElement());
    }
  }

  removeColorizedEleTrackFromMap = () => {
    const map = getMapLeafletElement();
    map.eachLayer((layer) => {
      if (layer.isColorizedElePath) {
        map.removeLayer(layer);
      }
    });
  }

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
    const { trackGeojson, startPoints, finishPoints, displayingElevationChart } = this.props;
    const keyToAssureProperRefresh = (JSON.stringify(trackGeojson) + displayingElevationChart).length; // otherwise GeoJSON will still display the first data
    this.setColorizedEleTrackOnMap();
    return trackGeojson && (
      <div>
        <GeoJSON
          data={trackGeojson}
          key={keyToAssureProperRefresh}
          onEachFeature={this.onEachFeature}
          style={{ weight: 6, opacity: displayingElevationChart ? 0 : 0.85 }}
        />

        {startPoints.map((p, i) => (
          <MarkerWithInnerLabel
            faIcon="play"
            key={i}
            faIconLeftPadding="2px"
            color="#409a40"
            interactive={false}
            position={L.latLng(p.lat, p.lon)}
          >
            { p.startTime &&
              <Tooltip offset={new L.Point(9, -25)} direction="right" permanent>
                <span>{timeFormat.format(new Date(p.startTime))}</span>
              </Tooltip> }
          </MarkerWithInnerLabel>
          ))}
        {finishPoints.map((p, i) => (
          <MarkerWithInnerLabel
            faIcon="stop"
            key={i}
            faIconLeftPadding="2px"
            color="#d9534f"
            interactive={false}
            position={L.latLng(p.lat, p.lon)}
          >
            <Tooltip offset={new L.Point(9, -25)} direction="right" permanent>
              <span>
                {p.finishTime ? timeFormat.format(new Date(p.finishTime)) : ''}
                {p.finishTime ? ', ' : ''}
                {oneDecimalDigitNumberFormat.format(p.lengthInKm)} km</span>
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
                  {oneDecimalDigitNumberFormat.format(this.state.infoDistanceKm)} km
                </span>
              </Tooltip>
            </MarkerWithInnerLabel>}

        <ElevationChartActivePoint />
      </div>
    );
  }
}

export default connect(
  state => ({
    trackGeojson: state.trackViewer.trackGeojson,
    startPoints: state.trackViewer.startPoints,
    finishPoints: state.trackViewer.finishPoints,
    displayingElevationChart: state.elevationChart.trackGeojson !== null,
  }),
)(TrackViewerResult);
