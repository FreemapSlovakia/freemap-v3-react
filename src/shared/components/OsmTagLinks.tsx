import { categoryKeys } from '@osm/osmNameResolver.js';
import { Fragment, type ReactNode } from 'react';

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

/**
 * `value` with a line-break opportunity after each URL or list separator, so a
 * long one wraps there rather than mid-word. Not inside `//`.
 */
function breakable(value: string): ReactNode {
  // No lookbehind split: Safari < 16.4 fails to parse it, breaking the bundle.
  return (value.match(/[^,;&?=_/]*(?:[,;&?=_]|\/+|$)/g) ?? [])
    .filter(Boolean)
    .flatMap((part, i) => (i ? [<wbr key={i} />, part] : [part]));
}

/** A wiki page path; a `#section` stays an anchor. */
function wikiPage(title: string): string {
  const [page, ...section] = title.replaceAll(' ', '_').split('#');

  return (
    encodeURIComponent(page) +
    (section.length ? `#${encodeURIComponent(section.join('#'))}` : '')
  );
}

const HTTP_RE = /^https?:\/\//i;

// A single number; anything else (`,`-joined numbers, `ext. 12`) stays unlinked.
const PHONE_RE = /^\+?[\d\s()./-]*\d[\d\s()./-]*$/;

/** Digits to dial, without the `(0)` trunk prefix of `+43 (0)1 …`. */
function dialable(phone: string): string {
  return phone.replace(/^(\+\d{1,3})\s*\(0\)/, '$1').replace(/[^+\d]/g, '');
}

// A URL without its scheme: a path on any host, or a network's own host alone.
const SCHEMELESS_URL_RE =
  /^([\w-]+(\.[\w-]+)+\/|(www\.|m\.)?(facebook|fb|instagram|tiktok|twitter|x|t|youtube)\.(com|me)$)/i;

/** Profile URL prefixes for a bare handle, by key name. */
const handlePrefixes: Record<string, string> = {
  facebook: 'https://www.facebook.com/',
  instagram: 'https://www.instagram.com/',
  tiktok: 'https://www.tiktok.com/@',
  twitter: 'https://x.com/',
  x: 'https://x.com/',
  telegram: 'https://t.me/',
  youtube: 'https://www.youtube.com/@',
};

function socialHref(network: string, value: string): string | undefined {
  if (SCHEMELESS_URL_RE.test(value)) {
    return `https://${value}`;
  }

  if (network === 'whatsapp') {
    return PHONE_RE.test(value)
      ? `https://wa.me/${dialable(value).replace('+', '')}`
      : undefined;
  }

  if (network === 'mastodon') {
    const m = /^@?([^@\s/]+)@([^@\s/]+)$/.exec(value);

    return m ? `https://${m[2]}/@${m[1]}` : undefined;
  }

  if (network === 'youtube' && /^UC[\w-]{22}$/.test(value)) {
    return `https://www.youtube.com/channel/${value}`;
  }

  return /^@?[\w.-]+$/.test(value)
    ? handlePrefixes[network] + encodeURIComponent(value.replace(/^@/, ''))
    : undefined;
}

const socialNetworks = new Set([
  ...Object.keys(handlePrefixes),
  'whatsapp',
  'mastodon',
]);

// Prefixed variants (`contact:`, `operator:`, `brand:`) share a last segment.
function lastSegment(tag: string): string {
  return tag.split(':').at(-1) ?? tag;
}

function hrefFor(tag: string, value: string): string | undefined {
  if (HTTP_RE.test(value)) {
    return value;
  }

  const last = lastSegment(tag);

  if (last === 'wikidata') {
    return /^Q\d+$/.test(value)
      ? `https://www.wikidata.org/entity/${value}`
      : undefined;
  }

  if (last === 'wikimedia_commons') {
    return `https://commons.wikimedia.org/wiki/${wikiPage(value)}`;
  }

  if (last === 'wikipedia' || tag.startsWith('wikipedia:')) {
    // `en:Title`, or `wikipedia:en=Title`; no language, no link.
    const m = /^([a-z][a-z-]{1,11}):(.+)$/.exec(value);

    const lang = m?.[1] ?? /^wikipedia:([a-z-]+)$/.exec(tag)?.[1];

    return lang
      ? `https://${lang}.wikipedia.org/wiki/${wikiPage(m?.[2] ?? value)}`
      : undefined;
  }

  if (last === 'email') {
    // No `?`/`&`, which would add headers such as `bcc` to the mail.
    return /^[^@\s?&,]+@[^@\s?&,]+$/.test(value)
      ? `mailto:${value}`
      : undefined;
  }

  if (last === 'phone' || last === 'mobile') {
    return PHONE_RE.test(value) ? `tel:${dialable(value)}` : undefined;
  }

  if (/(^|:)(website|url)(:|$)/.test(tag)) {
    return /^[\w-]+(\.[\w-]+)+([/?#]|$)/.test(value)
      ? `https://${value}`
      : undefined;
  }

  if (tag === 'mapillary') {
    return /^\d+$/.test(value)
      ? `https://www.mapillary.com/app/?pKey=${value}`
      : undefined;
  }

  if (socialNetworks.has(last)) {
    return socialHref(last, value);
  }

  if (categoryKeys.has(tag)) {
    return `https://wiki.openstreetmap.org/wiki/Tag:${encodeURIComponent(
      tag,
    )}=${encodeURIComponent(value)}`;
  }

  return undefined;
}

function link(href: string, text: ReactNode, key: number): ReactNode {
  const web = HTTP_RE.test(href);

  return (
    <a
      key={key}
      href={href}
      target={web ? '_blank' : undefined}
      rel={web ? 'noreferrer' : undefined}
    >
      {text}
    </a>
  );
}

/** A value split on `;`, with the separators at odd indices. */
function splitValue(tag: string, value: string): string[] {
  // A Commons title may contain `;`, and so may a URL, unless a next URL follows.
  return lastSegment(tag) === 'wikimedia_commons'
    ? [value]
    : value.split(
        HTTP_RE.test(value) ? /(\s*;\s*)(?=https?:\/\/)/i : /(\s*;\s*)/,
      );
}

/** An OSM tag's value, linked to whatever it names — a site, a phone, a wiki page. */
export function OsmTagValue({
  tag,
  value,
  osm,
}: Props & { value: string }): ReactNode {
  if (!osm) {
    return breakable(value);
  }

  const parts = splitValue(tag, value);

  const hrefs = parts.map((part, i) =>
    i % 2 || !part ? undefined : hrefFor(tag, part),
  );

  if (!hrefs.some(Boolean)) {
    return breakable(value);
  }

  return parts.flatMap((part, i) => {
    const href = hrefs[i];

    return href
      ? [link(href, breakable(part), i)]
      : i % 2
        ? [part, <wbr key={i} />]
        : [<Fragment key={i}>{breakable(part)}</Fragment>];
  });
}
