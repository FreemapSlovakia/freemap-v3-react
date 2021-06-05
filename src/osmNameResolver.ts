import { colorNames, Node, osmTagToNameMapping } from 'fm3/osmTagToNameMapping';

const typeSymbol = {
  way: '─',
  node: '•',
  relation: '▦',
};

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

export function getName(
  {
    tags,
    type,
  }: {
    tags?: Record<string, string>;
    type: 'relation' | 'way' | 'node';
  },
  addTypeSymbol = true,
): string {
  if (!tags) {
    return '???';
  }

  const name = tags['name'];

  const ref = tags['ref'];

  const operator = tags['operator'];

  let subj: string | undefined = resolveGenericName(osmTagToNameMapping, tags);

  if (type === 'relation' && tags['type'] === 'route') {
    const color =
      colorNames[
        (tags['osmc:symbol'] ?? '').replace(/:.*/, '') || (tags['color'] ?? '')
      ] ?? '';

    subj = color + ' ' + subj;
  }

  return (
    (addTypeSymbol ? typeSymbol[type] : '') +
    ' ' +
    ((subj ?? '???') + ' "' + (name ?? ref ?? operator ?? '') + '"')
  )
    .replace(/""/g, '')
    .trim();
}
