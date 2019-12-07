import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { connect } from 'react-redux';
import { Marker, Tooltip, Polyline } from 'react-leaflet';
import { LeafletEvent } from 'leaflet';

import {
  distanceMeasurementAddPoint,
  distanceMeasurementUpdatePoint,
  distanceMeasurementRemovePoint,
  Point,
} from 'fm3/actions/distanceMeasurementActions';

import { ElevationChartActivePoint } from 'fm3/components/ElevationChartActivePoint';

import { distance } from 'fm3/geoutils';
import { mapEventEmitter } from 'fm3/mapEventEmitter';
import { divIcon } from 'leaflet';
import { RootState } from 'fm3/storeCreator';
import { Dispatch } from 'redux';
import { RootAction } from 'fm3/actions';
import { selectFeature } from 'fm3/actions/mainActions';
import { LatLon } from 'fm3/types/common';

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

const DistanceMeasurementResultInt: React.FC<Props> = ({
  points,
  onPointAdd,
  onPointUpdate,
  onPointRemove,
  active,
  onSelect,
  language,
  selected,
}) => {
  const handleMouseMove = useCallback(
    (lat: number, lon: number, originalEvent) => {
      setCoords(
        active && originalEvent.target.classList.contains('leaflet-container')
          ? { lat, lon }
          : undefined,
      );
    },
    [active],
  );

  const handleMouseOut = useCallback(() => {
    setCoords(undefined);
  }, []);

  useEffect(() => {
    mapEventEmitter.on('mouseMove', handleMouseMove);
    mapEventEmitter.on('mouseOut', handleMouseOut);

    return () => {
      mapEventEmitter.removeListener('mouseMove', handleMouseMove);
      mapEventEmitter.removeListener('mouseOut', handleMouseOut);
    };
  }, [handleMouseMove, handleMouseOut]);

  const [coords, setCoords] = useState<LatLon | undefined>();

  const handlePoiAdd = useCallback(
    (lat: number, lon: number, position: number, id0: number) => {
      handleDragStart();
      const pos = position ? Math.ceil(position / 2) : points.length;

      let id: number | undefined;

      if (id0) {
        id = id0;
      } else if (pos === 0) {
        id = points.length ? points[pos].id - 1 : 0;
      } else if (pos === points.length) {
        id = points[pos - 1].id + 1;
      } else {
        id = (points[pos - 1].id + points[pos].id) / 2;
      }

      onPointAdd({ lat, lon, id }, pos);
    },
    [points, onPointAdd],
  );

  const handleMeasureMarkerDrag = useCallback(
    (i: number, { latlng: { lat, lng: lon } }, id: number) => {
      onPointUpdate(i, { lat, lon, id });
    },
    [onPointUpdate],
  );

  const handleMarkerClick = useCallback(
    (id: number) => {
      onPointRemove(id);
    },
    [onPointRemove],
  );

  let prev: Point | null = null;
  let dist = 0;

  const ps: Point[] = [];

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

  const nf = useMemo(
    () =>
      Intl.NumberFormat(language, {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      }),
    [language],
  );

  return (
    <>
      {ps.length > 2 && (
        <Polyline
          weight={4}
          interactive
          onclick={onSelect}
          color={selected ? '#65b2ff' : 'blue'}
          positions={ps
            .filter((_, i) => i % 2 === 0)
            .map(({ lat, lon }) => ({ lat, lng: lon }))}
        />
      )}
      {!!(ps.length && coords) && (
        <Polyline
          weight={4}
          interactive={false}
          dashArray="6,8"
          positions={[
            { lat: ps[ps.length - 1].lat, lng: ps[ps.length - 1].lon },
            { lat: coords.lat, lng: coords.lon },
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
            onDrag={e => handleMeasureMarkerDrag(i / 2, e as any, p.id)}
            onClick={() => handleMarkerClick(p.id)}
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
            onDragstart={(e: LeafletEvent) =>
              handlePoiAdd(
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
};

// see https://github.com/FreemapSlovakia/freemap-v3-react/issues/168
function handleDragStart() {
  window.preventMapClick = true;
}

// see https://github.com/FreemapSlovakia/freemap-v3-react/issues/168
function handleDragEnd() {
  window.setTimeout(() => {
    window.preventMapClick = false;
  });
}

const mapStateToProps = (state: RootState) => ({
  points: state.distanceMeasurement.points,
  active: state.main.tool === 'measure-dist',
  language: state.l10n.language,
  selected: state.main.selection?.type === 'measure-dist',
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onPointAdd(point: Point, position: number) {
    dispatch(distanceMeasurementAddPoint({ point, position }));
  },
  onPointUpdate(index: number, point: Point) {
    dispatch(distanceMeasurementUpdatePoint({ index, point }));
  },
  onPointRemove(id: number) {
    dispatch(distanceMeasurementRemovePoint(id));
  },
  onSelect() {
    dispatch(selectFeature({ type: 'measure-dist' }));
  },
});

export const DistanceMeasurementResult = connect(
  mapStateToProps,
  mapDispatchToProps,
)(DistanceMeasurementResultInt);
