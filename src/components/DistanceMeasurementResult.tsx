import React from 'react';
import { connect } from 'react-redux';
import { Marker, Tooltip, Polyline } from 'react-leaflet';

import {
  distanceMeasurementAddPoint,
  distanceMeasurementUpdatePoint,
  distanceMeasurementRemovePoint,
  IPoint,
} from 'fm3/actions/distanceMeasurementActions';

import ElevationChartActivePoint from 'fm3/components/ElevationChartActivePoint';

import { distance } from 'fm3/geoutils';
import mapEventEmitter from 'fm3/emitters/mapEventEmitter';
import { divIcon } from 'leaflet';
import { RootState } from 'fm3/storeCreator';
import { Dispatch } from 'redux';
import { RootAction } from 'fm3/actions';

// const defaultIcon = new L.Icon.Default();

const circularIcon = divIcon({
  // CircleMarker is not draggable
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  tooltipAnchor: [10, 0],
  html: '<div class="circular-leaflet-marker-icon"></div>',
});

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

interface IState {
  lat?: number;
  lon?: number;
}

class DistanceMeasurementResult extends React.Component<Props, IState> {
  state: IState = {};

  componentDidMount() {
    mapEventEmitter.on('mouseMove', this.handleMouseMove);
    mapEventEmitter.on('mouseOut', this.handleMouseOut);
  }

  componentWillUnmount() {
    mapEventEmitter.removeListener('mouseMove', this.handleMouseMove);
    mapEventEmitter.removeListener('mouseOut', this.handleMouseOut);
  }

  handlePoiAdd = (lat: number, lon: number, position: number, id0: number) => {
    handleDragStart();
    const { points } = this.props;
    const pos = position ? Math.ceil(position / 2) : points.length;
    let id;
    if (id0) {
      id = id0;
    } else if (pos === 0) {
      id = points.length ? points[pos].id - 1 : 0;
    } else if (pos === points.length) {
      id = points[pos - 1].id + 1;
    } else {
      id = (points[pos - 1].id + points[pos].id) / 2;
    }
    this.props.onPointAdd({ lat, lon, id }, pos);
  };

  handleMouseMove = (lat: number, lon: number, originalEvent) => {
    if (
      this.props.active &&
      originalEvent.target.classList.contains('leaflet-container')
    ) {
      this.setState({ lat, lon });
    } else {
      this.setState({ lat: undefined, lon: undefined });
    }
  };

  handleMouseOut = () => {
    this.setState({ lat: undefined, lon: undefined });
  };

  handleMeasureMarkerDrag(
    i: number,
    { latlng: { lat, lng: lon } },
    id: number,
  ) {
    this.props.onPointUpdate(i, { lat, lon, id });
  }

  handleMarkerClick(id: number) {
    this.props.onPointRemove(id);
  }

  render() {
    let prev: IPoint | null = null;
    let dist = 0;

    const { points, language } = this.props;

    const ps: IPoint[] = [];
    for (let i = 0; i < points.length; i += 1) {
      ps.push(points[i]);
      if (i < points.length - 1) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const lat = (p1.lat + p2.lat) / 2;
        const lon = (p1.lon + p2.lon) / 2;
        ps.push({ lat, lon, id: (p1.id + p2.id) / 2 });
      }
    }

    const nf = Intl.NumberFormat(language, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });

    return (
      <>
        {ps.length > 2 && (
          <Polyline
            weight={4}
            interactive={false}
            positions={ps
              .filter((_, i) => i % 2 === 0)
              .map(({ lat, lon }) => ({ lat, lng: lon }))}
          />
        )}
        {!!(ps.length && this.state.lat && this.state.lon) && (
          <Polyline
            weight={4}
            interactive={false}
            dashArray="6,8"
            positions={[
              { lat: ps[ps.length - 1].lat, lng: ps[ps.length - 1].lon },
              { lat: this.state.lat, lng: this.state.lon },
            ]}
          />
        )}
        {ps.map((p, i: number) => {
          if (i % 2 === 0) {
            if (prev) {
              dist += distance(p.lat, p.lon, prev.lat, prev.lon);
            }
            prev = p;
          }

          return i % 2 === 0 ? (
            <Marker
              key={`95Lp1ukO7F-${p.id}`}
              draggable
              position={{ lat: p.lat, lng: p.lon }}
              // icon={defaultIcon} // NOTE changing icon doesn't work: https://github.com/Leaflet/Leaflet/issues/4484
              icon={circularIcon}
              opacity={1}
              onDrag={e => this.handleMeasureMarkerDrag(i / 2, e, p.id)}
              onClick={() => this.handleMarkerClick(p.id)}
              onDragstart={handleDragStart}
              onDragend={handleDragEnd}
            >
              <Tooltip
                key={`${p.id}-${ps.length}`}
                className="compact"
                offset={[-4, 0]}
                direction="right"
                permanent={i === ps.length - 1}
              >
                <span>{nf.format(dist / 1000)} km</span>
              </Tooltip>
            </Marker>
          ) : (
            <Marker
              key={`95Lp1ukO7F-${p.id}`}
              draggable
              position={{ lat: p.lat, lng: p.lon }}
              icon={circularIcon}
              opacity={0.5}
              onDragstart={e =>
                this.handlePoiAdd(
                  e.target.getLatLng().lat,
                  e.target.getLatLng().lng,
                  i,
                  p.id,
                )
              }
            />
          );
        })}

        <ElevationChartActivePoint />
      </>
    );
  }
}

// see https://github.com/FreemapSlovakia/freemap-v3-react/issues/168
function handleDragStart() {
  window['preventMapClick'] = true;
}

// see https://github.com/FreemapSlovakia/freemap-v3-react/issues/168
function handleDragEnd() {
  setTimeout(() => {
    window['preventMapClick'] = false;
  });
}

const mapStateToProps = (state: RootState) => ({
  points: state.distanceMeasurement.points,
  active: state.main.tool === 'measure-dist',
  language: state.l10n.language,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onPointAdd(point: IPoint, position: number) {
    dispatch(distanceMeasurementAddPoint({ point, position }));
  },
  onPointUpdate(index: number, point: IPoint) {
    dispatch(distanceMeasurementUpdatePoint({ index, point }));
  },
  onPointRemove(id: number) {
    dispatch(distanceMeasurementRemovePoint(id));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DistanceMeasurementResult);
