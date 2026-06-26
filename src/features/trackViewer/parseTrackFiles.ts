import type { Feature, FeatureCollection } from 'geojson';
import { parseTrackData } from './parseTrackFile.js';

export type ParsedTrackFiles = {
  /** All parsed features merged into one collection, or null if none parsed. */
  merged: FeatureCollection | null;
  /** Names of files that could not be read or parsed. */
  failed: string[];
};

// Reads and parses several track files of any supported format (GPX/KML/KMZ/
// TCX/GeoJSON), merging every feature into a single collection in file order.
// Files that don't parse are skipped and reported by name in `failed`.
export async function parseTrackFiles(
  files: File[],
): Promise<ParsedTrackFiles> {
  const features: Feature[] = [];

  const failed: string[] = [];

  for (const file of files) {
    let fc: FeatureCollection | null = null;

    try {
      fc = await parseTrackData(await file.arrayBuffer(), file.name);
    } catch {
      fc = null;
    }

    if (fc) {
      features.push(...fc.features);
    } else {
      failed.push(file.name);
    }
  }

  return {
    merged: features.length ? { type: 'FeatureCollection', features } : null,
    failed,
  };
}
