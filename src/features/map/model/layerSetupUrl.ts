import {
  parseShading,
  serializeShading,
} from '@features/parameterizedShading/model/Shading.js';
import Color from 'color';
import { isEmptySetup, type LayerSetup } from './layerSetup.js';
import { type MapPreset, presetLayers } from './mapPreset.js';

/**
 * A layer's setup in a link, under `l.<type>`: fields separated by `;`, each a
 * one-letter key and its value — `k` kind (`b`/`o`), `o` opacity in %, `w` WMS
 * layers (each URI-encoded, `,`-separated), `s` shading (its own encoding,
 * free of `;`), `c` colour (`rrggbbaa`).
 */
export const SETUP_PARAM_PREFIX = 'l.';

export function serializeSetup(setup: LayerSetup): string {
  const parts: string[] = [];

  if (setup.kind) {
    parts.push(`k${setup.kind === 'base' ? 'b' : 'o'}`);
  }

  if (setup.opacity !== undefined) {
    parts.push(`o${Math.round(setup.opacity * 100)}`);
  }

  if (setup.wmsLayers) {
    parts.push(`w${setup.wmsLayers.map(encodeURIComponent).join(',')}`);
  }

  if (setup.shading) {
    parts.push(`s${serializeShading(setup.shading)}`);
  }

  if (setup.color) {
    parts.push(`c${Color(setup.color).hexa().slice(1)}`);
  }

  return parts.join(';');
}

/** What a link says of a layer's setup; a field it can't read is left out. */
export function parseSetup(value: string): LayerSetup {
  const setup: LayerSetup = {};

  for (const part of value.split(';')) {
    const key = part.charAt(0);

    const rest = part.slice(1);

    try {
      switch (key) {
        case 'k':
          if (rest === 'b' || rest === 'o') {
            setup.kind = rest === 'b' ? 'base' : 'overlay';
          }

          break;
        case 'o': {
          const percent = Number(rest);

          if (rest !== '' && percent >= 0 && percent <= 100) {
            setup.opacity = percent / 100;
          }

          break;
        }
        case 'w':
          setup.wmsLayers = rest
            ? rest.split(',').map((name) => decodeURIComponent(name))
            : [];

          break;
        case 's':
          setup.shading = parseShading(rest);

          break;
        case 'c': {
          const [r = 0, g = 0, b = 0, a = 1] = Color(`#${rest}`).array();

          setup.color = [r, g, b, a];

          break;
        }
      }
    } catch {
      // A malformed field is dropped; the rest of the setup stands.
    }
  }

  return setup;
}

/** Where a link carries preset `n` of its `layers=` (`@<n>`). */
export const PRESET_PARAM_PREFIX = 'p.';

/**
 * A preset in a link: `p.<n>` its maps bottom first, `~`-joined; `p.<n>.n`
 * its name, `.i` its icon, `.o` its opacity in %, `.l.<id>` each layer's setup.
 */
export function presetUrlParts(
  preset: MapPreset,
  n: string,
): [string, string][] {
  const key = `${PRESET_PARAM_PREFIX}${n}`;

  const parts: [string, string][] = [
    [key, preset.layers.map((layer) => layer.type).join('~')],
    [`${key}.n`, preset.name],
  ];

  if (preset.iconSpec) {
    parts.push([`${key}.i`, preset.iconSpec]);
  }

  if (preset.opacity !== undefined) {
    parts.push([`${key}.o`, String(Math.round(preset.opacity * 100))]);
  }

  for (const { type, setup } of preset.layers) {
    if (!isEmptySetup(setup)) {
      parts.push([
        `${key}.${SETUP_PARAM_PREFIX}${type}`,
        serializeSetup(setup),
      ]);
    }
  }

  return parts;
}

/** Whether a link would carry two presets alike, so one can stand for the other. */
export const sameInLink = (a: MapPreset, b: MapPreset) =>
  JSON.stringify(presetUrlParts(a, '')) ===
  JSON.stringify(presetUrlParts(b, ''));

/** Preset `n` as a link carries it, if it does. */
export function parsePresetParams(
  query: Readonly<Record<string, string | string[]>>,
  n: string,
): MapPreset | undefined {
  const key = `${PRESET_PARAM_PREFIX}${n}`;

  const types = query[key];

  if (typeof types !== 'string') {
    return undefined;
  }

  const one = (name: string) => {
    const value = query[name];

    return typeof value === 'string' ? value : undefined;
  };

  const percent = Number(one(`${key}.o`));

  const preset: MapPreset = {
    id: n,
    name: one(`${key}.n`) ?? '',
    layers: [...new Set(types.split('~').filter(Boolean))].map((type) => {
      const setup = one(`${key}.${SETUP_PARAM_PREFIX}${type}`);

      return { type, setup: setup === undefined ? {} : parseSetup(setup) };
    }),
  };

  const iconSpec = one(`${key}.i`);

  if (iconSpec) {
    preset.iconSpec = iconSpec;
  }

  if (one(`${key}.o`) !== undefined && percent >= 0 && percent <= 100) {
    preset.opacity = percent / 100;
  }

  return { ...preset, layers: presetLayers(preset) };
}
