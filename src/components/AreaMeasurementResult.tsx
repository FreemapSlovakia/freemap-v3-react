import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import { Marker, Polygon, Polyline, Tooltip } from 'react-leaflet';

import {
  areaMeasurementAddPoint,
  areaMeasurementUpdatePoint,
  areaMeasurementRemovePoint,
  Point,
} from 'fm3/actions/areaMeasurementActions';

import { area } from 'fm3/geoutils';
import { mapEventEmitter } from 'fm3/mapEventEmitter';
import { divIcon } from 'leaflet';
import { Dispatch } from 'redux';
import { RootAction } from 'fm3/actions';
import { RootState } from 'fm3/storeCreator';
import { LatLon } from 'fm3/types/common';
import { selectFeature } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { withTranslator, Translator } from 'fm3/l10nInjector';

const circularIcon = divIcon({
  // CircleMarker is not draggable
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  tooltipAnchor: [10, 0],
  html: '<div class="circular-leaflet-marker-icon"></div>',
});

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

const AreaMeasurementResultInt: React.FC<Props> = ({
  points,
  onPointAdd,
  onPointUpdate,
  onPointRemove,
  active,
  onSelect,
  selected,
  onValueShow,
  t,
}) => {
  const [latLon, setLatLon] = useState<LatLon | undefined>(undefined);

  const handleMouseMove = useCallback(
    (lat: number, lon: number, originalEvent: MouseEvent) => {
      setLatLon(
        active &&
          originalEvent.target &&
          (originalEvent.target as HTMLElement).classList.contains(
            'leaflet-container',
          )
          ? { lat, lon }
          : undefined,
      );
    },
    [active],
  );

  const handleMouseOut = useCallback(() => {
    setLatLon(undefined);
  }, []);

  useEffect(() => {
    mapEventEmitter.on('mouseMove', handleMouseMove);
    mapEventEmitter.on('mouseOut', handleMouseOut);
    () => {
      mapEventEmitter.removeListener('mouseMove', handleMouseMove);
      mapEventEmitter.removeListener('mouseOut', handleMouseOut);
    };
  }, [handleMouseMove, handleMouseOut]);

  const handlePoiAdd = useCallback(
    (lat: number, lon: number, position: number, id0: number) => {
      handleDragStart();
      const pos: number = position ? Math.ceil(position / 2) : points.length;

      let id: number;

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
    [onPointAdd, points],
  );

  const handleMeasureMarkerDrag = useCallback(
    (
      i: number,
      { latlng: { lat, lng: lon } }: { latlng: { lat: number; lng: number } },
      id: number,
    ) => {
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

  const { areaSize, ps } = useMemo(() => {
    const ps: Point[] = [];

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

    return { areaSize: points.length >= 3 ? area(points) : NaN, ps };
  }, [points]);

  const handleTooltipClick = useCallback(() => {
    onValueShow(areaSize);
  }, [onValueShow, areaSize]);

  return (
    <>
      {ps.map((p, i) => {
        return i % 2 ? (
          <Marker
            key={`point-${p.id}`}
            draggable
            position={{ lat: p.lat, lng: p.lon }}
            icon={circularIcon}
            opacity={0.5}
            ondragstart={e =>
              handlePoiAdd(
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
            ondrag={e => handleMeasureMarkerDrag(i / 2, e as any, p.id)}
            onclick={() => handleMarkerClick(p.id)}
            ondragstart={handleDragStart}
            ondragend={handleDragEnd}
          />
        );
      })}

      {ps.length > 2 && (
        <Polygon
          weight={4}
          interactive
          onclick={onSelect}
          color={selected ? '#65b2ff' : 'blue'}
          positions={ps
            .filter((_, i) => i % 2 === 0)
            .map(({ lat, lon }) => ({ lat, lng: lon }))}
        >
          <Tooltip
            className="compact"
            offset={[-4, 0]}
            direction="center"
            permanent
            interactive
            key={ps.map(p => `${p.lat},${p.lon}`).join(',')}
          >
            <div onClick={handleTooltipClick}>
              {t('measurement.areaInfo', { areaSize })}
            </div>
          </Tooltip>
        </Polygon>
      )}

      {!!(ps.length && latLon) && (
        <Polyline
          weight={4}
          interactive={false}
          dashArray="6,8"
          positions={[
            { lat: ps[0].lat, lng: ps[0].lon },
            { lat: latLon.lat, lng: latLon.lon },
            ...(ps.length < 3
              ? []
              : [{ lat: ps[ps.length - 2].lat, lng: ps[ps.length - 2].lon }]),
          ]}
        />
      )}
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
  points: state.areaMeasurement.points,
  active: state.main.tool === 'measure-area',
  selected: state.main.selection?.type === 'measure-area',
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onPointAdd(point: Point, position: number) {
    dispatch(areaMeasurementAddPoint({ point, position }));
  },
  onPointUpdate(index: number, point: Point) {
    dispatch(areaMeasurementUpdatePoint({ index, point }));
  },
  onPointRemove(i: number) {
    dispatch(areaMeasurementRemovePoint(i));
  },
  onSelect() {
    dispatch(selectFeature({ type: 'measure-area' }));
  },
  onValueShow(areaSize: number) {
    dispatch(
      toastsAdd({
        messageKey: 'measurement.areaInfo',
        messageParams: { areaSize },
      }),
    );
  },
});

export const AreaMeasurementResult = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(AreaMeasurementResultInt));
