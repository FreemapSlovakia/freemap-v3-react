import { chunks } from '@shared/chunks.js';
import { createLimit } from '@shared/limit.js';
import { objectToURLSearchParams } from '@shared/stringUtils.js';
import z from 'zod';
import type { GetJson } from './article.js';

/** Shown first, in this order, when the item has them. */
const CURATED_PROPERTIES = [
  'P1082', // population
  'P2046', // area
  'P2044', // elevation
  'P2048', // height
  'P2660', // topographic prominence
  'P610', // highest point
  'P1589', // lowest point
  'P2043', // length
  'P4511', // vertical depth
  'P885', // origin of the watercourse
  'P403', // mouth of the watercourse
  'P2225', // discharge
  'P4614', // drainage basin
  'P571', // inception
  'P1619', // date of official opening
  'P576', // dissolved, abolished or demolished
  'P1435', // heritage designation
  'P84', // architect
  'P149', // architectural style
  'P140', // religion
  'P825', // dedicated to
  'P137', // operator
  'P127', // owned by
  'P1064', // track gauge
  'P930', // type of electrification
  'P814', // IUCN protected areas category
  'P856', // official website
];

const IMAGE = 'P18';

const COMMONS_CATEGORY = 'P373';

const POINT_IN_TIME = 'P585';

// Images go to the strip; identifiers and shapes mean nothing in a table.
const SHOWN_DATATYPES = new Set([
  'wikibase-item',
  'quantity',
  'time',
  'string',
  'monolingualtext',
  'url',
]);

export type WikidataValue =
  | { type: 'item'; id: string }
  | { type: 'quantity'; amount: number; unit?: string | undefined }
  | { type: 'time'; time: string; precision: number }
  | { type: 'text'; text: string; lang?: string | undefined }
  | { type: 'url'; url: string };

export interface WikidataStatement {
  value: WikidataValue;
  /** A population's census year, for example. */
  pointInTime?: WikidataValue | undefined;
}

export interface WikidataFact {
  property: string;
  statements: WikidataStatement[];
}

export interface WikidataItem {
  id: string;
  curated: WikidataFact[];
  other: WikidataFact[];
  /** Site (`skwiki`) to article title. */
  sitelinks: Record<string, string>;
  images: string[];
  commonsCategory?: string | undefined;
}

const SnakSchema = z.object({
  snaktype: z.string(),
  property: z.string(),
  datatype: z.string().optional(),
  datavalue: z.object({ value: z.unknown() }).optional(),
});

type Snak = z.infer<typeof SnakSchema>;

const StatementsSchema = z.array(
  z.object({
    mainsnak: SnakSchema,
    rank: z.string(),
    qualifiers: z.record(z.string(), z.array(SnakSchema)).optional(),
  }),
);

type Statements = z.infer<typeof StatementsSchema>;

// Claims only loosely: a big item has hundreds, most of them identifiers dropped
// unread, so each is validated only once it is known to be shown.
const EntitiesSchema = z.object({
  entities: z.record(
    z.string(),
    z.object({
      claims: z.record(z.string(), z.array(z.unknown())).optional(),
      sitelinks: z
        .record(z.string(), z.object({ title: z.string() }))
        .optional(),
    }),
  ),
});

const DatatypeSchema = z.object({
  mainsnak: z.object({ datatype: z.string().optional() }),
});

const ENTITY_URI = 'http://www.wikidata.org/entity/';

const ItemValueSchema = z.object({ id: z.string() });

const QuantitySchema = z.object({ amount: z.string(), unit: z.string() });

const TimeSchema = z.object({ time: z.string(), precision: z.number() });

const TextSchema = z.object({ text: z.string(), language: z.string() });

function toValue(snak: Snak): WikidataValue | undefined {
  if (snak.snaktype !== 'value' || !snak.datavalue) {
    return undefined;
  }

  const v = snak.datavalue.value;

  switch (snak.datatype) {
    case 'wikibase-item': {
      const p = ItemValueSchema.safeParse(v);

      return p.success ? { type: 'item', id: p.data.id } : undefined;
    }

    case 'quantity': {
      const p = QuantitySchema.safeParse(v);

      return p.success
        ? {
            type: 'quantity',
            amount: Number(p.data.amount),
            unit: p.data.unit.startsWith(ENTITY_URI)
              ? p.data.unit.slice(ENTITY_URI.length)
              : undefined,
          }
        : undefined;
    }

    case 'time': {
      const p = TimeSchema.safeParse(v);

      return p.success ? { type: 'time', ...p.data } : undefined;
    }

    case 'monolingualtext': {
      const p = TextSchema.safeParse(v);

      return p.success
        ? { type: 'text', text: p.data.text, lang: p.data.language }
        : undefined;
    }

    case 'string':
      return typeof v === 'string' ? { type: 'text', text: v } : undefined;

    case 'url':
      return typeof v === 'string' ? { type: 'url', url: v } : undefined;

    default:
      return undefined;
  }
}

/** A `Q…` id, or `<site>:<title>` naming the item by its article (`skwiki:Plešivec`). */
export function isWikidataRef(ref: string): boolean {
  return /^Q\d+$/.test(ref) || /^[a-z_]+wiki:./.test(ref);
}

export async function fetchWikidataItem(
  get: GetJson,
  ref: string,
  language: string,
): Promise<WikidataItem> {
  const p = ref.indexOf(':');

  const data = EntitiesSchema.parse(
    await get(
      'https://www.wikidata.org/w/api.php?' +
        objectToURLSearchParams({
          origin: '*',
          action: 'wbgetentities',
          format: 'json',
          props: 'claims|sitelinks',
          // The only articles read: the reader's, else the English one.
          sitefilter: `${language}wiki|enwiki`,
          ...(p === -1
            ? { ids: ref }
            : {
                sites: ref.slice(0, p),
                titles: ref.slice(p + 1),
                normalize: '1',
              }),
        }),
    ),
  );

  // An article without an item is keyed `-1`.
  const [id, entity] = Object.entries(data.entities)[0] ?? [];

  if (!id || !/^Q\d+$/.test(id)) {
    throw new Error(`No Wikidata item for ${ref}`);
  }

  const claims = entity?.claims ?? {};

  const statementsOf = (property: string): Statements => {
    const parsed = StatementsSchema.safeParse(claims[property] ?? []);

    return parsed.success ? parsed.data : [];
  };

  const facts = new Map<string, WikidataFact>();

  const strings = (property: string) =>
    statementsOf(property).flatMap((c) =>
      c.rank !== 'deprecated' && typeof c.mainsnak.datavalue?.value === 'string'
        ? [c.mainsnak.datavalue.value]
        : [],
    );

  for (const [property, raw] of Object.entries(claims)) {
    const datatype = DatatypeSchema.safeParse(raw[0]).data?.mainsnak.datatype;

    if (!SHOWN_DATATYPES.has(datatype ?? '') || property === COMMONS_CATEGORY) {
      continue;
    }

    const all = statementsOf(property);

    // The preferred statements where some are, as Wikidata's own "best".
    const preferred = all.filter((c) => c.rank === 'preferred');

    const best = preferred.length
      ? preferred
      : all.filter((c) => c.rank === 'normal');

    let statements = best.flatMap((c): WikidataStatement[] => {
      const value = toValue(c.mainsnak);

      const time = c.qualifiers?.[POINT_IN_TIME]?.[0];

      return value
        ? [{ value, pointInTime: time ? toValue(time) : undefined }]
        : [];
    });

    // A name in many languages: the reader's, where it is among them.
    const own = statements.filter(
      (s) => s.value.type === 'text' && s.value.lang === language,
    );

    if (own.length) {
      statements = own;
    }

    // A history of counts without a preferred one: its latest.
    const dated = statements.filter((s) => s.pointInTime?.type === 'time');

    if (dated.length > 1 && dated.length === statements.length) {
      const time = (s: WikidataStatement) =>
        s.pointInTime?.type === 'time' ? s.pointInTime.time : '';

      statements = [
        dated.reduce((a, b) => (time(b).localeCompare(time(a)) > 0 ? b : a)),
      ];
    }

    if (statements.length) {
      facts.set(property, { property, statements });
    }
  }

  const curated = CURATED_PROPERTIES.flatMap((p) => facts.get(p) ?? []);

  return {
    id,
    curated,
    other: [...facts.values()].filter((f) => !curated.includes(f)),
    sitelinks: Object.fromEntries(
      Object.entries(entity?.sitelinks ?? {}).map(([site, { title }]) => [
        site,
        title,
      ]),
    ),
    images: strings(IMAGE),
    commonsCategory: strings(COMMONS_CATEGORY)[0],
  };
}

/** The items and properties the facts refer to. */
export function referencedIds(facts: WikidataFact[]): string[] {
  const ids = new Set<string>();

  for (const { property, statements } of facts) {
    ids.add(property);

    for (const { value } of statements) {
      if (value.type === 'item') {
        ids.add(value.id);
      } else if (value.type === 'quantity' && value.unit) {
        ids.add(value.unit);
      }
    }
  }

  return [...ids];
}

const LabelsSchema = z.object({
  entities: z.record(
    z.string(),
    z.object({
      labels: z.record(z.string(), z.object({ value: z.string() })).optional(),
    }),
  ),
});

/** Labels in `language`, or Wikidata's fallback for it. */
export async function fetchLabels(
  get: GetJson,
  ids: string[],
  language: string,
): Promise<Record<string, string>> {
  // A city's "Show more" refers to hundreds; Wikidata throttles a burst.
  const limit = createLimit(2);

  const results = await Promise.all(
    chunks(ids, 50).map((chunk) =>
      limit(async () =>
        LabelsSchema.parse(
          await get(
            'https://www.wikidata.org/w/api.php?' +
              objectToURLSearchParams({
                origin: '*',
                action: 'wbgetentities',
                format: 'json',
                ids: chunk.join('|'),
                props: 'labels',
                languages: language,
                languagefallback: '1',
              }),
          ),
        ),
      ),
    ),
  );

  const labels: Record<string, string> = {};

  for (const { entities } of results) {
    for (const [id, { labels: l }] of Object.entries(entities)) {
      const label = l?.[language]?.value ?? Object.values(l ?? {})[0]?.value;

      if (label) {
        labels[id] = label;
      }
    }
  }

  return labels;
}
