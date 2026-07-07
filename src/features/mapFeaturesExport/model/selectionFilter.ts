import type { Selection } from '@app/store/actions.js';
import { featureIdsEqual, type OsmFeatureId } from '@shared/types/featureId.js';

// Intra-source narrowing for an "export only the selected item" export. The
// export modal already restricts `exportables` to the selected feature's source
// (so other sources are excluded by their `include`/`set.has` flag); these
// predicates pick the one item out of that source. `only` undefined means no
// restriction. Shared by the GeoJSON/KML builder and the direct GPX exporter so
// both narrow identically.

export function keepDrawingLine(
  only: Selection | undefined,
  lineIndex: number,
): boolean {
  return (
    !only ||
    (only.type === 'draw-line-poly' && only.id === lineIndex) ||
    (only.type === 'line-point' && only.lineIndex === lineIndex)
  );
}

export function keepDrawingPoint(
  only: Selection | undefined,
  index: number,
): boolean {
  return !only || (only.type === 'draw-points' && only.id === index);
}

export function keepObject(
  only: Selection | undefined,
  id: OsmFeatureId,
): boolean {
  return !only || (only.type === 'objects' && featureIdsEqual(id, only.id));
}

// The track token the selection targets, or null when the selection isn't a
// track (so the tracking source stays unnarrowed).
export function selectedTrackToken(only: Selection | undefined): string | null {
  return only?.type === 'tracking' ? String(only.id) : null;
}
