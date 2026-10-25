import type { Selection } from '@app/store/actions.js';
import {
  type FeatureId,
  featureIdsEqual,
  type OsmFeatureId,
} from '@shared/types/featureId.js';
import type { Geometry } from 'geojson';

// Intra-source narrowing for an "export only the selected item" export. The
// export modal already restricts `exportables` to the selected feature's source
// (so other sources are excluded by their `include`/`set.has` flag); these
// predicates pick the one item out of that source. `only` undefined means no
// restriction. Shared by the GeoJSON/KML builder and the direct GPX exporter so
// both narrow identically.

/** A map feature, by its index in the collection. */
export function keepFeature(
  only: Selection | undefined,
  index: number,
): boolean {
  return (
    !only ||
    ((only.type === 'feature' || only.type === 'vertex') && only.id === index)
  );
}

export type FeatureExportable =
  | 'drawingLines'
  | 'drawingAreas'
  | 'drawingPoints';

/** The export toggle a map feature falls under, by its geometry. */
export function featureExportable(geometry: Geometry): FeatureExportable {
  switch (geometry.type) {
    case 'Point':
    case 'MultiPoint':
      return 'drawingPoints';
    case 'Polygon':
    case 'MultiPolygon':
      return 'drawingAreas';
    default:
      return 'drawingLines';
  }
}

export function keepObject(
  only: Selection | undefined,
  id: OsmFeatureId,
): boolean {
  return !only || (only.type === 'objects' && featureIdsEqual(id, only.id));
}

export function keepSearchResult(
  only: Selection | undefined,
  id: FeatureId,
): boolean {
  return !only || (only.type === 'search' && featureIdsEqual(id, only.id));
}

// The track token the selection targets, or null when the selection isn't a
// track (so the tracking source stays unnarrowed).
export function selectedTrackToken(only: Selection | undefined): string | null {
  return only?.type === 'tracking' ? String(only.id) : null;
}
