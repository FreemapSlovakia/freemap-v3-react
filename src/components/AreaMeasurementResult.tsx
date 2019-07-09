import React from 'react';
import { connect } from 'react-redux';
import { Marker, Popup, Polygon, Polyline } from 'react-leaflet';
import RichMarker from 'fm3/components/RichMarker';

import {
  areaMeasurementAddPoint,
  areaMeasurementUpdatePoint,
  areaMeasurementRemovePoint,
  IPoint,
} from 'fm3/actions/areaMeasurementActions';

import { area } from 'fm3/geoutils';
import mapEventEmitter from 'fm3/emitters/mapEventEmitter';
import { divIcon } from 'leaflet';
import { Dispatch } from 'redux';
import { RootAction } from 'fm3/actions';
import { RootState } from 'fm3/storeCreator';

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

class AreaMeasurementResult extends React.Component<Props, IState> {
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

  handleMouseMove = (lat: number, lon: number, originalEvent: MouseEvent) => {
    if (
      this.props.active &&
      originalEvent.target &&
      (originalEvent.target as HTMLElement).classList.contains(
        'leaflet-container',
      )
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
    const { points, language } = this.props;

    const ps: IPoint[] = [];
    for (let i = 0; i < points.length; i += 1) {
      ps.push(points[i]);
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length];
      const lat = (p1.lat + p2.lat) / 2;
      const lon = (p1.lon + p2.lon) / 2;
      ps.push({
        lat,
        lon,
        id: i + 1 === points.length ? p1.id + 1 : (p1.id + p2.id) / 2,
      });
    }
    const areaSize = points.length >= 3 ? area(points) : NaN;
    let northmostPoint = points[0];
    points.forEach(p => {
      if (northmostPoint.lat < p.lat) {
        northmostPoint = p;
      }
    });

    const nf = Intl.NumberFormat(language, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });

    return (
      <>
        {!Number.isNaN(areaSize) && (
          <RichMarker
            autoOpenPopup
            interactive={false}
            opacity={0}
            position={{ lat: northmostPoint.lat, lng: northmostPoint.lon }}
          >
            <Popup closeButton={false} autoClose={false} autoPan={false}>
              <span>
                <div>
                  {nf.format(areaSize)} m<sup>2</sup>
                </div>
                <div>{nf.format(areaSize / 100)} a</div>
                <div>{nf.format(areaSize / 10000)} ha</div>
                <div>
                  {nf.format(areaSize / 1000000)} km<sup>2</sup>
                </div>
              </span>
            </Popup>
          </RichMarker>
        )}

        {ps.map((p, i) => {
          return i % 2 ? (
            <Marker
              key={`point-${p.id}`}
              draggable
              position={{ lat: p.lat, lng: p.lon }}
              icon={circularIcon}
              opacity={0.5}
              ondragstart={e =>
                this.handlePoiAdd(
                  e.target.getLatLng().lat,
                  e.target.getLatLng().lng,
                  i,
                  p.id,
                )
              }
            />
          ) : (
            <Marker
              key={`point-${p.id}`}
              draggable
              position={{ lat: p.lat, lng: p.lon }}
              // icon={defaultIcon} // NOTE changing icon doesn't work: https://github.com/Leaflet/Leaflet/issues/4484
              icon={circularIcon}
              opacity={1}
              ondrag={e => this.handleMeasureMarkerDrag(i / 2, e as any, p.id)}
              onclick={() => this.handleMarkerClick(p.id)}
              ondragstart={handleDragStart}
              ondragend={handleDragEnd}
            >
              {/*
                <Tooltip className="compact" offset={[-4, 0]} direction="right" permanent>
                  <span>{nf.format(dist / 1000)} km</span>
                </Tooltip>
              */}
            </Marker>
          );
        })}

        {ps.length > 2 && (
          <Polygon
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
              { lat: ps[0].lat, lng: ps[0].lon },
              { lat: this.state.lat, lng: this.state.lon },
              ...(ps.length < 3
                ? []
                : [{ lat: ps[ps.length - 2].lat, lng: ps[ps.length - 2].lon }]),
            ]}
          />
        )}
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
  window.setTimeout(() => {
    window['preventMapClick'] = false;
  });
}

const mapStateToProps = (state: RootState) => ({
  points: state.areaMeasurement.points,
  active: state.main.tool === 'measure-area',
  language: state.l10n.language,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onPointAdd(point: IPoint, position: number) {
    dispatch(areaMeasurementAddPoint({ point, position }));
  },
  onPointUpdate(index: number, point: IPoint) {
    dispatch(areaMeasurementUpdatePoint({ index, point }));
  },
  onPointRemove(i: number) {
    dispatch(areaMeasurementRemovePoint(i));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AreaMeasurementResult);
