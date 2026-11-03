import { useMemo } from 'react';
import z from 'zod';
import { rememberedJson } from './rememberedJson.js';

const PricesSchema = z.array(
  z.object({ type: z.string(), creditsPerMTile: z.number() }),
);

/** Credits per million tiles, by the API's map `type`. */
export type ExportPrices = Readonly<Record<string, number>>;

// Remembered so an offline map can still be edited from its source offline.
const store = rememberedJson(
  `${process.env['API_URL']}/downloadableMaps`,
  'fm.exportPrices',
  PricesSchema,
);

/**
 * What the API makes offline packages of — the one list that decides what the
 * offline export and the offline maps offer.
 */
export function useExportPrices(): ExportPrices | null {
  const list = store.useValue();

  return useMemo(
    () =>
      list && Object.fromEntries(list.map((m) => [m.type, m.creditsPerMTile])),
    [list],
  );
}
