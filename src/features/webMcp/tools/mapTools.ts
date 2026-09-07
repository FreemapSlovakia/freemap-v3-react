import type { RootState } from '@app/store/store.js';
import { getMessages } from '@features/l10n/messagesStore.js';
import {
  mapFitBbox,
  mapRefocus,
  mapToggleLayer,
} from '@features/map/model/actions.js';
import { integratedLayerDefs } from '@shared/mapDefinitions.js';
import z from 'zod';
import { defineTool } from '../tool.js';

const LatSchema = z.number().min(-90).max(90).describe('WGS-84 latitude');

const LonSchema = z.number().min(-180).max(180).describe('WGS-84 longitude');

/** Every layer code the map knows about, integrated and user-added alike. */
function layerCatalog(state: RootState) {
  const m = getMessages();

  return [
    ...integratedLayerDefs.map((def) => ({
      code: def.type,
      name: m?.mapLayers.letters[def.type] ?? def.type,
      kind: def.layer,
      minZoom: def.minZoom,
      premiumFromZoom: def.premiumFromZoom,
      countries: def.countries,
      experimental: def.experimental,
    })),
    ...state.map.customLayers.map((def) => ({
      code: def.type,
      name: def.name ?? def.type,
      kind: def.layer,
      minZoom: def.minZoom,
      custom: true as const,
    })),
    // Offline maps are layers like any other, and `mapToggleLayer` resolves
    // base types from them too.
    ...state.map.cachedMaps.map((def) => ({
      code: def.type,
      name: def.name ?? def.type,
      kind: def.layer,
      cached: true as const,
    })),
  ];
}

function assertLayerOfKind(
  state: RootState,
  code: string,
  kind: 'base' | 'overlay',
) {
  const layer = layerCatalog(state).find(
    (candidate) => candidate.code === code,
  );

  if (!layer) {
    throw new Error(
      `Unknown map layer "${code}". Call list-map-layers for the codes.`,
    );
  }

  // The map reducer decides base or overlay by the code itself, so a base code
  // named as an overlay would switch the base map instead.
  if (layer.kind !== kind) {
    const name = (of: string) => (of === 'base' ? 'a base map' : 'an overlay');

    throw new Error(
      `Map layer "${code}" is ${name(layer.kind)}, not ${name(kind)}.`,
    );
  }
}

export const mapTools = [
  defineTool({
    name: 'get-map-view',
    description:
      'Returns what the map currently shows: its centre, zoom, visible bounding box, the layers that are on, and the shareable URL of this exact state.',
    input: z.object({}),
    execute(_args, { store }) {
      const { map } = store.getState();

      return {
        center: { lat: map.lat, lon: map.lon },
        zoom: map.zoom,
        bounds: map.bounds && {
          west: map.bounds[0],
          south: map.bounds[1],
          east: map.bounds[2],
          north: map.bounds[3],
        },
        layers: map.layers,
        countries: map.countries,
        url: window.location.href,
      };
    },
  }),

  defineTool({
    name: 'set-map-view',
    description:
      'Moves the map. Give a centre, a zoom (0 = whole world, 19 = a building), or both.',
    input: z.object({
      lat: LatSchema.optional(),
      lon: LonSchema.optional(),
      zoom: z.number().min(0).max(20).optional(),
    }),
    execute({ lat, lon, zoom }, { store }) {
      if (lat === undefined && lon === undefined && zoom === undefined) {
        throw new Error('Give at least one of lat, lon, zoom.');
      }

      if ((lat === undefined) !== (lon === undefined)) {
        throw new Error('lat and lon go together.');
      }

      store.dispatch(mapRefocus({ lat, lon, zoom }));

      const { map } = store.getState();

      return { center: { lat: map.lat, lon: map.lon }, zoom: map.zoom };
    },
  }),

  defineTool({
    name: 'fit-map-to-area',
    description:
      'Zooms the map so that the given bounding box fits the screen — the way to show a whole region, town or route extent.',
    input: z.object({
      west: LonSchema,
      south: LatSchema,
      east: LonSchema,
      north: LatSchema,
    }),
    execute({ west, south, east, north }, { store }) {
      store.dispatch(mapFitBbox({ bbox: [west, south, east, north] }));
    },
  }),

  defineTool({
    name: 'list-map-layers',
    description:
      'Lists the map layers this app offers, with the one-letter code each is switched on by. A "base" layer is the map itself (only one at a time); an "overlay" is drawn on top of it (any number). premiumFromZoom marks a layer that needs a paid account past that zoom.',
    input: z.object({}),
    execute(_args, { store }) {
      return layerCatalog(store.getState());
    },
  }),

  defineTool({
    name: 'set-map-layers',
    description:
      'Switches map layers on and off by their code (see list-map-layers). Naming overlays replaces the set that is on; leaving them out keeps it.',
    input: z.object({
      base: z.string().optional().describe('Code of the base map to show.'),
      overlays: z
        .array(z.string())
        .optional()
        .describe('Codes of the overlays to leave on; [] takes them all off.'),
    }),
    execute({ base, overlays }, { store }) {
      const state = store.getState();

      // Everything is checked before anything is switched, so a bad overlay
      // code doesn't leave the base map already changed behind a thrown error.
      if (base !== undefined) {
        assertLayerOfKind(state, base, 'base');
      }

      for (const code of overlays ?? []) {
        assertLayerOfKind(state, code, 'overlay');
      }

      if (base !== undefined) {
        store.dispatch(mapToggleLayer({ type: base, enable: true }));
      }

      if (overlays) {
        const wanted = new Set(overlays);

        const isOverlay = new Set(
          layerCatalog(state)
            .filter((layer) => layer.kind === 'overlay')
            .map((layer) => layer.code),
        );

        for (const code of store.getState().map.layers) {
          if (isOverlay.has(code) && !wanted.has(code)) {
            store.dispatch(mapToggleLayer({ type: code, enable: false }));
          }
        }

        for (const code of overlays) {
          store.dispatch(mapToggleLayer({ type: code, enable: true }));
        }
      }

      return { layers: store.getState().map.layers };
    },
  }),
];
