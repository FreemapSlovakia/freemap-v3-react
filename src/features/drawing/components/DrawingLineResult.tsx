import { selectFeature } from '@app/store/actions.js';
import { selectingModeSelector } from '@app/store/selectors.js';
import { setUrlUpdatingEnabled } from '@app/url/urlUpdating.js';
import { ElevationChartActivePoint } from '@features/elevationChart/components/ElevationChartActivePoint.js';
import { splitColorAlpha } from '@shared/colorAlpha.js';
import { COLORS } from '@shared/colors.js';
import { formatDistance } from '@shared/distanceFormatter.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { isEventOnMap } from '@shared/mapUtils.js';
import type { LatLon } from '@shared/types/common.js';
import { bearing } from '@turf/bearing';
import { distance } from '@turf/distance';
import { bearingToAzimuth } from '@turf/helpers';
import Color from 'color';
import {
  type Direction,
  DomEvent,
  divIcon,
  type LatLngBounds,
  type LeafletMouseEvent,
  type PointExpression,
} from 'leaflet';
import {
  Fragment,
  type ReactElement,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Marker,
  Polygon,
  Polyline,
  Tooltip,
  useMap,
  useMapEvent,
  useMapEvents,
} from 'react-leaflet';
import { useDispatch } from 'react-redux';
import {
  drawingLineAddPoint,
  drawingLineJoinFinish,
  drawingLineUpdatePoint,
  type Point,
} from '../model/actions/drawingLineActions.js';
import { drawingMeasure } from '../model/actions/drawingPointActions.js';
import classes from './DrawingLineResult.module.css';

const circularIcon = divIcon({
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  tooltipAnchor: [10, 0],
  html: `<div class="${classes.circularMarkerIcon}" style="background-color: var(--color-normal, ${COLORS.normal})"></div>`,
});

const selectedCircularIcon = divIcon({
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  tooltipAnchor: [10, 0],
  html: `<div class="${classes.circularMarkerIcon}" style="background-color: var(--color-selected, ${COLORS.selected})"></div>`,
});

// Each vertex/midpoint handle is a DOM marker, so a many-vertex line would
// mount thousands of them and choke the browser. We only ever render handles
// that fall within the viewport (padded so handles just off-screen stay put
// during small pans), and we gate by how many vertices are actually in view.
const HANDLE_BOUNDS_PADDING = 0.5;

// While at most this many vertices are in view, show the midpoint "insert a
// point" handles too. Above it, those are dropped first (they double the
// handle count and matter less than moving existing vertices).
const MIDPOINT_VIEWPORT_LIMIT = 60;

// While at most this many vertices are in view, show vertex handles. Above it
// they'd be too dense to grab anyway, so we show none — zoom in to edit.
const VERTEX_VIEWPORT_LIMIT = 250;

// Widen the limits while handles are already shown so a small pan across the
// threshold doesn't flicker them on and off.
const HANDLE_HYSTERESIS = 1.3;

type HandleTier = 'all' | 'vertices' | 'none';

type VisibleHandle = {
  i: number;
  p: Point;
  isMidpoint: boolean;
  segDist: number;
  cumDist: number;
  azimuth: number;
};

type Props = {
  lineIndex: number;
};

export function DrawingLineResult({ lineIndex }: Props): ReactElement {
  const dispatch = useDispatch();

  // The rubber-band preview from the last point to the cursor shows only while a
  // drawing is actually in progress — not merely because the tool is open.
  const drawing = useAppSelector((state) => state.drawingLines.drawing);

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

  const color = line.color || COLORS.normal;

  const stroke = splitColorAlpha(color);

  const renderColor = selected
    ? Color(stroke.color).lighten(0.75).hex()
    : stroke.color;

  const fillRaw = splitColorAlpha(line.fillColor ?? color);

  const renderFillColor = selected
    ? Color(fillRaw.color).lighten(0.75).hex()
    : fillRaw.color;

  const renderFillOpacity = line.fillColor ? fillRaw.opacity : undefined;

  const width = line.width || 4;

  const joinWith = useAppSelector((state) => state.drawingLines.joinWith);

  const interactive = useAppSelector(selectingModeSelector);

  const interactiveLine = interactive && joinWith === undefined;

  const { points } = line;

  // The marker being dragged is exempt from culling/density gating and keeps
  // handles shown even if the selection is cleared mid-drag, so it can never
  // unmount before dragend fires — which would strand the point and leave the
  // dragstart's URL-suspend and click-guard flags stuck on.
  const [draggingPointId, setDraggingPointId] = useState<number | undefined>(
    undefined,
  );

  const showHandles =
    selected ||
    selectedPointId !== undefined ||
    joinWith !== undefined ||
    draggingPointId !== undefined;

  const [coords, setCoords] = useState<LatLon | undefined>();

  const [touching, setTouching] = useState(false);

  const removeCoords =
    Boolean(coords) && ((!selected && !joinWith) || touching);

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
      id = points.length ? points[pos]!.id - 1 : 0;
    } else if (pos === points.length) {
      id = points[pos - 1]!.id + 1;
    } else {
      id = (points[pos - 1]!.id + points[pos]!.id) / 2;
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

  // `ps` interleaves vertices (even indices) with midpoint handles (odd
  // indices). `handleMeta` is aligned with it and, for each vertex, carries the
  // segment length to the previous vertex, the running total, and the bearing —
  // precomputed here so the render path doesn't recompute turf maths per handle.
  const { ps, handleMeta } = useMemo(() => {
    const ps: Point[] = [];

    const handleMeta: { segDist: number; cumDist: number; azimuth: number }[] =
      [];

    let prev: Point | null = null;

    let cumDist = 0;

    for (const [i, point] of points.entries()) {
      let segDist = 0;

      let azimuth = 0;

      if (prev) {
        segDist = distance([prev.lon, prev.lat], [point.lon, point.lat], {
          units: 'meters',
        });

        cumDist += segDist;

        azimuth = bearingToAzimuth(
          bearing([prev.lon, prev.lat], [point.lon, point.lat]),
        );
      }

      ps.push(point);

      handleMeta.push({ segDist, cumDist, azimuth });

      prev = point;

      if (i < points.length - 1 || line.type === 'polygon') {
        const next = points[(i + 1) % points.length]!;

        const lat = (point.lat + next.lat) / 2;

        const lon = (point.lon + next.lon) / 2;

        ps.push({
          lat,
          lon,
          id:
            points.length - 1 === i
              ? points.length * 2
              : (point.id + next.id) / 2,
        });

        handleMeta.push({ segDist: 0, cumDist: 0, azimuth: 0 });
      }
    }

    return { ps, handleMeta };
  }, [points, line.type]);

  // Snapshot the live viewport so handle culling reacts to it. Only shown-handle
  // lines snapshot, so unrelated lines don't re-render on every pan. The map
  // hands back a fresh LatLngBounds each call, so the snapshot updates by value.
  const [handleBounds, setHandleBounds] = useState<LatLngBounds | null>(null);

  // If the dragged point is deleted mid-drag (the line survives), dragend never
  // fires; end the drag so the cleanup below restores its flags. draggingPointId
  // is stable during a drag, so this only reacts to the point actually vanishing.
  useEffect(() => {
    if (
      draggingPointId !== undefined &&
      !points.some((p) => p.id === draggingPointId)
    ) {
      setDraggingPointId(undefined);
    }
  }, [draggingPointId, points]);

  // Restore dragstart's flags when a live drag is torn down without dragend —
  // the point cleared above, or the whole line (this component) unmounted.
  // Keyed on draggingPointId only, so it doesn't fire on every drag move.
  useEffect(() => {
    if (draggingPointId === undefined) {
      return;
    }

    return () => {
      setUrlUpdatingEnabled(true);

      handleDragEnd();
    };
  }, [draggingPointId]);

  useMapEvents({
    moveend() {
      if (showHandles) {
        setHandleBounds(map.getBounds());
      }
    },
    zoomend() {
      if (showHandles) {
        setHandleBounds(map.getBounds());
      }
    },
    // A container resize (e.g. opening/closing a side panel) changes the
    // viewport without a pan or zoom, so refresh the snapshot here too.
    resize() {
      if (showHandles) {
        setHandleBounds(map.getBounds());
      }
    },
  });

  useEffect(() => {
    if (showHandles) {
      setHandleBounds(map.getBounds());
    }
  }, [showHandles, map]);

  // Last committed tier, read to widen the density limits via hysteresis so a
  // small pan across the threshold doesn't flicker handles on and off. Written
  // from an effect (never during render) so a discarded or double-invoked render
  // can't advance it past the tier actually shown.
  const tierRef = useRef<HandleTier>('all');

  const { handles: visibleHandles, tier: handleTier } = useMemo(() => {
    if (!showHandles) {
      return { handles: [] as VisibleHandle[], tier: 'all' as HandleTier };
    }

    const bounds = handleBounds ?? map.getBounds();

    const padded = bounds.pad(HANDLE_BOUNDS_PADDING);

    // Count over the padded region so the limits match the handles actually
    // mounted (emission below culls against the same `padded` bounds).
    let inView = 0;

    for (let i = 0; i < ps.length; i += 2) {
      if (padded.contains([ps[i]!.lat, ps[i]!.lon])) {
        inView++;
      }
    }

    let tier: HandleTier;

    if (joinWith !== undefined) {
      // Joining shows at most the two endpoints of each other line — never
      // dense enough to gate.
      tier = 'all';
    } else {
      const prev = tierRef.current;

      const vertexLimit =
        prev === 'none'
          ? VERTEX_VIEWPORT_LIMIT
          : VERTEX_VIEWPORT_LIMIT * HANDLE_HYSTERESIS;

      const midpointLimit =
        prev === 'all'
          ? MIDPOINT_VIEWPORT_LIMIT * HANDLE_HYSTERESIS
          : MIDPOINT_VIEWPORT_LIMIT;

      tier =
        inView > vertexLimit
          ? 'none'
          : inView > midpointLimit
            ? 'vertices'
            : 'all';
    }

    // The selected and dragged points are always shown; outside that, a 'none'
    // tier emits nothing.
    const hasExempt =
      joinWith === undefined &&
      (selectedPointId !== undefined || draggingPointId !== undefined);

    if (tier === 'none' && !hasExempt) {
      return { handles: [] as VisibleHandle[], tier };
    }

    const out: VisibleHandle[] = [];

    for (let i = 0; i < ps.length; i++) {
      const isMidpoint = i % 2 === 1;

      const p = ps[i]!;

      // Only vertices are ever selected or dragged (a dragged midpoint is
      // promoted to a vertex). Excluding midpoints also avoids a stale
      // selectedPointId colliding with a newly formed midpoint's averaged id.
      const exempt =
        !isMidpoint &&
        joinWith === undefined &&
        (p.id === selectedPointId || p.id === draggingPointId);

      if (!exempt) {
        if (tier === 'none' || (isMidpoint && tier !== 'all')) {
          continue;
        }

        if (!padded.contains([p.lat, p.lon])) {
          continue;
        }

        if (
          joinWith !== undefined &&
          (line.type !== 'line' ||
            (i !== 0 && i !== ps.length - 1) ||
            joinWith.lineIndex === lineIndex)
        ) {
          continue;
        }
      }

      const m = handleMeta[i]!;

      out.push({
        i,
        p,
        isMidpoint,
        segDist: m.segDist,
        cumDist: m.cumDist,
        azimuth: m.azimuth,
      });
    }

    return { handles: out, tier };
  }, [
    showHandles,
    handleBounds,
    map,
    ps,
    handleMeta,
    joinWith,
    line.type,
    lineIndex,
    selectedPointId,
    draggingPointId,
  ]);

  useEffect(() => {
    // Only remember a real tier; the hidden path returns a placeholder 'all'
    // that would otherwise reset the hysteresis baseline between selections.
    if (showHandles) {
      tierRef.current = handleTier;
    }
  }, [showHandles, handleTier]);

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
            : [{ lat: ps[0]!.lat, lng: ps[0]!.lon }]),
        ]
      : undefined;

  let measurementText: ReactNode = null;

  let measurementTooltipDirection: Direction = 'auto';

  let measurementTooltipPosition: PointExpression = [0, 0];

  const language = useAppSelector((state) => state.l10n.language);

  if (line.type === 'line' && futureLinePositions?.length === 2) {
    const futureA = futureLinePositions[0]!;
    const futureB = futureLinePositions[1]!;

    const a: [number, number] = [futureA.lng, futureA.lat];

    const b: [number, number] = [futureB.lng, futureB.lat];

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
          lat: futureB.lat,
          lon: futureB.lng,
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
    <Fragment
      key={[
        line.type,
        line.width,
        line.dashArray,
        line.lineCap,
        line.lineJoin,
        lineIndex,
      ].join(',')}
    >
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
              color: renderColor,
              opacity: stroke.opacity,
              dashArray: line.dashArray,
              lineCap: line.lineCap ?? 'round',
              lineJoin: line.lineJoin ?? 'round',
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
          pane="fm-drawing-polygons"
          weight={width}
          pathOptions={{
            color: renderColor,
            opacity: stroke.opacity,
            fillColor: renderFillColor,
            fillOpacity: renderFillOpacity,
            dashArray: line.dashArray,
            lineCap: line.lineCap ?? 'round',
            lineJoin: line.lineJoin ?? 'round',
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
          pathOptions={{
            color: Color(stroke.color).lighten(0.75).hex(),
            opacity: stroke.opacity,
            dashArray: line.dashArray,
            lineCap: line.lineCap ?? 'round',
            lineJoin: line.lineJoin ?? 'round',
            weight: width,
          }}
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

      {visibleHandles.map(({ i, p, isMidpoint, segDist, cumDist, azimuth }) =>
        isMidpoint ? (
          <Marker
            key={p.id}
            draggable
            position={{ lat: p.lat, lng: p.lon }}
            icon={circularIcon}
            opacity={0.33}
            eventHandlers={{
              dragstart(e) {
                setUrlUpdatingEnabled(false);

                // addPoint promotes this midpoint into a real vertex keyed by
                // the same id; keep it exempt from culling for the rest of the
                // drag so the now-vertex marker isn't unmounted mid-gesture.
                setDraggingPointId(p.id);

                const { lat, lng } = e.target.getLatLng();

                addPoint(lat, lng, i, p.id);
              },
              click(e) {
                const { lat, lng } = e.target.getLatLng();

                addPoint(lat, lng, i, p.id);
              },
            }}
          />
        ) : (
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
              dragstart() {
                // Suspend history writes for the whole drag gesture so
                // intermediate vertex positions don't pile up in browser
                // history. Re-enabled on dragend.
                setUrlUpdatingEnabled(false);

                // Exempt from culling so the marker can't unmount mid-drag.
                setDraggingPointId(p.id);

                handleDragStart();
              },
              dragend(e) {
                // Re-enable first so the final-position dispatch below runs
                // through the URL processor and commits the whole drag as a
                // single history entry.
                setUrlUpdatingEnabled(true);

                setDraggingPointId(undefined);

                const coord = e.target.getLatLng();

                dispatch(
                  drawingLineUpdatePoint({
                    index: lineIndex,
                    point: { lat: coord.lat, lon: coord.lng, id: p.id },
                  }),
                );

                dispatch(drawingMeasure({}));

                handleDragEnd();
              },
            }}
          >
            {line.type === 'line' && !joinWith && (
              <Tooltip className="compact" offset={[-4, 0]} direction="right">
                <span>
                  {i < 3 ? null : (
                    <>
                      ∑ {formatDistance(cumDist, language)}
                      <br />
                    </>
                  )}
                  ↔ {formatDistance(segDist, language)}
                  {i < 2 ? null : (
                    <>
                      <br />∡ {azimuthNumberFormat.format(azimuth)}°
                    </>
                  )}
                </span>
              </Tooltip>
            )}
          </Marker>
        ),
      )}

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
