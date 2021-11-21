import { Node, OsmMapping } from './types';

type Part = { text: string; tags: Record<string, string>; case: string };

export function resolveGenericNameWithMeta(
  m: Node,
  tags: Record<string, string>,
  usedTags: Record<string, string> = {},
): Part[] {
  const parts: Part[] = [];

  for (const [k, vs] of Object.entries(tags)) {
    for (const v of vs.split(';').map((v) => v.trim())) {
      const valMapping = m[k];

      if (!valMapping) {
        continue;
      }

      if (typeof valMapping === 'string') {
        parts.push({
          text: valMapping.replace('{}', v),
          tags: { ...usedTags, [k]: v },
          case: 'a',
        });

        continue;
      }

      if (valMapping[v]) {
        const subkeyMapping = valMapping[v];

        if (typeof subkeyMapping === 'string') {
          parts.push({
            text: subkeyMapping.replace('{}', v),
            tags: { ...usedTags, [k]: v },
            case: 'b',
          });

          continue;
        }

        const res = resolveGenericNameWithMeta(subkeyMapping, tags, {
          ...usedTags,
          [k]: v,
        });

        if (res.length) {
          parts.push(
            ...res.map((item) => ({
              text: item.text.replace('{}', v),
              tags: { ...item.tags, [k]: v },
              case: item.case + 'c',
            })),
          );

          continue;
        }

        if (typeof subkeyMapping['*'] === 'string') {
          parts.push({
            text: subkeyMapping['*'].replace('{}', v),
            tags: { ...usedTags, [k]: v },
            case: 'd',
          });

          continue;
        }
      }

      if (typeof valMapping['*'] === 'string') {
        parts.push({
          text: valMapping['*'].replace('{}', v),
          tags: { ...usedTags, [k]: v },
          case: 'e',
        });

        continue;
      }
    }
  }

  return parts;
}

export function eliminateMoreGenericNames(items: Part[]): Part[] {
  const parts: Part[] = [];

  outer: for (let i = 0; i < items.length; i++) {
    for (let j = 0; j < items.length; j++) {
      if (i === j) {
        continue;
      }

      const i1 = { ...items[i].tags };
      const i2 = items[j].tags;

      for (const [k, v] of Object.entries(i2)) {
        if (i1[k] === v) {
          delete i1[k];
        }
      }

      if (Object.keys(i1).length === 0) {
        continue outer;
      }
    }

    parts.push(items[i]);
  }

  return parts;
}

export function resolveGenericName(
  m: Node,
  tags: Record<string, string>,
): string[] {
  return eliminateMoreGenericNames(
    resolveGenericNameWithMeta(m, adjustTags(tags), {}),
  ).map((part) => part.text);
}

export async function getOsmMapping(lang: string): Promise<OsmMapping> {
  return import(
    `./osmTagToNameMapping-${['sk', 'cs'].includes(lang) ? lang : 'en'}.ts`
  );
}

export async function getGenericNameFromOsmElement(
  tags: Record<string, string>,
  type: 'relation' | 'way' | 'node',
  lang: string,
): Promise<string> {
  const { osmTagToNameMapping, colorNames } = await getOsmMapping(lang);

  return getGenericNameFromOsmElementSync(
    tags,
    type,
    osmTagToNameMapping,
    colorNames,
  );
}

export function getGenericNameFromOsmElementSync(
  tags: Record<string, string>,
  type: 'relation' | 'way' | 'node',
  osmTagToNameMapping: Node,
  colorNames: Record<string, string>,
): string {
  const parts = resolveGenericName(osmTagToNameMapping, tags);

  let gn = parts.length === 0 ? undefined : parts.join('; ');

  if (type === 'relation' && tags['type'] === 'route') {
    const color =
      colorNames[
        (tags['osmc:symbol'] ?? '').replace(/:.*/, '') || (tags['colour'] ?? '')
      ] ?? '';

    gn = color + ' ' + gn;
  }

  return (
    gn ?? (process.env['NODE_ENV'] === 'production' ? '' : JSON.stringify(tags))
  );
}

export function getNameFromOsmElement(
  tags: Record<string, string>,
  lang: string,
): string {
  const langName = tags['name:' + lang];

  const name = tags['name'];

  const effName =
    name && langName && langName !== name ? langName + ` (${name})` : name;

  // TODO alt_name, loc_name, ...

  return effName ?? tags['ref'] ?? tags['operator'];
}

function adjustTags(tags: Record<string, string>) {
  let res = tags;

  if ('building' in tags) {
    const { building, ...rest } = tags;

    res = { ...rest, building };
  }

  if (
    tags['amenity'] === 'place_of_worship' &&
    tags['building'] &&
    tags['building'] !== 'yes'
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { amenity, ...rest } = tags;

    res = { ...rest };
  }

  if ('fixme' in tags) {
    const { fixme, ...rest } = tags;

    res = { ...rest, fixme };
  }

  return res;
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
