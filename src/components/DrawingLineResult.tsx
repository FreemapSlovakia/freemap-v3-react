import { bearing } from '@turf/bearing';
import { distance } from '@turf/distance';
import { bearingToAzimuth } from '@turf/helpers';
import Color from 'color';
import {
  Direction,
  divIcon,
  DomEvent,
  LeafletMouseEvent,
  PointExpression,
} from 'leaflet';
import {
  Fragment,
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Marker,
  Polygon,
  Polyline,
  Tooltip,
  useMap,
  useMapEvent,
} from 'react-leaflet';
import { useDispatch } from 'react-redux';
import {
  drawingLineAddPoint,
  drawingLineJoinFinish,
  drawingLineUpdatePoint,
  Point,
} from '../actions/drawingLineActions.js';
import { drawingMeasure } from '../actions/drawingPointActions.js';
import { selectFeature } from '../actions/mainActions.js';
import { ElevationChartActivePoint } from '../components/ElevationChartActivePoint.js';
import { colors } from '../constants.js';
import { formatDistance } from '../distanceFormatter.js';
import { useAppSelector } from '../hooks/reduxSelectHook.js';
import { useNumberFormat } from '../hooks/useNumberFormat.js';
import { isEventOnMap } from '../mapUtils.js';
import {
  drawingLinePolys,
  selectingModeSelector,
} from '../selectors/mainSelectors.js';
import { LatLon } from '../types/common.js';

const circularIcon = divIcon({
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  tooltipAnchor: [10, 0],
  html: `<div class="circular-leaflet-marker-icon" style="background-color: var(--color-normal, ${colors.normal})"></div>`,
});

const selectedCircularIcon = divIcon({
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  tooltipAnchor: [10, 0],
  html: `<div class="circular-leaflet-marker-icon" style="background-color: var(--color-selected, ${colors.selected})"></div>`,
});

type Props = {
  lineIndex: number;
};

export function DrawingLineResult({ lineIndex }: Props): ReactElement {
  const dispatch = useDispatch();

  const drawing = useAppSelector(drawingLinePolys);

  const line = useAppSelector((state) => state.drawingLines.lines[lineIndex]);

  const selected = useAppSelector(
    (state) =>
      state.main.selection?.type === 'draw-line-poly' &&
      lineIndex === state.main.selection.id,
  );

  const selectedPointId = useAppSelector((state) =>
    state.main.selection?.type === 'line-point' &&
    lineIndex === state.main.selection.lineIndex
      ? state.main.selection.pointId
      : undefined,
  );

  const color = line.color || colors.normal;

  const width = line.width || 4;

  const joinWith = useAppSelector((state) => state.drawingLines.joinWith);

  const interactive = useAppSelector(selectingModeSelector);

  const interactiveLine = interactive && joinWith === undefined;

  const { points } = line;

  const [coords, setCoords] = useState<LatLon | undefined>();

  const [touching, setTouching] = useState(false);

  const removeCoords = !!coords && ((!selected && !joinWith) || touching);

  useEffect(() => {
    if (removeCoords) {
      setCoords(undefined);
    }
  }, [removeCoords]);

  const map = useMap();

  useMapEvent('mousemove', ({ latlng, originalEvent }: LeafletMouseEvent) => {
    if (!touching && (selected || joinWith?.lineIndex === lineIndex)) {
      setCoords(
        joinWith || isEventOnMap(originalEvent)
          ? { lat: latlng.lat, lon: latlng.lng }
          : undefined,
      );
    }
  });

  useMapEvent('mouseout', () => {
    if (selected) {
      setCoords(undefined);
    }
  });

  useEffect(() => {
    const mapContainer = selected && map.getContainer();

    if (mapContainer) {
      const handleTouchStart = () => {
        setTouching(true);
      };

      const handleTouchEnd = () => {
        setTouching(false);
      };

      DomEvent.on(mapContainer, 'touchstart', handleTouchStart);

      DomEvent.on(mapContainer, 'touchend', handleTouchEnd);

      return () => {
        DomEvent.off(mapContainer, 'touchstart', handleTouchStart);

        DomEvent.off(mapContainer, 'touchend', handleTouchEnd);
      };
    }
  }, [map, selected]);

  function addPoint(lat: number, lon: number, position: number, id0: number) {
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
      drawingLineAddPoint({
        lineIndex,
        point: { lat, lon, id },
        position: pos,
        indexOfLineToSelect: lineIndex,
      }),
    );

    dispatch(drawingMeasure({}));
  }

  let prev: Point | null = null;

  let sumDist = 0;

  const azimuthNumberFormat = useNumberFormat({
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  function handleSelect() {
    dispatch(
      selectFeature({
        type: 'draw-line-poly',
        id: lineIndex,
      }),
    );

    dispatch(drawingMeasure({}));
  }

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

  let x;

  const futureLinePositions =
    (drawing || joinWith) &&
    ps.length > 0 &&
    coords !== undefined &&
    !window.preventMapClick
      ? [
          joinWith?.lineIndex === lineIndex
            ? ((x = points.find((pt) => pt.id === joinWith.pointId)),
              {
                lat: x?.lat ?? -1,
                lng: x?.lon ?? -1,
              })
            : {
                lat: ps[ps.length - (line.type === 'polygon' ? 2 : 1)].lat,
                lng: ps[ps.length - (line.type === 'polygon' ? 2 : 1)].lon,
              },
          { lat: coords.lat, lng: coords.lon },
          ...(line.type === 'line' || ps.length < 3
            ? []
            : [{ lat: ps[0].lat, lng: ps[0].lon }]),
        ]
      : undefined;

  let measurementText: ReactNode = null;

  let measurementTooltipDirection: Direction = 'auto';

  let measurementTooltipPosition: PointExpression = [0, 0];

  const language = useAppSelector((state) => state.l10n.language);

  if (line.type === 'line' && futureLinePositions?.length === 2) {
    const a = [futureLinePositions[0].lng, futureLinePositions[0].lat];

    const b = [futureLinePositions[1].lng, futureLinePositions[1].lat];

    const azimuth = bearingToAzimuth(bearing(a, b));

    measurementTooltipDirection =
      azimuth < 70
        ? 'left'
        : azimuth < 90
          ? 'bottom'
          : azimuth < 125
            ? 'top'
            : azimuth < 170
              ? 'left'
              : azimuth < 240
                ? 'right'
                : azimuth < 270
                  ? 'top'
                  : azimuth < 290
                    ? 'bottom'
                    : 'right';

    const dist = distance(a, b, { units: 'meters' });

    type PtDist = [number, Point];

    const rev = [...points].reverse();

    const [sumDist] = rev.reduce(
      ([dist, prevPoint], nextPoint) =>
        [
          dist +
            distance(
              [prevPoint.lon, prevPoint.lat],
              [nextPoint.lon, nextPoint.lat],
              { units: 'meters' },
            ),
          nextPoint,
        ] satisfies PtDist,
      [
        0,
        {
          id: 0,
          lat: futureLinePositions[1].lat,
          lon: futureLinePositions[1].lng,
        },
      ] satisfies PtDist,
    );

    measurementText =
      dist > 0 ? (
        <span>
          {points.length > 1 ? (
            <>
              ∑ {formatDistance(sumDist, language)}
              <br />
            </>
          ) : null}
          ↔ {formatDistance(dist, language)}
          <br />∡ {azimuthNumberFormat.format(azimuth)}°
        </span>
      ) : null;

    measurementTooltipPosition = [(a[1] + b[1]) / 2, (a[0] + b[0]) / 2];
  }

  return (
    <Fragment key={[line.type, line.width, lineIndex].join(',')}>
      {ps.length > 2 && line.type === 'line' && (
        <Fragment key={ps.map((p) => `${p.lat},${p.lon}`).join(',')}>
          <Polyline
            key={`line-${interactiveLine ? 'a' : 'b'}`}
            weight={width + 8}
            opacity={0}
            interactive={interactiveLine}
            bubblingMouseEvents={false}
            eventHandlers={{
              click: handleSelect,
            }}
            positions={ps
              .filter((_, i) => i % 2 === 0)
              .map(({ lat, lon }) => ({ lat, lng: lon }))}
          />

          <Polyline
            weight={width}
            pathOptions={{
              color: selected ? Color(color).lighten(0.75).hex() : color,
            }}
            interactive={false}
            positions={ps
              .filter((_, i) => i % 2 === 0)
              .map(({ lat, lon }) => ({ lat, lng: lon }))}
          >
            {line.label && (
              <Tooltip className="compact" permanent>
                <span>{line.label}</span>
              </Tooltip>
            )}
          </Polyline>
        </Fragment>
      )}

      {ps.length > 1 && line.type === 'polygon' && (
        <Polygon
          key={`polygon-${interactiveLine ? 'a' : 'b'}`}
          weight={width}
          pathOptions={{
            color: selected ? Color(color).lighten(0.75).hex() : color,
          }}
          interactive={interactiveLine}
          bubblingMouseEvents={false}
          eventHandlers={{
            click: handleSelect,
          }}
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
            >
              <span>{line.label}</span>
            </Tooltip>
          )}
        </Polygon>
      )}

      {futureLinePositions && (
        <Polyline
          color={Color(color).lighten(0.75).hex()}
          weight={width}
          dashArray="6,8"
          interactive={false}
          positions={futureLinePositions}
        >
          {measurementText && (
            <Tooltip
              key={measurementTooltipDirection}
              permanent
              className="compact"
              direction={measurementTooltipDirection}
              position={measurementTooltipPosition}
            >
              {measurementText}
            </Tooltip>
          )}
        </Polyline>
      )}

      {(selected || selectedPointId !== undefined || joinWith !== undefined) &&
        ps.map((p, i) => {
          let dist = 0;

          if (prev && i % 2 === 0) {
            dist = distance([p.lon, p.lat], [prev.lon, prev.lat], {
              units: 'meters',
            });

            sumDist += dist;
          }

          if (
            joinWith !== undefined &&
            (line.type !== 'line' ||
              (i !== 0 && i !== ps.length - 1) ||
              joinWith.lineIndex === lineIndex)
          ) {
            return null;
          }

          const marker =
            i % 2 === 0 ? (
              <Marker
                key={p.id}
                draggable
                position={{ lat: p.lat, lng: p.lon }}
                // icon={defaultIcon} // NOTE changing icon doesn't work: https://github.com/Leaflet/Leaflet/issues/4484
                icon={
                  selectedPointId === p.id ? selectedCircularIcon : circularIcon
                }
                opacity={1}
                eventHandlers={{
                  drag(e) {
                    const coord = e.target.getLatLng();

                    dispatch(
                      drawingLineUpdatePoint({
                        index: lineIndex,
                        point: { lat: coord.lat, lon: coord.lng, id: p.id },
                      }),
                    );

                    dispatch(drawingMeasure({}));
                  },
                  click() {
                    if (joinWith) {
                      dispatch(
                        drawingLineJoinFinish({
                          lineIndex,
                          pointId: p.id,
                          selection: {
                            type: 'draw-line-poly',
                            id:
                              joinWith.lineIndex -
                              (lineIndex > joinWith.lineIndex ? 0 : 1),
                          },
                        }),
                      );

                      dispatch(drawingMeasure({}));
                    } else {
                      dispatch(
                        selectFeature({
                          type: 'line-point',
                          lineIndex,
                          pointId: p.id,
                        }),
                      );
                    }
                  },
                  dragstart: handleDragStart,
                  dragend: handleDragEnd,
                }}
              >
                {line.type === 'line' && !joinWith && (
                  <Tooltip
                    className="compact"
                    offset={[-4, 0]}
                    direction="right"
                  >
                    <span>
                      {i < 3 ? null : (
                        <>
                          ∑ {formatDistance(sumDist, language)}
                          <br />
                        </>
                      )}
                      ↔ {formatDistance(dist, language)}
                      {i < 2 ? null : (
                        <>
                          <br />∡{' '}
                          {prev &&
                            azimuthNumberFormat.format(
                              bearingToAzimuth(
                                bearing([prev.lon, prev.lat], [p.lon, p.lat]),
                              ),
                            )}
                          °
                        </>
                      )}
                    </span>
                  </Tooltip>
                )}
              </Marker>
            ) : (
              <Marker
                key={p.id}
                draggable
                position={{ lat: p.lat, lng: p.lon }}
                icon={circularIcon}
                opacity={0.33}
                eventHandlers={{
                  dragstart(e) {
                    addPoint(
                      e.target.getLatLng().lat,
                      e.target.getLatLng().lng,
                      i,
                      p.id,
                    );
                  },
                  click(e) {
                    addPoint(
                      e.target.getLatLng().lat,
                      e.target.getLatLng().lng,
                      i,
                      p.id,
                    );
                  },
                }}
              />
            );

          if (i % 2 === 0) {
            prev = p;
          }

          return marker;
        })}

      <ElevationChartActivePoint />
    </Fragment>
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
