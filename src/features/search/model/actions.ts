import {
  type DrawingStyle,
  DrawingStyleSchema,
} from '@features/drawing/model/reducers/drawingSettingsReducer.js';
import { createAction } from '@reduxjs/toolkit';
import { type FeatureId, FeatureIdSchema } from '@shared/types/featureId.js';
import type { Feature, FeatureCollection, GeoJsonProperties } from 'geojson';
import z from 'zod';
import {
  GeoJSONFeatureCollectionSchema,
  GeoJSONFeatureGenericSchema,
  GeoJSONGeometrySchema,
  GeoJSONPositionSchema,
  GeoJSONPropertiesSchema,
} from 'zod-geojson';

/**
 * User-overridable style for displayed search / map-details geometry. Shares
 * the full drawing-style shape (color, fill, width, dash, line cap/join, marker
 * shape); `color` and `fillColor` are RGBA hex (their alpha is the opacity).
 * Used by the `search` and `mapDetails` features, which render through the same
 * component.
 */
export const SearchResultStyleSchema = DrawingStyleSchema;

export type SearchResultStyle = DrawingStyle;

export const searchSetResultStyle = createAction<SearchResultStyle>(
  'SEARCH_SET_RESULT_STYLE',
);

export const SearchSourceSchema = z.union([
  z.enum([
    'bbox',
    'geojson',
    'tile',
    'coords',
    'overpass-nearby',
    'overpass-surrounding',
    'nominatim-forward',
    'nominatim-reverse',
    'osm',
  ]),
  z.templateLiteral(['wms:', z.string()]),
]);

export type SearchSource = z.infer<typeof SearchSourceSchema>;

export interface SearchResult {
  source: SearchSource;
  geojson: Feature | (FeatureCollection & { properties: GeoJsonProperties });
  id: FeatureId;
  incomplete?: true;
  /**
   * The result stands in for an element whose fetch is in flight and holds
   * nothing of it yet but its id — unlike a geocoding hit that came without an
   * outline, which has nothing more to come.
   */
  loading?: true;
  zoom?: number;
  displayName?: string;
  genericName?: string;
}

/**
 * A feature as a result holds one.
 *
 * Spread rather than used directly, because the whole-object check that comes
 * with it insists `bbox` be the exact extent of the geometry — and Nominatim
 * pads the box it answers with, so its hits would be rejected outright. Every
 * field keeps its own validation; only that check goes. What is stored is what
 * the app holds, not a re-derived idea of what it ought to hold.
 */
const StoredFeatureSchema = z.object({
  ...GeoJSONFeatureGenericSchema(
    GeoJSONPositionSchema,
    GeoJSONPropertiesSchema.nullable(),
    // A geocoding hit can come without an outline, and a result standing in for
    // a fetch has no geometry yet.
    GeoJSONGeometrySchema.nullable(),
  ).shape,
});

const SearchGeojsonSchema = z
  .union([
    StoredFeatureSchema,
    z.object({
      ...GeoJSONFeatureCollectionSchema.shape,
      features: z.array(StoredFeatureSchema),
      // An OSM way described by its member geometry carries properties of its
      // own, which a plain GeoJSON collection forbids; pasted GeoJSON is a plain
      // collection and carries none.
      properties: GeoJSONPropertiesSchema.nullable().optional(),
    }),
    // What the schema accepts is wider than the type it comes back as: the
    // GeoJSON `Feature` type doesn't spell out the null geometry a result really
    // can carry, which is what `hasGeometry` exists to ask about.
  ])
  .transform((geojson) => geojson as SearchResult['geojson']);

/**
 * A kept result as a saved map carries it, so opening the map draws what was
 * pinned instead of fetching each element again — which is what makes pinned
 * results work offline, and what keeps a result the URL can't name (a geocoding
 * hit without an OSM element, a WMS feature, plain coordinates) from being lost
 * on reload.
 *
 * `loading` is absent by construction: a result that is nothing but an id has
 * nothing to store, and would come back as a promise no reload can keep.
 */
export const SavedSearchResultSchema = z.object({
  source: SearchSourceSchema,
  id: FeatureIdSchema,
  geojson: SearchGeojsonSchema,
  incomplete: z.literal(true).optional(),
  zoom: z.number().optional(),
  displayName: z.string().optional(),
  genericName: z.string().optional(),
});

export type SavedSearchResult = z.infer<typeof SavedSearchResultSchema>;

export const searchSetQuery = createAction<{
  query: string;
  fromUrl?: boolean;
}>('SEARCH_SET_QUERY');

export const searchSetResults =
  createAction<SearchResult[]>('SEARCH_SET_RESULTS');

export const searchClear = createAction('SEARCH_CLEAR');

/**
 * Where a shown result stands:
 *
 * - `preview` — the one result the map shows because it is being looked at. It
 *   lasts only as long as it stays selected, so picking the next result (or
 *   closing its toolbar) takes it off again.
 * - `keep` — leaves a result already shown where it is, previewed or kept. A
 *   result that isn't shown yet is previewed.
 *
 * A result becomes a kept one — held until taken off, and named in the URL —
 * through `searchKeepResult`, never by being selected.
 */
export type SearchResultTier = 'preview' | 'keep';

/**
 * Shows a result on the map.
 *
 * A result already shown is replaced in place, keeping its position and its
 * tier: that is how an `incomplete` result becomes the fully loaded element.
 * `null` takes every result off.
 */
export const searchSelectResult = createAction<{
  result: SearchResult;
  focus?: boolean;
  /** Defaults to `preview`. */
  tier?: SearchResultTier;
  /**
   * Whether the result becomes the selected feature — the one the selection
   * toolbar and the details panel are about. Defaults to true; an element
   * arriving from a fetch says no, the selection having been settled when it
   * was asked for.
   */
  select?: boolean;
} | null>('SEARCH_SELECT_RESULT');

/** Takes one result off the map, leaving the rest of them shown. */
export const searchUnselectResult = createAction<FeatureId>(
  'SEARCH_UNSELECT_RESULT',
);

/**
 * The result the pointer rests on in the list, drawn on the map so it can be
 * found without being picked. It is a sight of a result and nothing else: it
 * selects nothing, loads nothing, moves the map nowhere, and stays out of the
 * URL — everything a pick does hangs off `searchSelectResult`, which this is
 * not.
 */
export const searchSetHover = createAction<SearchResult | null>(
  'SEARCH_SET_HOVER',
);

/**
 * Puts a batch of results on the map, kept — the whole of what another feature
 * has to show, handed over at once rather than as a run of picks. It says
 * nothing about the result list, and nothing about which feature is selected.
 */
export const searchKeepResults = createAction<SearchResult[]>(
  'SEARCH_KEEP_RESULTS',
);

/**
 * Lets go of the row the pointer or the focus has left — unless another row has
 * taken over since, the two of them being able to rest on different rows and
 * hand over in either order.
 */
export const searchUnsetHover = createAction<FeatureId>('SEARCH_UNSET_HOVER');

/**
 * Keeps a result that is on the map — it stops being the transient one, and
 * stays until it is taken off. Nothing hands it back: a result being looked at
 * that shouldn't stay is one to remove, which `searchUnselectResult` does.
 */
export const searchKeepResult = createAction<FeatureId>('SEARCH_KEEP_RESULT');
