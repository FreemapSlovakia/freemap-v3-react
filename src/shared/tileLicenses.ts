import z from 'zod';
import { rememberedJson } from './rememberedJson.js';

const LicenseSchema = z.object({
  title: z.string(),
  url: z.string().optional(),
});

// Several per code: one dataset key can cover ground held under more than one
// licence — `shading:be` is Wallonia's and Flanders', each with its own terms.
export const LicenseDictSchema = z.record(z.string(), z.array(LicenseSchema));

/** What each dataset code stands for, as the server that drew it names it. */
export type LicenseDict = z.infer<typeof LicenseDictSchema>;

// Served with `Cache-Control: no-cache`, so the browser revalidates it and a
// dataset added since the last visit is never resolved from a stale copy.
// Remembered so a map browsed offline still credits its terrain.
const renderer = rememberedJson(
  `${process.env['FM_MAPSERVER_URL']}/licenses`,
  'fm.tileLicenses',
  LicenseDictSchema,
);

const terrain = rememberedJson(
  `${process.env['FM_TERRAIN_TILES_URL']}/licenses`,
  'fm.terrainLicenses',
  LicenseDictSchema,
);

/** The outdoor renderer's dictionary. */
export const loadTileLicenses = renderer.load;

export const useTileLicenses = renderer.useValue;

/** terrain-tiles' dictionary, for the shading layers. */
export const loadTerrainLicenses = terrain.load;

export const useTerrainLicenses = terrain.useValue;

/** Just the entries the given codes name, to travel with an offline map. */
export function licenseSubset(
  licenses: LicenseDict | null,
  codes: Iterable<string>,
): LicenseDict | undefined {
  if (!licenses) {
    return undefined;
  }

  const subset: LicenseDict = {};

  for (const code of codes) {
    const license = licenses[code];

    if (license) {
      subset[code] = license;
    }
  }

  return subset;
}
