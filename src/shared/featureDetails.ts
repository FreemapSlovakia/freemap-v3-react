/** The GPX `<link>`, as the reader keeps it. */
export type DetailLink = { href: string; text: string; type?: unknown };

/**
 * What GPX says of a track, a route or a waypoint besides its geometry, as
 * typed. Each kind uses its own keys (`LINE_DETAIL_KEYS`, `POINT_DETAIL_KEYS`);
 * `ele` is a point's elevation, which lives in its coordinate, not its
 * properties. `links` is kept for a plain line too, as the table cannot show it.
 */
export type FeatureDetails = {
  desc: string;
  cmt: string;
  type: string;
  src: string;
  number: string;
  time: string;
  ele: string;
  links: DetailLink[];
};

/** A track's or a route's details shown as named fields, not as table rows. */
export const LINE_DETAIL_KEYS = [
  'desc',
  'cmt',
  'type',
  'src',
  'number',
] as const;

/** A waypoint's; its elevation is the coordinate's, kept apart. */
export const POINT_DETAIL_KEYS = [
  'desc',
  'cmt',
  'type',
  'src',
  'time',
] as const;

export type DetailKey =
  | (typeof LINE_DETAIL_KEYS)[number]
  | (typeof POINT_DETAIL_KEYS)[number];

export type DetailKind = 'line' | 'point';

export const detailKeysOf = (kind: DetailKind): readonly DetailKey[] =>
  kind === 'point' ? POINT_DETAIL_KEYS : LINE_DETAIL_KEYS;

export const isDetailKey = (key: string, kind: DetailKind): key is DetailKey =>
  (detailKeysOf(kind) as readonly string[]).includes(key);

/** No details at all: every field empty, no links. */
export const emptyDetails = (): FeatureDetails => ({
  desc: '',
  cmt: '',
  type: '',
  src: '',
  number: '',
  time: '',
  ele: '',
  links: [],
});

/** GPX `<number>` is a non-negative integer; empty means none. */
export const isValidDetailNumber = (text: string): boolean =>
  /^\d*$/.test(text.trim());

/** An elevation in metres; empty means none. */
export const isValidDetailEle = (text: string): boolean =>
  text.trim() === '' || Number.isFinite(Number(text.trim().replace(',', '.')));
