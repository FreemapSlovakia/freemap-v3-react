import { SHADING_SOURCE } from '@shared/mapDefinitions.js';
import { mapIndexById } from '@shared/mapLibrary/mapIndex.js';
import { presetItem } from './mapPreset.js';

type Raw = Record<string, unknown>;

const isRecord = (value: unknown): value is Raw =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

// The built-in maps a custom map of this technology now is a setup of.
const SETUP_OF: Record<string, { type: string; field: string; name: string }> =
  {
    parametricShading: {
      type: SHADING_SOURCE,
      field: 'shading',
      name: 'Terrain shading',
    },
    color: { type: 'c', field: 'color', name: 'Solid colour' },
  };

/**
 * Map settings as saved before layer setups and presets, account's or local:
 * a map's opacity in `layersSettings` moves to its setup, and a custom shading
 * or colour map becomes a preset of the built-in map so set up, under the
 * custom map's id so its toolbar, menu and shortcut settings carry over.
 */
export function upgradeLegacyMapSettings(raw: unknown): unknown {
  if (!isRecord(raw)) {
    return raw;
  }

  const layerSetups: Raw = isRecord(raw['layerSetups'])
    ? { ...raw['layerSetups'] }
    : {};

  if (isRecord(raw['layersSettings'])) {
    for (const [type, settings] of Object.entries(raw['layersSettings'])) {
      const setup = isRecord(layerSetups[type]) ? layerSetups[type] : {};

      if (
        isRecord(settings) &&
        typeof settings['opacity'] === 'number' &&
        setup['opacity'] === undefined
      ) {
        layerSetups[type] = { ...setup, opacity: settings['opacity'] };
      }
    }
  }

  const customLayers = Array.isArray(raw['customLayers'])
    ? raw['customLayers']
    : [];

  const presets: unknown[] = Array.isArray(raw['presets'])
    ? [...raw['presets']]
    : [];

  const converted = new Set<string>();

  for (const def of customLayers) {
    const to = isRecord(def) && SETUP_OF[String(def['technology'])];

    if (!to || typeof def['type'] !== 'string' || def[to.field] === undefined) {
      continue;
    }

    const { type } = def;

    const kind = def['layer'];

    const opacity = isRecord(layerSetups[type])
      ? layerSetups[type]['opacity']
      : undefined;

    delete layerSetups[type];

    presets.push({
      id: type,
      name:
        typeof def['name'] === 'string' && def['name'] ? def['name'] : to.name,
      iconSpec: def['iconSpec'],
      opacity,
      layers: [
        {
          type: to.type,
          setup: {
            [to.field]: def[to.field],
            // Only a switch from the built-in map's own kind.
            kind: kind === mapIndexById[to.type]?.layer ? undefined : kind,
          },
        },
      ],
    });

    converted.add(type);
  }

  if (!converted.size) {
    return { ...raw, layerSetups };
  }

  return {
    ...raw,
    layerSetups,
    customLayers: customLayers.filter(
      (def) => !(isRecord(def) && converted.has(def['type'] as string)),
    ),
    presets,
    // Only the local state has the stack.
    ...(Array.isArray(raw['layers']) && {
      layers: raw['layers'].map((item) =>
        typeof item === 'string' && converted.has(item)
          ? presetItem(item)
          : item,
      ),
    }),
  };
}
