import z from 'zod';
import type { AttributionDef } from './mapDefinitions.js';
import { rememberedJson } from './rememberedJson.js';

/**
 * A token naming a national model by its area — a country, or a part of one
 * (`en`, `wls`) — rather than a model of its own (`gedtm30`, `sonny`, `srtm`).
 */
const NATIONAL_TOKEN = /^[a-z]{2,3}$/;

// The API's source names as a read reports them, kept to the national models'.
const sources = rememberedJson(
  `${process.env['API_URL']}/geotools/elevation/sources`,
  'fm.elevationSources',
  z
    .array(z.string())
    .transform((names) => names.filter((name) => NATIONAL_TOKEN.test(name))),
);

/** Areas a premium read answers from a national model; `null` until known. */
export const useDtmCountries = sources.useValue;

/**
 * The LiDAR-derived terrain model GraphHopper is built on: it serves its own
 * elevation from it, which a route's profile keeps on the free tier, and weighs
 * every route by it — so a premium route, whose profile is re-read from the
 * national models, is still shaped by this one. Its open licence asks to be
 * credited, which is why a standing GraphHopper result names it as well.
 */
export const SONNY_ATTR: AttributionDef = {
  type: 'data',
  name: "Sonny's LiDAR DTM",
  url: 'https://sonny.4lima.de/',
};

/**
 * Whether every model that answered is a national, LiDAR-derived one, so a
 * reading is worth a decimal. An unknown model id, or nothing reported, isn't.
 */
export function hasSubMeterPrecision(tokens: string[]): boolean {
  return (
    tokens.length > 0 &&
    tokens.every((token) => NATIONAL_TOKEN.test(token.toLowerCase()))
  );
}

// Nothing derives the sources from where the map is looking: the API reports
// what answered for the very points it was asked about, and a viewport is only a
// proxy for those — one that over-credits a zoomed-out view, and that would keep
// a copy of the API's own model choice here to rot. With nothing reported the
// honest answer is to credit nothing.
