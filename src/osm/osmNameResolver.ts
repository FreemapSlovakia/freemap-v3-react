import { Node } from './types';

function resolveGenericName(
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
  const name = tags['name'];

  const ref = tags['ref'];

  const operator = tags['operator'];

  const { osmTagToNameMapping, colorNames } = (await import(
    `./osmTagToNameMapping-${['sk', 'cs'].includes(lang) ? lang : 'en'}.ts`
  )) as { osmTagToNameMapping: Node; colorNames: Record<string, string> };

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
    name ?? ref ?? operator,
  ];
}
