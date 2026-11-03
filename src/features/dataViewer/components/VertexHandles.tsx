import { selectFeature } from '@app/store/actions.js';
import { setUrlUpdatingEnabled } from '@app/url/urlUpdating.js';
import { drawingMeasure } from '@features/drawing/model/actions/drawingPointActions.js';
import { joinColorAlpha } from '@shared/colorAlpha.js';
import { COLORS } from '@shared/colors.js';
import { formatDistance } from '@shared/distanceFormatter.js';
import { formatAzimuth } from '@shared/geoutils.js';
import { HALO_OPACITY, SELECTION_COLOR } from '@shared/halo.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { isEventOnMap } from '@shared/mapUtils.js';
import { bearing } from '@turf/bearing';
import { distance } from '@turf/distance';
import { bearingToAzimuth } from '@turf/helpers';
import Color from 'color';
import type { Position } from 'geojson';
import {
  type Direction,
  DomEvent,
  divIcon,
  type LatLngBounds,
  type LatLngLiteral,
  type LeafletMouseEvent,
  type PathOptions,
  type PointExpression,
} from 'leaflet';
import {
  type ReactElement,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Marker,
  Polyline,
  Tooltip,
  useMap,
  useMapEvent,
  useMapEvents,
} from 'react-leaflet';
import { useDispatch } from 'react-redux';
import {
  dataViewerInsertVertex,
  dataViewerMoveVertex,
} from '../model/actions.js';
import classes from './VertexHandles.module.css';

const circularIcon = divIcon({
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  tooltipAnchor: [10, 0],
  html: `<div class="${classes.circularMarkerIcon}" style="background-color: var(--color-normal, ${COLORS.normal})"></div>`,
});

// The selected vertex keeps the line's color and wears the ring instead, as
// every other selected feature does.
const selectedCircularIcon = divIcon({
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  tooltipAnchor: [10, 0],
  html: `<div class="${classes.circularMarkerIcon}" style="background-color: var(--color-normal, ${COLORS.normal}); box-shadow: 0 0 0 3px ${joinColorAlpha(SELECTION_COLOR, HALO_OPACITY)}"></div>`,
});

// Each handle is a DOM marker, so a many-vertex line would mount thousands of
// them. Only handles within the (padded) viewport render, gated by how many
// vertices are in view.
const HANDLE_BOUNDS_PADDING = 0.5;

// Above this many vertices in view the midpoint "insert" handles go first.
const MIDPOINT_VIEWPORT_LIMIT = 60;

// Above this many they'd be too dense to grab; zoom in to edit.
const VERTEX_VIEWPORT_LIMIT = 250;

// Widened while handles are shown so a small pan doesn't flicker them.
const HANDLE_HYSTERESIS = 1.3;

type HandleTier = 'all' | 'vertices' | 'none';

const toLatLng = ([lon, lat]: Position): LatLngLiteral => ({
  lat: lat!,
  lng: lon!,
});

const lonLat = ({ lat, lng }: LatLngLiteral): Position => [lng, lat];

// see https://github.com/FreemapSlovakia/freemap-v3-react/issues/168
function handleDragStart() {
  window.preventMapClick = true;
}

function handleDragEnd() {
  window.setTimeout(() => {
    window.preventMapClick = false;
  });
}

type Props = {
  index: number;
  part: number;
  /** The part's vertices, a ring's listed open. */
  vertices: Position[];
  ring: boolean;
  /** The line's own stroke, for the handles and the drawing preview. */
  color: string;
  previewStyle: PathOptions & { weight: number };
  selectedVertex: number | undefined;
  /** Whether map clicks append to this part. */
  drawing: boolean;
};

/**
 * The editing handles of one part of a feature — its vertices to drag, select
 * and delete, and the midpoints to drag a new vertex out of — and, while it is
 * being drawn, the preview of the next segment.
 */
export function VertexHandles({
  index,
  part,
  vertices,
  ring,
  color,
  previewStyle,
  selectedVertex,
  drawing,
}: Props): ReactElement {
  // Distances and bearings on the handles: a line's, not a ring's.
  const measure = !ring;

  const dispatch = useDispatch();

  const map = useMap();

  const language = useAppSelector((state) => state.l10n.language);

  useEffect(() => {
    document.documentElement.style.setProperty('--color-normal', color);
  }, [color]);

  // The marker being dragged is exempt from culling, so it can't unmount before
  // its dragend — which would strand the URL-suspend and click-guard flags.
  const [dragging, setDragging] = useState<number | undefined>();

  // A midpoint dragged out: the vertex lands where it is let go.
  const [midDrag, setMidDrag] = useState<
    { after: number; at: LatLngLiteral } | undefined
  >();

  useEffect(() => {
    if (dragging !== undefined && dragging >= vertices.length) {
      setDragging(undefined);
    }
  }, [dragging, vertices.length]);

  // Either drag, cut off before its dragend (the handles unmounting under it),
  // still gives the URL and map clicks back.
  const anyDrag = dragging !== undefined || midDrag !== undefined;

  useEffect(() => {
    if (!anyDrag) {
      return;
    }

    return () => {
      setUrlUpdatingEnabled(true);

      handleDragEnd();
    };
  }, [anyDrag]);

  const meta = useMemo(() => {
    if (!measure) {
      return [];
    }

    const result = [{ segDist: 0, cumDist: 0, azimuth: 0 }];

    for (let i = 1; i < vertices.length; i++) {
      const prev = vertices[i - 1]!;

      const p = vertices[i]!;

      const segDist = distance(prev, p, { units: 'meters' });

      result.push({
        segDist,
        cumDist: result[i - 1]!.cumDist + segDist,
        azimuth: bearingToAzimuth(bearing(prev, p)),
      });
    }

    return result;
  }, [vertices, measure]);

  const [bounds, setBounds] = useState<LatLngBounds>(() => map.getBounds());

  useMapEvents({
    moveend() {
      setBounds(map.getBounds());
    },
    zoomend() {
      setBounds(map.getBounds());
    },
    resize() {
      setBounds(map.getBounds());
    },
  });

  const tierRef = useRef<HandleTier>('all');

  const midDragAfter = midDrag?.after;

  const { shown, tier } = useMemo(() => {
    const padded = bounds.pad(HANDLE_BOUNDS_PADDING);

    const inBounds = vertices.map((p) => padded.contains(toLatLng(p)));

    const inView = inBounds.filter(Boolean).length;

    const prev = tierRef.current;

    const tier: HandleTier =
      inView >
      (prev === 'none'
        ? VERTEX_VIEWPORT_LIMIT
        : VERTEX_VIEWPORT_LIMIT * HANDLE_HYSTERESIS)
        ? 'none'
        : inView >
            (prev === 'all'
              ? MIDPOINT_VIEWPORT_LIMIT * HANDLE_HYSTERESIS
              : MIDPOINT_VIEWPORT_LIMIT)
          ? 'vertices'
          : 'all';

    const exempt = (i: number) => i === selectedVertex || i === dragging;

    const shown = {
      vertices: vertices.flatMap((_, i) =>
        exempt(i) || (tier !== 'none' && inBounds[i]) ? [i] : [],
      ),
      // A midpoint follows the vertex it comes after; a ring has one more.
      // The one being dragged stays whatever the tier, as a dragged vertex does.
      midpoints: vertices.flatMap((_, i) =>
        i === midDragAfter ||
        (tier === 'all' &&
          (i < vertices.length - 1 || (ring && vertices.length > 2)) &&
          (inBounds[i] || inBounds[(i + 1) % vertices.length]))
          ? [i]
          : [],
      ),
    };

    return { shown, tier };
  }, [bounds, vertices, ring, selectedVertex, dragging, midDragAfter]);

  useEffect(() => {
    tierRef.current = tier;
  }, [tier]);

  const [cursor, setCursor] = useState<LatLngLiteral | undefined>();

  const [touching, setTouching] = useState(false);

  useMapEvent('mousemove', ({ latlng, originalEvent }: LeafletMouseEvent) => {
    if (drawing && !touching) {
      setCursor(isEventOnMap(originalEvent) ? latlng : undefined);
    }
  });

  useMapEvent('mouseout', () => {
    setCursor(undefined);
  });

  useEffect(() => {
    if (!drawing) {
      setCursor(undefined);

      return;
    }

    const container = map.getContainer();

    const start = () => setTouching(true);

    const end = () => setTouching(false);

    DomEvent.on(container, 'touchstart', start);

    DomEvent.on(container, 'touchend', end);

    return () => {
      DomEvent.off(container, 'touchstart', start);

      DomEvent.off(container, 'touchend', end);
    };
  }, [map, drawing]);

  const last = vertices.at(-1);

  const preview =
    drawing && last && cursor && !touching && !window.preventMapClick
      ? [
          toLatLng(last),
          cursor,
          ...(ring && vertices.length > 1 ? [toLatLng(vertices[0]!)] : []),
        ]
      : undefined;

  let measurementText: ReactNode = null;

  let tooltipDirection: Direction = 'auto';

  let tooltipPosition: PointExpression = [0, 0];

  if (!ring && measure && preview?.length === 2) {
    const a = lonLat(preview[0]!);

    const b = lonLat(preview[1]!);

    const azimuth = bearingToAzimuth(bearing(a, b));

    tooltipDirection =
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

    const sum = (meta.at(-1)?.cumDist ?? 0) + dist;

    measurementText =
      dist > 0 ? (
        <span>
          {vertices.length > 1 && (
            <>
              ∑ {formatDistance(sum, language)}
              <br />
            </>
          )}
          ↔ {formatDistance(dist, language)}
          <br />∡ {formatAzimuth(azimuth, language)}
        </span>
      ) : null;

    tooltipPosition = [(a[1]! + b[1]!) / 2, (a[0]! + b[0]!) / 2];
  }

  const address = (vertex: number) => ({ index, part, vertex });

  const moveTo = (vertex: number, at: LatLngLiteral) => {
    dispatch(
      dataViewerMoveVertex({ ...address(vertex), position: lonLat(at) }),
    );

    dispatch(drawingMeasure({}));
  };

  /** A new vertex after `vertex`, from the midpoint it was pulled out of. */
  const insertAfter = (vertex: number, at: LatLngLiteral) => {
    dispatch(
      dataViewerInsertVertex({ ...address(vertex + 1), position: lonLat(at) }),
    );

    dispatch(drawingMeasure({}));
  };

  const midpointOf = (i: number) => {
    const a = vertices[i]!;

    const b = vertices[(i + 1) % vertices.length]!;

    return { lat: (a[1]! + b[1]!) / 2, lng: (a[0]! + b[0]!) / 2 };
  };

  return (
    <>
      {preview && (
        <Polyline
          pathOptions={{
            ...previewStyle,
            color: Color(color).lighten(0.75).hex(),
          }}
          interactive={false}
          positions={preview}
        >
          {measurementText && (
            <Tooltip
              key={tooltipDirection}
              permanent
              className="compact"
              direction={tooltipDirection}
              position={tooltipPosition}
            >
              {measurementText}
            </Tooltip>
          )}
        </Polyline>
      )}

      {midDrag && (
        <Polyline
          pathOptions={{ ...previewStyle, dashArray: '4 6' }}
          interactive={false}
          positions={[
            toLatLng(vertices[midDrag.after]!),
            midDrag.at,
            toLatLng(vertices[(midDrag.after + 1) % vertices.length]!),
          ]}
        />
      )}

      {shown.midpoints.map((i) => (
        <Marker
          key={`m${i}-${vertices.length}`}
          draggable
          // Else each re-render during the drag snaps it back to the midpoint.
          position={midDrag?.after === i ? midDrag.at : midpointOf(i)}
          icon={circularIcon}
          opacity={0.33}
          eventHandlers={{
            dragstart(e) {
              setUrlUpdatingEnabled(false);

              setMidDrag({ after: i, at: e.target.getLatLng() });

              handleDragStart();
            },
            drag(e) {
              setMidDrag({ after: i, at: e.target.getLatLng() });
            },
            dragend(e) {
              setUrlUpdatingEnabled(true);

              setMidDrag(undefined);

              insertAfter(i, e.target.getLatLng());

              handleDragEnd();
            },
            click(e) {
              insertAfter(i, e.target.getLatLng());
            },
          }}
        />
      ))}

      {shown.vertices.map((i) => {
        // None for a ring.
        const m = meta[i];

        return (
          <Marker
            draggable
            position={toLatLng(vertices[i]!)}
            // A marker's icon can't be swapped in place, so the key does it.
            key={`v${i}${selectedVertex === i ? 's' : ''}`}
            icon={selectedVertex === i ? selectedCircularIcon : circularIcon}
            eventHandlers={{
              drag(e) {
                moveTo(i, e.target.getLatLng());
              },
              click() {
                dispatch(
                  selectFeature({
                    type: 'vertex',
                    id: index,
                    part,
                    vertex: i,
                  }),
                );
              },
              dragstart() {
                // One history entry for the whole gesture, written on dragend.
                setUrlUpdatingEnabled(false);

                setDragging(i);

                handleDragStart();
              },
              dragend(e) {
                setUrlUpdatingEnabled(true);

                setDragging(undefined);

                moveTo(i, e.target.getLatLng());

                handleDragEnd();
              },
            }}
          >
            {m && i > 0 && (
              <Tooltip className="compact" offset={[-4, 0]} direction="right">
                <span>
                  {i > 1 && (
                    <>
                      ∑ {formatDistance(m.cumDist, language)}
                      <br />
                    </>
                  )}
                  ↔ {formatDistance(m.segDist, language)}
                  <br />∡ {formatAzimuth(m.azimuth, language)}
                </span>
              </Tooltip>
            )}
          </Marker>
        );
      })}
    </>
  );
}
