import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Polyline, Tooltip, Marker } from 'react-leaflet';

import RichMarker from 'fm3/components/RichMarker';
import ElevationChartActivePoint from 'fm3/components/ElevationChartActivePoint';
import { routePlannerSetStart, routePlannerSetFinish, routePlannerAddMidpoint, routePlannerSetMidpoint, routePlannerRemoveMidpoint, routePlannerSetActiveAlternativeIndex }
  from 'fm3/actions/routePlannerActions';
import injectL10n from 'fm3/l10nInjector';

import * as FmPropTypes from 'fm3/propTypes';

class RoutePlannerResult extends React.Component {
  static propTypes = {
    start: FmPropTypes.point,
    finish: FmPropTypes.point,
    midpoints: FmPropTypes.points,
    activeAlternativeIndex: PropTypes.number.isRequired,
    alternatives: PropTypes.arrayOf(FmPropTypes.routeAlternative).isRequired,
    onStartSet: PropTypes.func.isRequired,
    onFinishSet: PropTypes.func.isRequired,
    onMidpointSet: PropTypes.func.isRequired,
    onAddMidpoint: PropTypes.func.isRequired,
    onRemoveMidpoint: PropTypes.func.isRequired,
    onAlternativeChange: PropTypes.func.isRequired,
    transportType: PropTypes.string,
    timestamp: PropTypes.number,
    t: PropTypes.func.isRequired,
    language: PropTypes.string,
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
    if (!this.dragging) {
      this.resetOnTimeout();
    }
  }

  handleFutureMouseOver = () => {
    if (!this.dragging && this.t) {
      clearTimeout(this.t);
      this.t = null;
    }
  }

  handleFutureMouseOut = () => {
    if (!this.dragging) {
      this.resetOnTimeout();
    }
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

  maneuverToText = (name, { type, modifier }, extra) => {
    const p = 'routePlanner.maneuver';
    const { t, transportType } = this.props;
    return transportType === 'imhd' ? imhdStep(t, this.props.language, extra)
      : transportType === 'bikesharing' ? bikesharingStep(t, extra)
        : t(`routePlanner.maneuverWith${name ? '' : 'out'}Name`, {
          type: t(`${p}.types.${type}`, {}, type),
          modifier: modifier ? ` ${t(`${p}.modifiers.${modifier}`, {}, modifier)}` : '',
          name,
        });
  }

  render() {
    const { start, midpoints, finish, activeAlternativeIndex, onAlternativeChange,
      transportType, timestamp, alternatives, t, language } = this.props;

    const special = isSpecial(transportType);

    const Icon = L.divIcon;
    const circularIcon = new Icon({ // CircleMarker is not draggable
      iconSize: [14, 14],
      iconAnchor: [7, 7],
      html: '<div class="circular-leaflet-marker-icon"></div>',
    });

    const { distance, duration, extra } = alternatives.find((_, alt) => alt === activeAlternativeIndex) || {};

    const nf = Intl.NumberFormat(language, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

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
              key={`midpoint-${i}`}
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
              isSpecial(transportType) && extra && extra.numbers ?
                <Tooltip direction="top" offset={[0, -36]} permanent>
                  <div>
                    {imhdSummary(t, language, extra)}
                  </div>
                </Tooltip>
              : distance ?
                <Tooltip direction="top" offset={[0, -36]} permanent>
                  <div>
                    <div>{t('routePlanner.distance', { value: nf.format(distance) })}</div>
                    <div>{t('routePlanner.duration', { h: Math.floor(duration / 60), m: Math.round(duration % 60) })}</div>
                  </div>
                </Tooltip>
              : null
            }
          </RichMarker>
        }
        {
          (!special ? alternatives : alternatives.map(addMissingSegments))
          .map((x, index) => ({ ...x, alt: index, index: index === activeAlternativeIndex ? -1000 : index }))
          .sort((a, b) => b.index - a.index).map(({ itinerary, alt }) => (
            <React.Fragment key={`alt-${timestamp}-${alt}`}>
              {
                alt === activeAlternativeIndex && special && itinerary.map(({ shapePoints, name, maneuver, extra: extra1 }, i) => (
                  <Marker
                    key={i}
                    icon={circularIcon}
                    position={shapePoints[0]}
                  >
                    <Tooltip direction="right" permanent>
                      <div>
                        {this.maneuverToText(name, maneuver, extra1)}
                      </div>
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
                    bubblingMouseEvents={false}
                    onClick={() => onAlternativeChange(alt)}
                    onMouseMove={special ? undefined : e => this.handlePolyMouseMove(e, routeSlice.legIndex, alt)}
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
                        : !special && routeSlice.legIndex % 2 ? 'hsl(211, 100%, 66%)'
                        : 'hsl(211, 100%, 50%)'
                    }
                    opacity={/* alt === activeAlternativeIndex ? 1 : 0.5 */ 1}
                    dashArray={['foot', 'pushing bike', 'ferry'].includes(routeSlice.mode) ? '0, 10' : undefined}
                    interactive={false}
                    bubblingMouseEvents={false}
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

export default compose(
  injectL10n(),
  connect(
    state => ({
      start: state.routePlanner.start,
      finish: state.routePlanner.finish,
      midpoints: state.routePlanner.midpoints,
      alternatives: state.routePlanner.alternatives,
      activeAlternativeIndex: state.routePlanner.activeAlternativeIndex,
      transportType: state.routePlanner.effectiveTransportType,
      timestamp: state.routePlanner.timestamp,
      language: state.l10n.language,
    }),
    dispatch => ({
      onStartSet(start) {
        dispatch(routePlannerSetStart(start, true));
      },
      onFinishSet(finish) {
        dispatch(routePlannerSetFinish(finish, true));
      },
      onAddMidpoint(position, midpoint) {
        dispatch(routePlannerAddMidpoint(midpoint, position));
      },
      onMidpointSet(position, midpoint) {
        dispatch(routePlannerSetMidpoint(position, midpoint));
      },
      onRemoveMidpoint(position) {
        dispatch(routePlannerRemoveMidpoint(position));
      },
      onAlternativeChange(index) {
        dispatch(routePlannerSetActiveAlternativeIndex(index));
      },
    }),
  ),
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

function imhdSummary(t, language, extra) {
  const dateFormat = new Intl.DateTimeFormat(language, {
    hour: '2-digit', minute: '2-digit',
  });

  const { duration: { foot, bus, home, wait }, price, arrival, numbers } = extra;

  return t('routePlanner.imhd.total.full', {
    total: Math.round((foot + bus + home + wait) / 60),
    foot: Math.round(foot / 60),
    bus: Math.round(bus / 60),
    home: Math.round(home / 60),
    walk: Math.round(foot / 60),
    wait: Math.round(wait / 60),
    price: Intl.NumberFormat(language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price),
    arrival: dateFormat.format(arrival * 1000),
    numbers,
  });
}

function imhdStep(t, language, { type, destination, departure, duration, number }) {
  const dateFormat = new Intl.DateTimeFormat(language, {
    hour: '2-digit', minute: '2-digit',
  });

  return t(`routePlanner.imhd.step.${type === 'foot' ? 'foot' : 'bus'}`, {
    type: t(`routePlanner.imhd.type.${type}`),
    destination,
    departure: dateFormat.format(departure * 1000),
    duration: Math.round(duration / 60),
    number,
  });
}

function bikesharingStep(t, { type, destination, duration }) {
  return t(`routePlanner.bikesharing.step.${type}`, {
    destination,
    duration: Math.round(duration / 60),
  });
}

function isSpecial(transportType) {
  return ['imhd', 'bikesharing'].includes(transportType);
}
