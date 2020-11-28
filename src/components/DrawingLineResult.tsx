import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  ReactElement,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Marker, Tooltip, Polyline, Polygon } from 'react-leaflet';
import { LeafletEvent, DomEvent } from 'leaflet';
import {
  drawingLineAddPoint,
  drawingLineUpdatePoint,
  drawingLineRemovePoint,
  Point,
} from 'fm3/actions/drawingLineActions';
import { ElevationChartActivePoint } from 'fm3/components/ElevationChartActivePoint';
import { distance } from 'fm3/geoutils';
import { mapEventEmitter } from 'fm3/mapEventEmitter';
import { divIcon } from 'leaflet';
import { RootState } from 'fm3/storeCreator';

import { selectFeature } from 'fm3/actions/mainActions';
import { LatLon } from 'fm3/types/common';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { drawingPointMeasure } from 'fm3/actions/drawingPointActions';

const circularIcon = divIcon({
  // CircleMarker is not draggable
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  tooltipAnchor: [10, 0],
  html: '<div class="circular-leaflet-marker-icon"></div>',
});

type Props = {
  index: number;
};

export function DrawingLineResult({ index }: Props): ReactElement {
  const dispatch = useDispatch();

  const line = useSelector(
    (state: RootState) => state.drawingLines.lines[index],
  );

  const language = useSelector((state: RootState) => state.l10n.language);

  const selected = useSelector(
    (state: RootState) =>
      (state.main.selection?.type === 'draw-lines' ||
        state.main.selection?.type === 'draw-polygons') &&
      index === state.main.selection?.id,
  );

  const { points } = line;

  const [coords, setCoords] = useState<LatLon | undefined>();

  const [touching, setTouching] = useState(false);

  const removeCoords = !!coords && (!selected || touching);

  useEffect(() => {
    if (removeCoords) {
      setCoords(undefined);
    }
  }, [removeCoords]);

  const handleMouseMove = useCallback(
    (lat: number, lon: number, originalEvent) => {
      if (!touching) {
        setCoords(
          originalEvent.target.classList.contains('leaflet-container')
            ? { lat, lon }
            : undefined,
        );
      }
    },
    [touching],
  );

  const handleMouseOut = useCallback(() => {
    setCoords(undefined);
  }, []);

  const handleTouchStart = useCallback(() => {
    setTouching(true);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setTouching(false);
  }, []);

  useEffect(() => {
    if (!selected) {
      return;
    }

    mapEventEmitter.on('mouseMove', handleMouseMove);
    mapEventEmitter.on('mouseOut', handleMouseOut);

    const mapContainer = getMapLeafletElement()?.getContainer();

    if (mapContainer) {
      DomEvent.on(mapContainer, 'touchstart', handleTouchStart);
      DomEvent.on(mapContainer, 'touchend', handleTouchEnd);
    }

    return () => {
      mapEventEmitter.removeListener('mouseMove', handleMouseMove);
      mapEventEmitter.removeListener('mouseOut', handleMouseOut);

      if (mapContainer) {
        DomEvent.off(mapContainer, 'touchstart', handleTouchStart);
        DomEvent.off(mapContainer, 'touchend', handleTouchEnd);
      }
    };
  }, [
    selected,
    handleMouseMove,
    handleMouseOut,
    handleTouchStart,
    handleTouchEnd,
  ]);

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

      dispatch(
        drawingLineAddPoint({ index, point: { lat, lon, id }, position: pos }),
      );

      dispatch(drawingPointMeasure(true));
    },
    [points, dispatch, index],
  );

  const handleMeasureMarkerDrag = useCallback(
    ({ latlng: { lat, lng: lon } }, id: number) => {
      dispatch(drawingLineUpdatePoint({ index, point: { lat, lon, id } }));

      dispatch(drawingPointMeasure(true));
    },
    [dispatch, index],
  );

  const handleMarkerClick = useCallback(
    (id: number) => {
      dispatch(drawingLineRemovePoint({ index, id }));
      dispatch(drawingPointMeasure(true));
    },
    [dispatch, index],
  );

  let prev: Point | null = null;
  let dist = 0;

  const nf = useMemo(
    () =>
      Intl.NumberFormat(language, {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      }),
    [language],
  );

  const handleSelect = useCallback(() => {
    dispatch(
      selectFeature({
        type: line.type === 'polygon' ? 'draw-polygons' : 'draw-lines',
        id: index,
      }),
    );
    dispatch(drawingPointMeasure(true));
  }, [dispatch, line.type, index]);

  const ps = useMemo(() => {
    const ps: Point[] = [];

    for (let i = 0; i < points.length; i++) {
      ps.push(points[i]);

      if (i < points.length - 1 || line.type === 'polygon') {
        const p1 = points[i];
        const p2 = points[(i + 1) % points.length];
        const lat = (p1.lat + p2.lat) / 2;
        const lon = (p1.lon + p2.lon) / 2;

        ps.push({
          lat,
          lon,
          id: points.length - 1 === i ? points.length * 2 : (p1.id + p2.id) / 2,
        });
      }
    }

    return ps;
  }, [points, line.type]);

  return (
    <>
      {ps.length > 2 && line.type === 'line' && (
        <Polyline
          weight={4}
          color={selected ? '#65b2ff' : '#007bff'}
          interactive
          onclick={handleSelect}
          positions={ps
            .filter((_, i) => i % 2 === 0)
            .map(({ lat, lon }) => ({ lat, lng: lon }))}
          key={ps.map((p) => `${p.lat},${p.lon}`).join(',')}
        >
          {line.label && (
            <Tooltip className="compact" permanent>
              <span>{line.label}</span>
            </Tooltip>
          )}
        </Polyline>
      )}

      {ps.length > 1 && line.type === 'polygon' && (
        <Polygon
          weight={4}
          color={selected ? '#65b2ff' : '#007bff'}
          interactive
          onclick={handleSelect}
          positions={ps
            .filter((_, i) => i % 2 === 0)
            .map(({ lat, lon }) => ({ lat, lng: lon }))}
        >
          {line.label && ps.length > 4 && (
            <Tooltip
              className="compact"
              offset={[-4, 0]}
              direction="center"
              permanent
              interactive
              key={ps.map((p) => `${p.lat},${p.lon}`).join(',')}
            >
              <span>{line.label}</span>
            </Tooltip>
          )}
        </Polygon>
      )}

      {!!(ps.length > 0 && coords && !window.preventMapClick) && (
        <Polyline
          weight={4}
          dashArray="6,8"
          interactive={false}
          positions={[
            {
              lat: ps[ps.length - (line.type === 'polygon' ? 2 : 1)].lat,
              lng: ps[ps.length - (line.type === 'polygon' ? 2 : 1)].lon,
            },
            { lat: coords.lat, lng: coords.lon },
            ...(line.type === 'line' || ps.length < 3
              ? []
              : [{ lat: ps[0].lat, lng: ps[0].lon }]),
          ]}
        />
      )}

      {selected &&
        ps.map((p, i: number) => {
          if (i % 2 === 0) {
            if (prev) {
              dist += distance(p.lat, p.lon, prev.lat, prev.lon);
            }
            prev = p;
          }

          return i % 2 === 0 ? (
            <Marker
              key={p.id}
              draggable
              position={{ lat: p.lat, lng: p.lon }}
              // icon={defaultIcon} // NOTE changing icon doesn't work: https://github.com/Leaflet/Leaflet/issues/4484
              icon={circularIcon}
              opacity={1}
              ondrag={(e) => handleMeasureMarkerDrag(e as any, p.id)}
              onclick={() => handleMarkerClick(p.id)}
              ondragstart={handleDragStart}
              ondragend={handleDragEnd}
            >
              {line.type === 'line' && (
                <Tooltip
                  key={`${p.id}-${ps.length}`}
                  className="compact"
                  offset={[-4, 0]}
                  direction="right"
                >
                  <span>{nf.format(dist / 1000)} km</span>
                </Tooltip>
              )}
            </Marker>
          ) : (
            <Marker
              key={p.id}
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
}

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
