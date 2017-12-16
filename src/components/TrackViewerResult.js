import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { GeoJSON, Tooltip } from 'react-leaflet';
import ElevationChartActivePoint from 'fm3/components/ElevationChartActivePoint';
import RichMarker, { createMarkerIcon } from 'fm3/components/RichMarker';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import turfLineSlice from '@turf/line-slice';
import turfLineDistance from '@turf/line-distance';
import LeafletHotline from 'leaflet-hotline'; // eslint-disable-line

import { distance, smoothElevations } from 'fm3/geoutils';

const oneDecimalDigitNumberFormat = Intl.NumberFormat('sk', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const timeFormat = new Intl.DateTimeFormat('sk', { hour: 'numeric', minute: '2-digit' });

class TrackViewerResult extends React.Component {
  static propTypes = {
    trackGeojson: PropTypes.shape({}),
    startPoints: PropTypes.arrayOf(PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lon: PropTypes.number.isRequired,
      startTime: PropTypes.string,
    })).isRequired,
    finishPoints: PropTypes.arrayOf(PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lon: PropTypes.number.isRequired,
      lengthInKm: PropTypes.number.isRequired,
      finishTime: PropTypes.string,
    })).isRequired,
    displayingElevationChart: PropTypes.bool,
    colorizeTrackBy: PropTypes.oneOf(['elevation', 'steepness']),
    eleSmoothingFactor: PropTypes.number.isRequired,
  }

  state = {
    infoLat: undefined,
    infoLon: undefined,
    infoDistanceKm: undefined,
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.trackGeojson) {
      return;
    }

    if (nextProps.trackGeojson && JSON.stringify(this.props.trackGeojson) !== JSON.stringify(nextProps.trackGeojson)) {
      const geojsonBounds = L.geoJson(nextProps.trackGeojson).getBounds();
      if (geojsonBounds.isValid()) {
        getMapLeafletElement().fitBounds(geojsonBounds);
      }
    }

    const userTurnedOnEleProfile = !this.props.displayingElevationChart && nextProps.displayingElevationChart;
    const userTurnedOffEleProfile = this.props.displayingElevationChart && !nextProps.displayingElevationChart;
    const userToggledColorizeTrackBy = this.props.colorizeTrackBy !== nextProps.colorizeTrackBy;
    if (userTurnedOnEleProfile) {
      this.showColorizedEleTrackOnMap(nextProps.colorizeTrackBy);
    } else if (userTurnedOffEleProfile) {
      this.removeColorizedEleTrackFromMap();
    } else if (userToggledColorizeTrackBy) {
      this.removeColorizedEleTrackFromMap();
      this.showColorizedEleTrackOnMap(nextProps.colorizeTrackBy);
    }
  }

  componentWillUnmount() {
    this.removeColorizedEleTrackFromMap();
  }

  // we keep here only business logic which needs access to the layer (otherwise use trackViewerLogic)
  handleEachFeature = (feature, layer) => {
    if (feature.geometry.type === 'Point' && feature.properties && feature.properties.name) {
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

  colorLineDataForElevation = () => {
    const firstRealFeature = this.props.trackGeojson.features[0]; // eslint-disable-line
    const latLonSmoothEles = smoothElevations(firstRealFeature, this.props.eleSmoothingFactor);
    const eles = latLonSmoothEles.map(lonLatEle => lonLatEle[2]);
    const maxEle = Math.max(...eles);
    const minEle = Math.min(...eles);
    return latLonSmoothEles.map((latLonEle) => {
      const color = (latLonEle[2] - minEle) / (maxEle - minEle);
      return [latLonEle[0], latLonEle[1], color || 0];
    });
  }

  colorLineDataForSteepness = () => {
    const firstRealFeature = this.props.trackGeojson.features[0]; // eslint-disable-line
    const latLonSmoothEles = smoothElevations(firstRealFeature, this.props.eleSmoothingFactor);
    let prevLatLonEle = latLonSmoothEles[0];
    return latLonSmoothEles.map((latLonEle) => {
      const lat = latLonEle[0];
      const lon = latLonEle[1];
      const ele = latLonEle[2];
      const d = distance(lat, lon, prevLatLonEle[0], prevLatLonEle[1]);
      let angle = 0;
      if (d > 0) {
        angle = (ele - prevLatLonEle[2]) / d;
      }
      prevLatLonEle = latLonEle;
      const color = angle / 0.5 + 0.5;
      return [lat, lon, color || 0];
    });
  }

  showColorizedEleTrackOnMap = (colorizeTrackBy) => {
    let colorLineData;
    let palette;
    if (colorizeTrackBy === 'elevation') {
      colorLineData = this.colorLineDataForElevation();
      palette = { 0.0: 'green', 0.5: 'yellow', 1.0: 'red' };
    } else if (colorizeTrackBy === 'steepness') {
      colorLineData = this.colorLineDataForSteepness();
      palette = { 0.0: 'green', 0.5: 'white', 1.0: 'red' };
    }
    const line = L.hotline(colorLineData, { weight: 4, palette });
    line.isColorizedElePath = true;
    line.addTo(getMapLeafletElement());
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

  pointToLayer = (geoJsonPoint, latlng) => L.marker(latlng, { icon: createMarkerIcon() })

  handlePointClick = () => {
    // just to prevent click propagation to map
  }

  render() {
    const { trackGeojson, startPoints, finishPoints, displayingElevationChart } = this.props;

    // TODO rather compute some hash or better - detect real change
    const keyToAssureProperRefresh = `OOXlDWrtVn-${(JSON.stringify(trackGeojson) + displayingElevationChart).length}`; // otherwise GeoJSON will still display the first data

    return trackGeojson && (
      <React.Fragment>
        <GeoJSON
          data={trackGeojson}
          key={keyToAssureProperRefresh}
          onEachFeature={this.handleEachFeature}
          style={{ weight: 4 }}
          pointToLayer={this.pointToLayer}
        />

        {
          startPoints.map((p, i) => (
            <RichMarker
              faIcon="play"
              key={`5rZwATEZfM-${i}`}
              faIconLeftPadding="2px"
              color="#409a40"
              interactive={false}
              position={L.latLng(p.lat, p.lon)}
              onClick={this.handlePointClick}
            >
              { p.startTime &&
                <Tooltip offset={new L.Point(9, -25)} direction="right" permanent>
                  <span>{timeFormat.format(new Date(p.startTime))}</span>
                </Tooltip> }
            </RichMarker>
          ))
        }

        {
          finishPoints.map((p, i) => (
            <RichMarker
              faIcon="stop"
              key={`GWT1OzhnV1-${i}`}
              faIconLeftPadding="2px"
              color="#d9534f"
              interactive={false}
              position={L.latLng(p.lat, p.lon)}
              onClick={this.handlePointClick}
            >
              <Tooltip offset={new L.Point(9, -25)} direction="right" permanent>
                <span>
                  {p.finishTime ? timeFormat.format(new Date(p.finishTime)) : ''}
                  {p.finishTime ? ', ' : ''}
                  {oneDecimalDigitNumberFormat.format(p.lengthInKm)} km
                </span>
              </Tooltip>
            </RichMarker>
          ))
        }

        {this.state.infoLat &&
          <RichMarker
            faIcon="info"
            faIconLeftPadding="2px"
            color="grey"
            interactive={false}
            position={L.latLng(this.state.infoLat, this.state.infoLon)}
            onClick={this.handlePointClick}
          >
            <Tooltip className="compact" offset={new L.Point(9, -25)} direction="right" permanent>
              <span>
                {oneDecimalDigitNumberFormat.format(this.state.infoDistanceKm)} km
              </span>
            </Tooltip>
          </RichMarker>
        }

        <ElevationChartActivePoint />
      </React.Fragment>
    );
  }
}

export default connect(state => ({
  trackGeojson: state.trackViewer.trackGeojson,
  startPoints: state.trackViewer.startPoints,
  finishPoints: state.trackViewer.finishPoints,
  displayingElevationChart: state.elevationChart.trackGeojson !== null,
  colorizeTrackBy: state.trackViewer.colorizeTrackBy,
  eleSmoothingFactor: state.trackViewer.eleSmoothingFactor,
}))(TrackViewerResult);
