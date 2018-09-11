import React from 'react';
import PropTypes from 'prop-types';
import * as FmPropTypes from 'fm3/propTypes';
import { connect } from 'react-redux';
import { Tooltip, Polyline } from 'react-leaflet';
import ElevationChartActivePoint from 'fm3/components/ElevationChartActivePoint';
import RichMarker from 'fm3/components/RichMarker';
import Hotline from 'fm3/components/Hotline';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import turfLineSlice from '@turf/line-slice';
import turfLength from '@turf/length';
import turfFlatten from '@turf/flatten';
import 'leaflet-hotline';
import { point } from '@turf/helpers';
import { getCoords } from '@turf/invariant';

import { distance, smoothElevations } from 'fm3/geoutils';

class TrackViewerResult extends React.Component {
  static propTypes = {
    trackGeojson: PropTypes.shape({
      features: PropTypes.array,
    }),
    startPoints: PropTypes.arrayOf(FmPropTypes.startPoint.isRequired).isRequired,
    finishPoints: PropTypes.arrayOf(FmPropTypes.finishPoint.isRequired).isRequired,
    displayingElevationChart: PropTypes.bool,
    colorizeTrackBy: PropTypes.oneOf(['elevation', 'steepness']),
    eleSmoothingFactor: PropTypes.number.isRequired,
    language: PropTypes.string,
  }

  state = {
    infoLat: undefined,
    infoLon: undefined,
    infoDistanceKm: undefined,
  }

  componentDidUpdate(prevProps) {
    const { trackGeojson } = this.props;
    if (!trackGeojson) {
      return;
    }

    // TODO to logic
    if (trackGeojson && JSON.stringify(prevProps.trackGeojson) !== JSON.stringify(trackGeojson)) {
      const geojsonBounds = L.geoJson(trackGeojson).getBounds();
      if (geojsonBounds.isValid()) {
        getMapLeafletElement().fitBounds(geojsonBounds);
      }
    }
  }

  getFeatures = type => turfFlatten(this.props.trackGeojson).features.filter(f => f.geometry.type === type);

  getColorLineDataForElevation = () => this.getFeatures('LineString').map((feature) => {
    const smoothed = smoothElevations(getCoords(feature), this.props.eleSmoothingFactor);
    const eles = smoothed.map(coord => coord[2]);
    const maxEle = Math.max(...eles);
    const minEle = Math.min(...eles);
    return smoothed.map((coord) => {
      const color = (coord[2] - minEle) / (maxEle - minEle);
      return [coord[1], coord[0], color || 0];
    });
  });

  getColorLineDataForSteepness = () => this.getFeatures('LineString').map((feature) => {
    const smoothed = smoothElevations(getCoords(feature), this.props.eleSmoothingFactor);
    let prevCoord = smoothed[0];
    return smoothed.map((coord) => {
      const [lon, lat, ele] = coord;
      const d = distance(lat, lon, prevCoord[1], prevCoord[0]);
      let angle = 0;
      if (d > 0) {
        angle = (ele - prevCoord[2]) / d;
      }
      prevCoord = coord;
      const color = angle / 0.5 + 0.5;
      return [lat, lon, color || 0];
    });
  });

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

  showInfoPoint = (e, feature) => {
    const infoLat = e.latlng.lat;
    const infoLon = e.latlng.lng;
    const infoDistanceKm = this.computeInfoDistanceKm(infoLat, infoLon, feature);
    this.setState({ infoLat, infoLon, infoDistanceKm });
  }

  computeInfoDistanceKm = (infoLat, infoLon, geojsonLineString) => {
    const p1 = point(geojsonLineString.geometry.coordinates[0]);
    const p2 = point([infoLon, infoLat]);
    return turfLength(turfLineSlice(p1, p2, geojsonLineString));
  }

  handlePointClick = () => {
    // just to prevent click propagation to map
  }

  render() {
    const { trackGeojson, startPoints, finishPoints, displayingElevationChart, colorizeTrackBy, language } = this.props;

    if (!trackGeojson) {
      return null;
    }

    // TODO rather compute some hash or better - detect real change
    const keyToAssureProperRefresh = `OOXlDWrtVn-${(JSON.stringify(trackGeojson) + displayingElevationChart).length}`; // otherwise GeoJSON will still display the first data

    const xxx = this.getFeatures('LineString').map(feature => ({
      name: feature.properties.name,
      lineData: feature.geometry.coordinates.map(([lon, lat]) => [lat, lon]),
    }));

    const oneDecimalDigitNumberFormat = Intl.NumberFormat(language, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const timeFormat = new Intl.DateTimeFormat(language, { hour: 'numeric', minute: '2-digit' });

    return (
      <React.Fragment key={keyToAssureProperRefresh}>
        {
          xxx.map(({ lineData, name }, i) => (
            <Polyline
              key={`outline-${i}`}
              weight={10}
              interactive={false}
              positions={lineData}
              color="#fff"
            >
              {name && (
                <Tooltip className="compact" direction="top" permanent>
                  <span>{name}</span>
                </Tooltip>
              )}
            </Polyline>
          ))
        }
        {colorizeTrackBy && (
          (colorizeTrackBy === 'elevation' ? this.getColorLineDataForElevation() : this.getColorLineDataForSteepness()).map((positions, i) => (
            <Hotline
              key={`${colorizeTrackBy}-${i}`}
              positions={positions}
              palette={colorizeTrackBy === 'elevation' ? { 0.0: 'black', 0.5: '#838', 1.0: 'white' } : { 0.0: 'green', 0.5: 'white', 1.0: 'red' }}
              weight={6}
              outlineWidth={0}
            />
          ))
        )}
        {colorizeTrackBy === null && (
          <Polyline
            weight={6}
            interactive={false}
            positions={xxx.map(({ lineData }) => lineData)}
            color="#838"
          />
        )}
        {
          this.getFeatures('Point').map(({ geometry, properties }, i) => (
            <RichMarker
              faIcon="flag"
              key={`point-${i}`}
              interactive={false}
              position={L.latLng(geometry.coordinates[1], geometry.coordinates[0])}
              onClick={this.handlePointClick}
            >
              {properties.name && (
                <Tooltip className="compact" offset={new L.Point(10, -25)} direction="right" permanent>
                  <span>{properties.name}</span>
                </Tooltip>
              )}
            </RichMarker>
          ))
        }
        {
          startPoints.map((p, i) => (
            <RichMarker
              faIcon="play"
              key={`5rZwATEZfM-${i}`}
              color="#409a40"
              interactive={false}
              position={L.latLng(p.lat, p.lon)}
              onClick={this.handlePointClick}
            >
              {p.startTime && (
                <Tooltip className="compact" offset={new L.Point(10, -25)} direction="right" permanent>
                  <span>{timeFormat.format(new Date(p.startTime))}</span>
                </Tooltip>
              )}
            </RichMarker>
          ))
        }

        {
          finishPoints.map((p, i) => (
            <RichMarker
              faIcon="stop"
              key={`GWT1OzhnV1-${i}`}
              color="#d9534f"
              interactive={false}
              position={L.latLng(p.lat, p.lon)}
              onClick={this.handlePointClick}
            >
              <Tooltip className="compact" offset={new L.Point(10, -25)} direction="right" permanent>
                <span>
                  {p.finishTime ? timeFormat.format(new Date(p.finishTime)) : ''}
                  {p.finishTime ? ', ' : ''}
                  {oneDecimalDigitNumberFormat.format(p.lengthInKm)} km
                </span>
              </Tooltip>
            </RichMarker>
          ))
        }

        {this.state.infoLat && (
          <RichMarker
            faIcon="info"
            color="grey"
            interactive={false}
            position={L.latLng(this.state.infoLat, this.state.infoLon)}
            onClick={this.handlePointClick}
          >
            <Tooltip className="compact" offset={new L.Point(10, -25)} direction="right" permanent>
              <span>
                {oneDecimalDigitNumberFormat.format(this.state.infoDistanceKm)} km
              </span>
            </Tooltip>
          </RichMarker>
        )}

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
  eleSmoothingFactor: state.main.eleSmoothingFactor,
  language: state.l10n.language,
}))(TrackViewerResult);
