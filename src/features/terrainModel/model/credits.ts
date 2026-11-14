import { resolveExportCredits } from '@features/mapToDocumentExport/model/exportCredits.js';
import type { AttributionDef } from '@shared/mapDefinitions.js';
import { loadTerrainLicenses, loadTileLicenses } from '@shared/tileLicenses.js';

/** The datasets some tiles were read from, as the map export reports them. */
export interface DatasetCredits {
  credits: AttributionDef[];
  /** Codes no dictionary entry names; listed apart, never as a credit. */
  unresolved: string[];
  /** The tiles named their datasets at all; none is not the same as nothing. */
  reported: boolean;
}

/**
 * Resolves tiles' `X-Attribution` values through the dictionary of the
 * service that sent them. A dictionary that fails leaves every code unresolved.
 */
export async function resolveDatasetCredits(
  attributions: string[],
  source: 'terrain' | 'tiles',
): Promise<DatasetCredits> {
  const load = source === 'terrain' ? loadTerrainLicenses : loadTileLicenses;

  const { datasets, unresolved, reported } = await resolveExportCredits(
    attributions.length ? attributions.join(',') : null,
    () => load().catch(() => null),
  );

  return { credits: datasets, unresolved, reported };
}
