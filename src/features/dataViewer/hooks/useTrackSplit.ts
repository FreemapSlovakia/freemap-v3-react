import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { Position } from 'geojson';
import type { LatLng } from 'leaflet';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import {
  dataViewerSetSplitPoint,
  dataViewerSplitTrack,
} from '../model/actions.js';
import {
  isCutVertex,
  nearestTrackVertex,
  splitTrackCoordinates,
  type TrackSplitPoint,
  vertexAt,
  vertexDistances,
} from '../splitTrack.js';
import { isTrackLine } from '../trackSelection.js';

const POINTER_EVENTS = ['pointerdown', 'pointermove'] as const;

/**
 * What is pointing at the map. Read off the pointer events because a `click` is
 * a plain `MouseEvent` in some browsers, and off moves as well as presses, or a
 * mouse would count as coarse until it clicked.
 */
function usePointerType(armed: boolean) {
  const map = useMap();

  // Coarse until something says otherwise: an unknown pointer gets the step
  // that cannot cut by accident.
  const type = useRef('touch');

  useEffect(() => {
    if (!armed) {
      return;
    }

    const container = map.getContainer();

    const onPointer = (e: PointerEvent) => {
      type.current = e.pointerType;
    };

    for (const name of POINTER_EVENTS) {
      container.addEventListener(name, onPointer, true);
    }

    return () => {
      for (const name of POINTER_EVENTS) {
        container.removeEventListener(name, onPointer, true);
      }
    };
  }, [map, armed]);

  return type;
}

export interface TrackSplitCursor {
  lat: number;
  lon: number;
  /** Distance from the start of the track, and what is left past the cut. */
  distance: number;
  remaining: number;
  /** A cut waiting on the toolbar to confirm it, as opposed to the ghost. */
  frozen: boolean;
}

/**
 * The split cursor: while it is armed for the selected track, the vertex
 * nearest the pointer is offered as the cut. Only the selected track answers,
 * so every other feature stays selectable with the mode on.
 */
export function useTrackSplit(selectedIndex: number | undefined) {
  const dispatch = useDispatch();

  const splitting = useAppSelector((state) => state.trackViewer.splitting);

  const splitPoint = useAppSelector((state) => state.trackViewer.splitPoint);

  // The source geometry, not the densified render copy the map draws: a cut
  // indexes the points the track is actually made of.
  const trackGeojson = useAppSelector(
    (state) => state.trackViewer.trackGeojson,
  );

  const [hovered, setHovered] = useState<TrackSplitPoint | null>(null);

  const feature =
    selectedIndex === undefined
      ? undefined
      : trackGeojson?.features[selectedIndex];

  const track =
    splitting && feature && isTrackLine(feature) ? feature : undefined;

  const pointerType = usePointerType(track !== undefined);

  // Walked once per armed track rather than per pointer move.
  const distances = useMemo(
    () => (track ? vertexDistances(track) : null),
    [track],
  );

  useEffect(() => {
    if (!track) {
      setHovered(null);
    }
  }, [track]);

  // A frozen cut wins over a hover, so the cursor shows what the toolbar acts on.
  const at = splitPoint ?? hovered;

  const position =
    track && at ? vertexAt(track, at.segmentIndex, at.pointIndex) : undefined;

  // The two halves the cut would give, each drawn in its own colour.
  const preview = useMemo(() => {
    if (!track || !at) {
      return null;
    }

    const halves = splitTrackCoordinates(track, at.segmentIndex, at.pointIndex);

    const toPositions = (parts: Position[][]) =>
      parts.map((part) => part.map((p) => ({ lat: p[1]!, lng: p[0]! })));

    return { head: toPositions(halves.head), tail: toPositions(halves.tail) };
  }, [track, at]);

  const distance =
    at && distances ? (distances[at.segmentIndex]?.[at.pointIndex] ?? 0) : 0;

  const total = distances?.at(-1)?.at(-1) ?? 0;

  const cursor: TrackSplitCursor | null =
    position && at
      ? {
          lat: position[1]!,
          lon: position[0]!,
          distance,
          remaining: total - distance,
          frozen: splitPoint !== null,
        }
      : null;

  /** The cut a pointer at this position asks for, or `null` where none is. */
  const pick = (latlng: LatLng): TrackSplitPoint | null => {
    if (!track || selectedIndex === undefined) {
      return null;
    }

    const vertex = nearestTrackVertex(track, latlng.lat, latlng.lng);

    return vertex && isCutVertex(track, vertex.segmentIndex, vertex.pointIndex)
      ? { featureIndex: selectedIndex, ...vertex }
      : null;
  };

  return {
    armed: track !== undefined,
    cursor,
    preview,

    handleMove(featureIndex: number, latlng: LatLng) {
      // A finger never hovers, and a frozen cut is what the cursor shows
      // anyway — in both cases the scan would be for nothing.
      if (
        featureIndex !== selectedIndex ||
        splitPoint ||
        pointerType.current === 'touch'
      ) {
        return;
      }

      const point = pick(latlng);

      if (
        point?.segmentIndex !== hovered?.segmentIndex ||
        point?.pointIndex !== hovered?.pointIndex
      ) {
        setHovered(point);
      }
    },

    handleOut() {
      if (hovered) {
        setHovered(null);
      }
    },

    /**
     * True when the armed track answered the click, so the caller does not also
     * select — which, on the track already selected, would clear the mode. A
     * click where no cut is possible is still answered, with nothing.
     */
    handleClick(featureIndex: number, latlng: LatLng): boolean {
      if (!track || featureIndex !== selectedIndex) {
        return false;
      }

      const point = pick(latlng);

      if (point) {
        dispatch(
          pointerType.current === 'touch'
            ? dataViewerSetSplitPoint(point)
            : dataViewerSplitTrack(point),
        );
      }

      return true;
    },

    /**
     * Where a cursor let go here belongs. The caller has to move the marker
     * there: aiming back at the same vertex changes no state, so no re-render
     * would put it back.
     */
    handleDragEnd(latlng: LatLng): { lat: number; lng: number } | null {
      const point = pick(latlng) ?? splitPoint;

      if (!track || !point) {
        return null;
      }

      dispatch(dataViewerSetSplitPoint(point));

      const vertex = vertexAt(track, point.segmentIndex, point.pointIndex);

      return vertex ? { lat: vertex[1]!, lng: vertex[0]! } : null;
    },
  };
}
