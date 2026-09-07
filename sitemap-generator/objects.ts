import { writeFile } from 'node:fs/promises';
import htm from 'htm';
import vhtml from 'vhtml';
import {
  categoryKeys,
  getGenericNameFromOsmElementSync,
  getNameFromOsmElement,
  getOsmMapping,
} from '../src/osm/osmNameResolver.js';
import {
  closeOsmDb,
  fetchArea,
  fetchRefs,
  type OsmFilter,
  streamFeatures,
} from './osmDb.js';
import {
  appUrl,
  BASE_EU,
  expandNames,
  fileName,
  type Lang,
  langBase,
  siteName,
} from './seo.js';

const html = htm.bind(vhtml);

type Tags = Record<string, string>;

/**
 * A country whose OSM features get per-feature prerender pages, in that
 * country's most-prominent language. Slovakia keeps the full category set;
 * other countries get the outdoor-only subset (the map's core value) to keep
 * page volume, query cost and crawl budget sane. The page's home domain
 * follows the language via {@link langBase} (sk/cs → freemap.sk, else eu).
 */
interface Country {
  name: string;
  lang: Lang;
  /** The country's OSM boundary relation, which features are clipped to. */
  boundary: number;
  full: boolean;
}

const COUNTRIES: Country[] = [
  { name: 'Slovakia', lang: 'sk', boundary: 14296, full: true },
  { name: 'Czechia', lang: 'cs', boundary: 51684, full: false },
  { name: 'Hungary', lang: 'hu', boundary: 21335, full: false },
  { name: 'Poland', lang: 'pl', boundary: 49715, full: false },
  { name: 'Italy', lang: 'it', boundary: 365331, full: false },
];

const ROUTE_CATEGORIES: Record<string, OsmFilter> = {
  'hiking-routes': {
    type: 'relation',
    all: ['type=route'],
    any: ['route=hiking', 'route=foot'],
  },
  'bicycle-routes': { type: 'relation', all: ['type=route', 'route=bicycle'] },
  'ski-routes': {
    type: 'relation',
    all: ['type=route'],
    any: ['route=ski', 'route=piste'],
  },
};

/**
 * High-value point landmarks. The unrestricted `natural=*` set runs to hundreds
 * of thousands of named woods and water polygons per large country — thin
 * content, and more pages than the crawl budget is worth.
 */
const NATURAL_LANDMARKS = [
  'peak',
  'volcano',
  'saddle',
  'ridge',
  'arete',
  'spring',
  'hot_spring',
  'geyser',
  'cave_entrance',
  'cliff',
  'arch',
  'glacier',
].map((value) => `natural=${value}`);

/** Outdoor-only categories, for every country but Slovakia. */
const OUTDOOR_CATEGORIES: Record<string, OsmFilter> = {
  ...ROUTE_CATEGORIES,
  'natural-features': { any: NATURAL_LANDMARKS, has: ['name'] },
  'protected-areas': { all: ['boundary=protected_area'], has: ['name'] },
  huts: {
    any: ['tourism=alpine_hut', 'tourism=wilderness_hut'],
    has: ['name'],
  },
};

/** The full Slovak set: routes plus all named settlement/amenity/natural data. */
const FULL_CATEGORIES: Record<string, OsmFilter> = {
  ...ROUTE_CATEGORIES,
  'admin-boundaies': { type: 'relation', all: ['boundary=administrative'] },
  amenities: { all: ['amenity'], has: ['name'] },
  buildings: { all: ['building'], has: ['name'] },
  'geomorfological-units': {
    type: 'relation',
    all: ['boundary=geomorphological-unit'],
  },
  landuses: { all: ['landuse'], has: ['name'] },
  leisures: { all: ['leisure'], has: ['name'] },
  naturals: { all: ['natural'], has: ['name'] },
  man_made: { all: ['man_made'], has: ['name'] },
  'protected-areas': { all: ['boundary=protected_area'], has: ['name'] },
  shops: { all: ['shop'], has: ['name'] },
};

/**
 * Per-language page copy. Only the languages of the generated {@link COUNTRIES}
 * need an entry. These are hand-translated; the Slavic and Italian wordings
 * warrant a native review before leaning on them for ranking.
 */
interface Copy {
  /** Portal name for the breadcrumb; `{site}` expands per the page's domain. */
  siteName: string;
  showOnMap: string;
  onMap: string;
  contact: string;
  openingHours: string;
  intro: string;
  openOsm: string;
  history: string;
}

const COPY: Partial<Record<Lang, Copy>> = {
  sk: {
    siteName: '{site} – mapa',
    showOnMap: 'Zobraziť na mape',
    onMap: 'na detailnej outdoorovej mape.',
    contact: 'Kontakt.',
    openingHours: 'Otváracie hodiny.',
    intro:
      'Turistika, cyklistika, bežky. Online detailná turistická mapa, cyklistická mapa, cyklomapa, jazdecká mapa, bežkárska/lyžiarska mapa, letecká mapa.',
    openOsm: 'Otvoriť na OpenStreetMap.org',
    history: 'história',
  },
  cs: {
    siteName: '{site} – mapa',
    showOnMap: 'Zobrazit na mapě',
    onMap: 'na podrobné outdoorové mapě.',
    contact: 'Kontakt.',
    openingHours: 'Otevírací doba.',
    intro:
      'Turistika, cyklistika, běžky. Online podrobná turistická mapa, cyklistická mapa, cyklomapa, jezdecká mapa, běžkařská/lyžařská mapa, letecká mapa.',
    openOsm: 'Otevřít na OpenStreetMap.org',
    history: 'historie',
  },
  hu: {
    siteName: '{site} – térkép',
    showOnMap: 'Megjelenítés a térképen',
    onMap: 'a részletes túratérképen.',
    contact: 'Kapcsolat.',
    openingHours: 'Nyitvatartás.',
    intro:
      'Túrázás, kerékpározás, sífutás. Online részletes turistatérkép, kerékpáros térkép, lovas térkép, sífutó- és síterkép, légifelvétel-térkép.',
    openOsm: 'Megnyitás az OpenStreetMap.org-on',
    history: 'előzmények',
  },
  pl: {
    siteName: '{site} – mapa',
    showOnMap: 'Pokaż na mapie',
    onMap: 'na szczegółowej mapie outdoorowej.',
    contact: 'Kontakt.',
    openingHours: 'Godziny otwarcia.',
    intro:
      'Turystyka piesza, rowerowa, narciarstwo biegowe. Szczegółowa mapa turystyczna online, mapa rowerowa, mapa konna, mapa narciarska/biegowa, mapa lotnicza.',
    openOsm: 'Otwórz na OpenStreetMap.org',
    history: 'historia',
  },
  it: {
    siteName: '{site} – mappa',
    showOnMap: 'Mostra sulla mappa',
    onMap: 'sulla mappa outdoor dettagliata.',
    contact: 'Contatti.',
    openingHours: 'Orari di apertura.',
    intro:
      "Escursionismo, ciclismo, sci di fondo. Mappa escursionistica dettagliata online, mappa ciclabile, mappa per l'equitazione, mappa per sci di fondo e sci alpino, mappa aerea.",
    openOsm: 'Apri su OpenStreetMap.org',
    history: 'cronologia',
  },
};

/** Map OSM tags to the most specific applicable schema.org type (default `Place`). */
function schemaType(t: Tags): string {
  if (t['shop']) {
    return 'Store';
  }

  switch (t['tourism']) {
    case 'hotel':
    case 'motel':
    case 'guest_house':
    case 'hostel':
    case 'apartment':
    case 'chalet':
      return 'LodgingBusiness';
    case 'museum':
      return 'Museum';
    case 'gallery':
      return 'ArtGallery';
  }

  if (t['tourism'] || t['historic']) {
    return 'TouristAttraction';
  }

  switch (t['amenity']) {
    case 'restaurant':
    case 'fast_food':
    case 'food_court':
      return 'Restaurant';
    case 'cafe':
      return 'CafeOrCoffeeShop';
    case 'bar':
    case 'pub':
      return 'BarOrPub';
    case 'bank':
      return 'BankOrCreditUnion';
    case 'pharmacy':
      return 'Pharmacy';
    case 'hospital':
      return 'Hospital';
    case 'clinic':
    case 'doctors':
      return 'MedicalClinic';
    case 'school':
      return 'School';
    case 'kindergarten':
      return 'Preschool';
    case 'university':
    case 'college':
      return 'CollegeOrUniversity';
    case 'place_of_worship':
      return 'PlaceOfWorship';
    case 'fuel':
      return 'GasStation';
    case 'cinema':
      return 'MovieTheater';
    case 'library':
      return 'Library';
  }

  if (t['natural'] === 'peak' || t['natural'] === 'volcano') {
    return 'Mountain';
  }

  if (t['natural'] === 'water' || t['water'] || t['waterway']) {
    return 'BodyOfWater';
  }

  if (t['leisure'] === 'park' || t['leisure'] === 'garden') {
    return 'Park';
  }

  if (t['boundary'] === 'administrative') {
    return 'AdministrativeArea';
  }

  return 'Place';
}

/** Build the JSON-LD `<script>` payload (already escaped for inlining). */
function buildJsonLd(
  element: { type: string; id: number; tags: Tags },
  center: { lat: number; lon: number },
  fullName: string,
  url: string,
): string {
  const t = element.tags;

  const obj: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': schemaType(t),
    name: fullName,
    url,
    hasMap: url,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: center.lat,
      longitude: center.lon,
    },
  };

  if (t['description']) {
    obj['description'] = t['description'];
  }

  const street = [t['addr:street'], t['addr:housenumber']]
    .filter(Boolean)
    .join(' ');

  const address: Record<string, string> = {};

  if (street) {
    address['streetAddress'] = street;
  }

  if (t['addr:city']) {
    address['addressLocality'] = t['addr:city'];
  }

  if (t['addr:postcode']) {
    address['postalCode'] = t['addr:postcode'];
  }

  if (t['addr:country']) {
    address['addressCountry'] = t['addr:country'];
  }

  if (Object.keys(address).length > 0) {
    obj['address'] = { '@type': 'PostalAddress', ...address };
  }

  const phone = t['phone'] ?? t['contact:phone'] ?? t['contact:mobile'];

  if (phone) {
    obj['telephone'] = phone;
  }

  const email = t['email'] ?? t['contact:email'];

  if (email) {
    obj['email'] = email;
  }

  const website = t['website'] ?? t['contact:website'] ?? t['url'];

  const sameAs = [
    `https://www.openstreetmap.org/${element.type}/${element.id}`,
  ];

  if (t['wikidata']) {
    sameAs.push(`https://www.wikidata.org/entity/${t['wikidata']}`);
  }

  if (t['wikipedia']) {
    sameAs.push(
      `https://wikipedia.org/wiki/${encodeURIComponent(t['wikipedia'].replace(/ /g, '_'))}`,
    );
  }

  if (website && /^https?:\/\//.test(website)) {
    sameAs.push(website);
  }

  obj['sameAs'] = sameAs;

  if (t['image'] && /^https?:\/\//.test(t['image'])) {
    obj['image'] = t['image'];
  }

  // Escape `<` so a `</script>` inside any tag value cannot break out.
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}

/** Generate per-feature prerender pages + sitemap shards for one country. */
async function generateCountry(
  country: Country,
  skNames: string[],
  euNames: string[],
): Promise<number> {
  const { lang, full } = country;

  const copy = COPY[lang];

  if (!copy) {
    throw new Error(`Missing page copy for language "${lang}".`);
  }

  const { osmTagToNameMapping, colorNames } = await getOsmMapping(lang);

  const shardNames = langBase(lang) === BASE_EU ? euNames : skNames;

  const area = await fetchArea(country.boundary);

  const entries = Object.entries(full ? FULL_CATEGORIES : OUTDOOR_CATEGORIES);

  let countryPages = 0;

  for (let c = 0; c < entries.length; c++) {
    const [category, filter] = entries[c];

    console.log(
      `[${country.name} ${c + 1}/${entries.length}] ${category}: querying the OSM database…`,
    );

    const refs = await fetchRefs(area, filter);

    console.log(`  ${country.name}/${category}: ${refs.length} elements`);

    // Filled as pages are written, so a feature deleted from OSM between the id
    // query and its tag batch is never advertised in a sitemap without a page.
    const urls: string[] = [];

    for await (const element of streamFeatures(refs)) {
      const genName = getGenericNameFromOsmElementSync(
        element.tags,
        element.type,
        osmTagToNameMapping,
        colorNames,
      );

      const name = getNameFromOsmElement(element.tags, lang);

      const { center } = element;

      const description = [
        genName,
        name,
        copy.onMap,
        element.tags['description'],
      ];

      if (
        Object.keys(element.tags).some((key) =>
          /^contact:|^addr:|^email$|^phone$|^web$|^url$/.test(key),
        )
      ) {
        description.push(copy.contact);
      }

      if (element.tags['opening_hours']) {
        description.push(copy.openingHours);
      }

      const param = `layers=X&osm-${element.type}=${element.id}`;

      const url = appUrl(param, lang);

      urls.push(url);

      const osmUrl = `https://www.openstreetmap.org/${element.type}/${element.id}`;

      const fullName = `${genName} ${name ?? ''}`.trim();

      const metaDescription = description.filter(Boolean).join(' ');

      const ogImage =
        element.tags['image'] && /^https?:\/\//.test(element.tags['image'])
          ? element.tags['image']
          : undefined;

      const jsonLd = buildJsonLd(element, center, fullName, url);

      const h =
        '<!doctype html>\n' +
        html`<html lang=${lang}>
          <head>
            <title>${`${fullName} - ${siteName(lang)}`}</title>

            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />

            <meta name="description" content=${metaDescription} />

            <link rel="canonical" href=${url} />

            <meta property="og:title" content=${fullName} />
            <meta property="og:description" content=${metaDescription} />
            <meta property="og:url" content=${url} />
            <meta property="og:type" content="website" />
            ${ogImage && html`<meta property="og:image" content=${ogImage} />`}

            <meta
              name="geo.position"
              content=${`${center.lat};${center.lon}`}
            />

            <meta name="ICBM" content=${`${center.lat}, ${center.lon}`} />

            <script
              type="application/ld+json"
              dangerouslySetInnerHTML=${{ __html: jsonLd }}
            ></script>

            <style>
              a {
                display: inline-block;
                margin: 0.33rem;
              }
            </style>
          </head>

          <body>
            <nav>
              <a href=${`/?layers=X&lang=${lang}`}>
                ${expandNames(copy.siteName, lang)}
              </a>
              ›${' '}
              <a href=${url}>${copy.showOnMap}</a>
            </nav>

            <h1>${genName.trim()} <i>${name}</i></h1>

            <p>
              <a href=${osmUrl}>${copy.openOsm}</a>
              ${' '}(<a href=${`${osmUrl}/history`}>${copy.history}</a>)
            </p>

            <p>${copy.intro}</p>

            ${
              element.tags['description'] &&
              html`<p>${element.tags['description']}</p>`
            }

            <dl>
              ${Object.entries(element.tags).map(
                ([key, value]) => html`
                  <dt>
                    <a
                      href=${`https://wiki.openstreetmap.org/wiki/Key:${encodeURIComponent(
                        key,
                      )}`}
                      >${key}</a
                    >
                  </dt>

                  <dd>
                    ${
                      key === 'wikidata'
                        ? html`<a
                          href=${`https://www.wikidata.org/entity/${encodeURIComponent(
                            value,
                          )}`}
                          >${value}</a
                        >`
                        : [
                              'contact:website',
                              'website',
                              'url',
                              'image',
                            ].includes(key)
                          ? html`<a
                            href=${
                              /^https?:\/\//.test(value)
                                ? value
                                : `http://${value}`
                            }
                            >${value}</a
                          >`
                          : ['contact:email', 'email'].includes(key)
                            ? html`<a href=${`mailto:${value}`}>${value}</a>`
                            : [
                                  'contact:phone',
                                  'contact:mobile',
                                  'phone',
                                ].includes(key)
                              ? html`<a href=${`tel:${value.replace(/ /g, '')}`}
                                >${value}</a
                              >`
                              : key === 'wikipedia'
                                ? html`<a
                                  href=${`https://wikipedia.org/wiki/${encodeURIComponent(
                                    value.replace(/ /g, '_'),
                                  )}`}
                                  >${value}</a
                                >`
                                : key === 'wikimedia_commons'
                                  ? html`<a
                                    href=${`https://commons.wikimedia.org/wiki/${encodeURIComponent(
                                      value.replace(/ /g, '_'),
                                    )}`}
                                    >${value}</a
                                  >`
                                  : categoryKeys.has(key)
                                    ? html`<a
                                      href=${`https://wiki.openstreetmap.org/wiki/Tag:${encodeURIComponent(
                                        key,
                                      )}=${encodeURIComponent(value)}`}
                                      >${value}</a
                                    >`
                                    : value
                    }
                  </dd>
                `,
              )}
            </dl>
          </body>
        </html>`;

      await writeFile(`../sitemap/${fileName(param, lang)}`, h);
    }

    // A single sitemap file may contain at most 50 000 URLs (sitemaps.org).
    // Split large categories into numbered shards so the index stays valid.
    const MAX_URLS_PER_FILE = 45000;

    const shardCount = Math.max(1, Math.ceil(urls.length / MAX_URLS_PER_FILE));

    for (let i = 0; i < shardCount; i++) {
      const name =
        shardCount === 1
          ? `sitemap-feat-${lang}-${category}.txt`
          : `sitemap-feat-${lang}-${category}-${i + 1}.txt`;

      shardNames.push(name);

      await writeFile(
        `../sitemap/${name}`,
        urls
          .slice(i * MAX_URLS_PER_FILE, (i + 1) * MAX_URLS_PER_FILE)
          .join('\n'),
      );
    }

    countryPages += urls.length;

    console.log(
      `  ${country.name}/${category}: wrote ${urls.length} feature pages → ${shardCount} sitemap shard(s)`,
    );
  }

  // Every configured country has tens of thousands of features, so none is a
  // legitimate zero — and the deploy rsyncs --delete over the live pages.
  if (countryPages === 0) {
    throw new Error(`${country.name}: no features found; refusing to deploy`);
  }

  console.log(`${country.name}: ${countryPages} feature pages (${lang}).`);

  return countryPages;
}

/**
 * Well under the ~318 000 pages the five countries hold means a partly loaded
 * database, not that OSM shrank — and deploying it would rsync --delete most of
 * the indexed corpus away.
 */
const MIN_TOTAL_PAGES = 200_000;

/**
 * Generate per-feature POI prerender pages for every configured country,
 * pushing each country's sitemap-shard names into the freemap.sk or freemap.eu
 * list per its language's home domain.
 */
export async function objects(skNames: string[], euNames: string[]) {
  let total = 0;

  try {
    for (const country of COUNTRIES) {
      total += await generateCountry(country, skNames, euNames);
    }
  } finally {
    await closeOsmDb();
  }

  if (total < MIN_TOTAL_PAGES) {
    throw new Error(
      `only ${total} feature pages (expected at least ${MIN_TOTAL_PAGES}); refusing to deploy`,
    );
  }

  console.log(`Feature pages: ${total} across ${COUNTRIES.length} countries.`);
}
