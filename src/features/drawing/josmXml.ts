import { escapeXml } from '@shared/stringUtils.js';
import type { Feature, Position } from 'geojson';
import { featureOsmTags } from './osmTags.js';

function tagsXml(tags: Record<string, string>): string {
  return Object.entries(tags)
    .map(([k, v]) => `<tag k="${escapeXml(k)}" v="${escapeXml(v)}"/>`)
    .join('');
}

/**
 * A line or polygon as unsaved OSM data, for JOSM's `load_data` — which is how
 * it reaches the editor at all: nothing in the remote-control API draws a way
 * into a layer that isn't there yet.
 *
 * Negative ids mark everything as new, and the feature's own tags ride along —
 * on the relation where there is one, which is where a multipolygon carries
 * them. Holes go as that relation, a ring inside another one meaning nothing on
 * its own. `undefined` for any other geometry.
 */
export function featureToOsmXml(feature: Feature): string | undefined {
  const { geometry } = feature;

  // Rings come open, the closing node added back below.
  const parts: Position[][] | undefined =
    geometry.type === 'LineString'
      ? [geometry.coordinates]
      : geometry.type === 'Polygon'
        ? geometry.coordinates.map((ring) => ring.slice(0, -1))
        : undefined;

  if (!parts) {
    return undefined;
  }

  const closed = geometry.type === 'Polygon';

  const nodes: string[] = [];

  const ways: string[] = [];

  let nodeSeq = 0;

  let waySeq = 0;

  const addWay = (positions: Position[], tags = ''): number => {
    const refs = positions.map(([lon, lat]) => {
      const id = -++nodeSeq;

      nodes.push(`<node id="${id}" lat="${lat}" lon="${lon}"/>`);

      return id;
    });

    // A closed ring is what makes JOSM read the way as an area.
    if (closed && refs.length > 2) {
      refs.push(refs[0]!);
    }

    const id = -++waySeq;

    ways.push(
      `<way id="${id}">${refs.map((ref) => `<nd ref="${ref}"/>`).join('')}${tags}</way>`,
    );

    return id;
  };

  const tags = featureOsmTags(feature.properties);

  const [outerRing, ...holes] = parts;

  // The tags belong to the multipolygon where there is one; its outer ring is
  // then a bare way, as OSM expects.
  const outer = addWay(
    outerRing ?? [],
    holes.length === 0 ? tagsXml(tags) : '',
  );

  const inner = holes.map((hole) => addWay(hole));

  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<osm version="0.6" generator="Freemap">' +
    nodes.join('') +
    ways.join('') +
    (inner.length === 0
      ? ''
      : '<relation id="-1">' +
        `<member type="way" ref="${outer}" role="outer"/>` +
        inner
          .map((id) => `<member type="way" ref="${id}" role="inner"/>`)
          .join('') +
        tagsXml({ ...tags, type: 'multipolygon' }) +
        '</relation>') +
    '</osm>'
  );
}
