import { categoryKeys } from '@osm/osmNameResolver.js';
import type { ReactNode } from 'react';

type Props = {
  tag: string;
  /** Whether the tag is an OSM one, and so worth linking to what documents it. */
  osm?: boolean;
};

/** An OSM tag's key, linked to the wiki page that documents it. */
export function OsmTagKey({ tag, osm }: Props): ReactNode {
  return !osm ? (
    tag
  ) : (
    <a
      target="_blank"
      rel="noreferrer"
      href={`https://wiki.openstreetmap.org/wiki/Key:${encodeURIComponent(tag)}`}
    >
      {tag}
    </a>
  );
}

/** An OSM tag's value, linked to whatever it names — a site, a phone, a wiki page. */
export function OsmTagValue({
  tag,
  value,
  osm,
}: Props & { value: string }): ReactNode {
  return !osm ? (
    value
  ) : /^https?:\/\//.test(value) ? (
    <a target="_blank" rel="noreferrer" href={value}>
      {value}
    </a>
  ) : tag === 'wikidata' || tag.endsWith(':wikidata') ? (
    <a
      target="_blank"
      rel="noreferrer"
      href={`https://www.wikidata.org/entity/${encodeURIComponent(value)}`}
    >
      {value}
    </a>
  ) : tag === 'wikipedia' ||
    tag.endsWith(':wikipedia') ||
    tag === 'wikimedia_commons' ? (
    <a
      target="_blank"
      rel="noreferrer"
      href={`https://sk.wikipedia.org/wiki/${encodeURIComponent(
        value.replace(/ /g, '_'),
      )}`}
    >
      {value}
    </a>
  ) : ['contact:email', 'email'].includes(tag) ? (
    <a href={`mailto:${value}`}>{value}</a>
  ) : ['phone', 'contact:phone', 'contact:mobile'].includes(tag) ? (
    <a target="_blank" rel="noreferrer" href={`tel:${value.replace(/ /g, '')}`}>
      {value}
    </a>
  ) : categoryKeys.has(tag) ? (
    <a
      target="_blank"
      rel="noreferrer"
      href={`https://wiki.openstreetmap.org/wiki/Tag:${encodeURIComponent(
        tag,
      )}=${encodeURIComponent(value)}`}
    >
      {value}
    </a>
  ) : (
    value
  );
}
