import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Polyline, Tooltip, Marker } from 'react-leaflet';

import RichMarker from 'fm3/components/RichMarker';
import ElevationChartActivePoint from 'fm3/components/ElevationChartActivePoint';
import { routePlannerSetStart, routePlannerSetFinish, routePlannerAddMidpoint, routePlannerSetMidpoint, routePlannerRemoveMidpoint, routePlannerSetActiveAlternativeIndex }
  from 'fm3/actions/routePlannerActions';
import { toastsAdd } from 'fm3/actions/toastsActions';

import * as FmPropTypes from 'fm3/propTypes';

const nf = Intl.NumberFormat('sk', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

class RoutePlannerResult extends React.Component {
  static propTypes = {
    start: FmPropTypes.point,
    finish: FmPropTypes.point,
    midpoints: FmPropTypes.points,
    alternatives: PropTypes.arrayOf(PropTypes.shape({
      duration: PropTypes.number,
      distance: PropTypes.number,
      itinerary: PropTypes.arrayOf(PropTypes.shape({
        lat: PropTypes.number.isRequired,
        lon: PropTypes.number.isRequired,
        desc: PropTypes.string.isRequired,
        km: PropTypes.number.isRequired,
        mode: PropTypes.string.isRequired,
        shapePoints: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number.isRequired).isRequired).isRequired,
      }).isRequired).isRequired,
    }).isRequired),
    onStartSet: PropTypes.func.isRequired,
    onFinishSet: PropTypes.func.isRequired,
    onMidpointSet: PropTypes.func.isRequired,
    onAddMidpoint: PropTypes.func.isRequired,
    onRemoveMidpoint: PropTypes.func.isRequired,
    activeAlternativeIndex: PropTypes.number.isRequired,
    onAlternativeChange: PropTypes.func.isRequired,
    transportType: PropTypes.string,
    timestamp: PropTypes.number,
  }

  state = {
    lat: null,
    lon: null,
  }

  componentWillUnmount() {
    if (this.t) {
      clearTimeout(this.t);
    }
  }

  bringToFront = (ele) => {
    if (ele) {
      ele.leafletElement.bringToFront();
    }
  }

  handleRouteMarkerDragEnd(movedPointType, position, event) {
    this.dragging = false;

    const { lat, lng: lon } = event.target.getLatLng();

    switch (movedPointType) {
      case 'start':
        this.props.onStartSet({ lat, lon });
        break;
      case 'finish':
        this.props.onFinishSet({ lat, lon });
        break;
      case 'midpoint':
        this.props.onMidpointSet(position, { lat, lon });
        break;
      default:
        throw new Error('unknown pointType');
    }
  }

  handleMidpointClick(position) {
    this.props.onRemoveMidpoint(position);
  }

  handleEndPointClick = () => {
    // just to prevent click propagation to map
  }

  handlePolyMouseMove = (e, segment, alt) => {
    if (this.dragging) {
      return;
    }
    if (this.t) {
      clearTimeout(this.t);
      this.t = null;
    }
    this.setState({
      lat: e.latlng.lat,
      lon: e.latlng.lng,
      segment,
      alt,
    });
  }

  handlePolyMouseOut = () => {
    if (this.dragging) {
      return;
    }
    this.resetOnTimeout();
  }

  handleFutureMouseOver = () => {
    if (this.dragging) {
      return;
    }
    if (this.t) {
      clearTimeout(this.t);
      this.t = null;
    }
  }

  handleFutureMouseOut = () => {
    if (this.dragging) {
      return;
    }
    this.resetOnTimeout();
  }

  resetOnTimeout() {
    if (this.t) {
      clearTimeout(this.t);
    }
    this.t = setTimeout(() => {
      this.setState({
        lat: null,
        lon: null,
      });
    }, 200);
  }

  handleDragStart = () => {
    if (this.t) {
      clearTimeout(this.t);
    }
    this.dragging = true;
  }

  handleFutureDragEnd = (e) => {
    this.dragging = false;
    this.setState({
      lat: null,
      lon: null,
    });

    this.props.onAddMidpoint(this.state.segment, {
      lat: e.target.getLatLng().lat,
      lon: e.target.getLatLng().lng,
    });
  }

  handleFutureClick = () => {
    this.props.onAlternativeChange(this.state.alt);
  }

  render() {
    const { start, midpoints, finish, activeAlternativeIndex, onAlternativeChange, transportType, timestamp, alternatives } = this.props;
    const Icon = L.divIcon;
    const circularIcon = new Icon({ // CircleMarker is not draggable
      iconSize: [14, 14],
      iconAnchor: [7, 7],
      html: '<div class="circular-leaflet-marker-icon"></div>',
    });

    const { distance, duration, summary0 } = alternatives.find((_, alt) => alt === activeAlternativeIndex) || {};

    return (
      <React.Fragment>
        {start &&
          <RichMarker
            faIcon="play"
            zIndexOffset={10}
            faIconLeftPadding="2px"
            color="#409a40"
            draggable
            onDragStart={this.handleDragStart}
            onDragEnd={e => this.handleRouteMarkerDragEnd('start', null, e)}
            position={L.latLng(start.lat, start.lon)}
            onClick={this.handleEndPointClick}
          />
        }
        {this.state.lat !== null && this.state.lon !== null &&
          <Marker
            draggable
            icon={circularIcon}
            onDragStart={this.handleDragStart}
            onDragEnd={this.handleFutureDragEnd}
            onMouseOver={this.handleFutureMouseOver}
            onMouseOut={this.handleFutureMouseOut}
            position={L.latLng(this.state.lat, this.state.lon)}
            onClick={this.handleFutureClick}
          />
        }
        {
          midpoints.map(({ lat, lon }, i) => (
            <RichMarker
              draggable
              onDragStart={this.handleDragStart}
              onDragEnd={e => this.handleRouteMarkerDragEnd('midpoint', i, e)}
              onClick={() => this.handleMidpointClick(i)}
              key={`c4ReUQrKT7-${i}`}
              zIndexOffset={9}
              label={i + 1}
              position={L.latLng(lat, lon)}
            />
          ))
        }
        {finish &&
          <RichMarker
            faIcon="stop"
            color="#d9534f"
            zIndexOffset={10}
            draggable
            onDragStart={this.handleDragStart}
            onDragEnd={e => this.handleRouteMarkerDragEnd('finish', null, e)}
            position={L.latLng(finish.lat, finish.lon)}
            onClick={this.handleEndPointClick}
          >
            {
              transportType === 'imhd' && summary0 ?
                <Tooltip direction="top" offset={[0, -36]} permanent>
                  <div
                    // eslint-disable-next-line
                    dangerouslySetInnerHTML={{ __html: summary0.replace(', &#9201', ',<br />&#9201') }}
                  />
                </Tooltip>
              : distance ?
                <Tooltip direction="top" offset={[0, -36]} permanent>
                  <div>
                    <div>Vzdialenosť: {nf.format(distance)} km</div>
                    <div>Čas: {Math.floor(duration / 60)} h {Math.round(duration % 60)} m</div>
                  </div>
                </Tooltip>
              : null
            }
          </RichMarker>
        }
        {
          (transportType !== 'imhd' ? alternatives : alternatives.map(addMissingSegments))
          .map((x, index) => ({ ...x, alt: index, index: index === activeAlternativeIndex ? 1000 : index }))
          .sort((a, b) => a.index - b.index).map(({ itinerary, alt }) => (
            <React.Fragment key={`alt-${timestamp}-${alt}`}>
              {
                alt === activeAlternativeIndex && transportType === 'imhd' && itinerary.map((routeSlice, i) => (
                  <Marker
                    key={`mark-${i}`}
                    icon={circularIcon}
                    position={routeSlice.shapePoints[0]}
                  >
                    <Tooltip direction="right" permanent>
                      <div>{routeSlice.desc}</div>
                    </Tooltip>
                  </Marker>
                ))
              }
              {
                itinerary.map((routeSlice, i) => (
                  <Polyline
                    key={`slice-${i}`}
                    ref={ele => this.bringToFront(ele)}
                    positions={routeSlice.shapePoints}
                    weight={10}
                    color="#fff"
                    onClick={() => onAlternativeChange(alt)}
                    onMouseMove={transportType === 'imhd' ? undefined : e => this.handlePolyMouseMove(e, routeSlice.legIndex, alt)}
                    onMouseOut={this.handlePolyMouseOut}
                  />
                ))
              }
              {
                itinerary.map((routeSlice, i) => (
                  <Polyline
                    key={`slice-${timestamp}-${alt}-${i}`}
                    ref={ele => this.bringToFront(ele)}
                    positions={routeSlice.shapePoints}
                    weight={6}
                    color={
                      alt !== activeAlternativeIndex ? '#868e96'
                        : transportType !== 'imhd' && routeSlice.legIndex % 2 ? 'hsl(211, 100%, 66%)'
                        : 'hsl(211, 100%, 50%)'
                    }
                    opacity={/* alt === activeAlternativeIndex ? 1 : 0.5 */ 1}
                    dashArray={['foot', 'pushing bike', 'ferry'].includes(routeSlice.mode) ? '0, 10' : undefined}
                    interactive={false}
                  />
                ))
              }
            </React.Fragment>
          ))
        }
        <ElevationChartActivePoint />
      </React.Fragment>
    );
  }
}

export default connect(
  state => ({
    start: state.routePlanner.start,
    finish: state.routePlanner.finish,
    midpoints: state.routePlanner.midpoints,
    alternatives: state.routePlanner.alternatives,
    activeAlternativeIndex: state.routePlanner.activeAlternativeIndex,
    transportType: state.routePlanner.effectiveTransportType,
    timestamp: state.routePlanner.timestamp,
  }),
  dispatch => ({
    onStartSet(start) {
      dispatch(routePlannerSetStart(start));
    },
    onFinishSet(finish) {
      dispatch(routePlannerSetFinish(finish));
    },
    onAddMidpoint(position, midpoint) {
      dispatch(routePlannerAddMidpoint(midpoint, position));
    },
    onMidpointSet(position, midpoint) {
      dispatch(routePlannerSetMidpoint(position, midpoint));
    },
    onRemoveMidpoint(position) {
      dispatch(toastsAdd({
        collapseKey: 'routePlanner.removeMidpoint',
        message: 'Odstrániť zastávku?',
        style: 'warning',
        actions: [
          { name: 'Áno', action: routePlannerRemoveMidpoint(position), style: 'danger' },
          { name: 'Nie' },
        ],
      }));
    },
    onAlternativeChange(index) {
      dispatch(routePlannerSetActiveAlternativeIndex(index));
    },
  }),
)(RoutePlannerResult);

// TODO do it in logic so that GPX export is the same
// adds missing foot segments (between bus-stop and footway)
function addMissingSegments(alt) {
  const routeSlices = [];
  for (let i = 0; i < alt.itinerary.length; i += 1) {
    const slice = alt.itinerary[i];
    const prevSlice = alt.itinerary[i - 1];
    const nextSlice = alt.itinerary[i + 1];

    const prevSliceLastShapePoint = prevSlice ? prevSlice.shapePoints[prevSlice.shapePoints.length - 1] : null;
    const firstShapePoint = slice.shapePoints[0];

    const lastShapePoint = slice.shapePoints[slice.shapePoints.length - 1];
    const nextSliceFirstShapePoint = nextSlice ? nextSlice.shapePoints[0] : null;

    const shapePoints = [...slice.shapePoints];

    if (slice.mode === 'foot') {
      if (prevSliceLastShapePoint
        && (Math.abs(prevSliceLastShapePoint[0] - firstShapePoint[0]) > 0.0000001 || Math.abs(prevSliceLastShapePoint[1] - firstShapePoint[1]) > 0.0000001)
      ) {
        shapePoints.unshift(prevSliceLastShapePoint);
      }

      if (nextSliceFirstShapePoint
        && (Math.abs(nextSliceFirstShapePoint[0] - lastShapePoint[0]) > 0.0000001 || Math.abs(nextSliceFirstShapePoint[1] - lastShapePoint[1]) > 0.0000001)
      ) {
        shapePoints.push(nextSliceFirstShapePoint);
      }
    }

    routeSlices.push({
      ...slice,
      shapePoints,
    });
  }

  return { ...alt, itinerary: routeSlices };
}
