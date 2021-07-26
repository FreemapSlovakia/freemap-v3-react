import { Node } from './types';

export function resolveGenericName(
  m: Node,
  tags: Record<string, string>,
): string | undefined {
  const parts = [];

  for (const [k, v] of Object.entries(tags)) {
    const valMapping = m[k];

    if (!valMapping) {
      continue;
    }

    if (typeof valMapping === 'string') {
      parts.push(valMapping.replace('{}', v));
      continue;
    }

    if (valMapping[v]) {
      const subkeyMapping = valMapping[v];

      if (typeof subkeyMapping === 'string') {
        parts.push(subkeyMapping.replace('{}', v));
        continue;
      }

      const res = resolveGenericName(subkeyMapping, tags);

      if (res) {
        parts.push(res.replace('{}', v));
        continue;
      }

      if (typeof subkeyMapping['*'] === 'string') {
        parts.push(subkeyMapping['*'].replace('{}', v));
        continue;
      }
    }

    if (typeof valMapping['*'] === 'string') {
      parts.push(valMapping['*'].replace('{}', v));
      continue;
    }
  }

  return parts.length === 0 ? undefined : parts.join('; ');
}

export async function getNameFromOsmElement(
  tags: Record<string, string>,
  type: 'relation' | 'way' | 'node',
  lang: string,
): Promise<[subject: string, name: string]> {
  const { osmTagToNameMapping, colorNames } = (await import(
    `./osmTagToNameMapping-${['sk', 'cs'].includes(lang) ? lang : 'en'}.ts`
  )) as { osmTagToNameMapping: Node; colorNames: Record<string, string> };

  return getNameFromOsmElementSync(
    tags,
    type,
    lang,
    osmTagToNameMapping,
    colorNames,
  );
}

export function getNameFromOsmElementSync(
  tags: Record<string, string>,
  type: 'relation' | 'way' | 'node',
  lang: string,
  osmTagToNameMapping: Node,
  colorNames: Record<string, string>,
): [subject: string, name: string] {
  const langName = tags['name:' + lang];

  const name = tags['name'];

  const effName =
    name && langName && langName !== name ? langName + ` (${name})` : name;

  // TODO alt_name, loc_name, ...

  const ref = tags['ref'];

  const operator = tags['operator'];

  let subj: string | undefined = resolveGenericName(osmTagToNameMapping, tags);

  if (type === 'relation' && tags['type'] === 'route') {
    const color =
      colorNames[
        (tags['osmc:symbol'] ?? '').replace(/:.*/, '') || (tags['colour'] ?? '')
      ] ?? '';

    subj = color + ' ' + subj;
  }

  return [
    subj ??
      (process.env['NODE_ENV'] === 'production' ? '' : JSON.stringify(tags)),
    effName ?? ref ?? operator,
  ];
}

// TODO add others
export const categoryKeys = new Set([
  'admin_level',
  'amenity',
  'barrier',
  'boundary',
  'building',
  'bus',
  'cusine',
  'highway',
  'historic',
  'information',
  'landuse',
  'leaf_type',
  'leisure',
  'man_made',
  'natural',
  'network',
  'office',
  'public_transport',
  'railway',
  'route',
  'service',
  'shelter',
  'shop',
  'sport',
  'tactile_paving',
  'tourism',
  'type',
  'vending',
  'wall',
  'water',
  'waterway',
]);
