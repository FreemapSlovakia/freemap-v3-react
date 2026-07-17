import { writeFile } from 'node:fs/promises';
import htm from 'htm';
import vhtml from 'vhtml';
import {
  categoryKeys,
  getGenericNameFromOsmElementSync,
  getNameFromOsmElement,
  getOsmMapping,
} from '../src/osm/osmNameResolver.js';
import { appUrl, BASE_EU, fileName, type Lang, langBase } from './seo.js';

const html = htm.bind(vhtml);

type Tags = Record<string, string>;

/**
 * A country whose OSM features get per-feature prerender pages, in that
 * country's most-prominent language. Slovakia keeps the full category set;
 * other countries get the outdoor-only subset (the map's core value) to keep
 * page volume, Overpass load and crawl budget sane. The page's home domain
 * follows the language via {@link langBase} (sk/cs → freemap.sk, else eu).
 */
interface Country {
  name: string;
  lang: Lang;
  /** Overpass area id: 3600000000 + the country's OSM relation id. */
  areaId: number;
  full: boolean;
}

const COUNTRIES: Country[] = [
  { name: 'Slovakia', lang: 'sk', areaId: 3600014296, full: true },
  { name: 'Czechia', lang: 'cs', areaId: 3600051684, full: false },
  { name: 'Hungary', lang: 'hu', areaId: 3600021335, full: false },
  { name: 'Poland', lang: 'pl', areaId: 3600049715, full: false },
  { name: 'Italy', lang: 'it', areaId: 3600365331, full: false },
];

function routeQueries(area: number): Record<string, string> {
  return {
    'hiking-routes': `relation["type"="route"]["route"="hiking"](area:${area}); relation["type"="route"]["route"="foot"](area:${area});`,
    'bicycle-routes': `relation["type"="route"]["route"="bicycle"](area:${area});`,
    'ski-routes': `relation["type"="route"]["route"="ski"](area:${area}); relation["type"="route"]["route"="piste"](area:${area});`,
  };
}

/**
 * Outdoor-only categories. `natural` is restricted to high-value point
 * landmarks (peaks, saddles, springs, caves, glaciers, …): the unrestricted
 * `natural=*` set runs to hundreds of thousands of named woods/water polygons
 * per large country — thin content that also OOMs the generator.
 */
function outdoorQueries(area: number): Record<string, string> {
  return {
    ...routeQueries(area),
    'natural-features': `nwr["natural"~"^(peak|volcano|saddle|ridge|arete|spring|hot_spring|geyser|cave_entrance|cliff|arch|glacier)$"]["name"](area:${area});`,
    'protected-areas': `nwr["boundary"="protected_area"]["name"](area:${area});`,
    huts: `nwr["tourism"~"^(alpine_hut|wilderness_hut)$"]["name"](area:${area});`,
  };
}

/** The full Slovak set: routes plus all named settlement/amenity/natural data. */
function fullQueries(area: number): Record<string, string> {
  return {
    ...routeQueries(area),
    'admin-boundaies': `relation["boundary"="administrative"](area:${area});`,
    amenities: `nwr["amenity"]["name"](area:${area});`,
    buildings: `nwr["building"]["name"](area:${area});`,
    'geomorfological-units': `relation["boundary"="geomorphological-unit"](area:${area});`,
    landuses: `nwr["landuse"]["name"](area:${area});`,
    leisures: `nwr["leisure"]["name"](area:${area});`,
    naturals: `nwr["natural"]["name"](area:${area});`,
    man_made: `nwr["man_made"]["name"](area:${area});`,
    'protected-areas': `nwr["boundary"="protected_area"]["name"](area:${area});`,
    shops: `nwr["shop"]["name"](area:${area});`,
  };
}

/**
 * Per-language page copy. Only the languages of the generated {@link COUNTRIES}
 * need an entry. These are hand-translated; the Slavic and Italian wordings
 * warrant a native review before leaning on them for ranking.
 */
interface Copy {
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
    siteName: 'Freemap Slovakia – mapa',
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
    siteName: 'Freemap Slovakia – mapa',
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
    siteName: 'Freemap Slovakia – térkép',
    showOnMap: 'Megjelenítés a térképen',
    onMap: 'a részletes szabadtéri térképen.',
    contact: 'Kapcsolat.',
    openingHours: 'Nyitvatartás.',
    intro:
      'Túrázás, kerékpározás, sífutás. Online részletes turistatérkép, kerékpáros térkép, lovaglótérkép, sífutó/síterkép, légifelvétel-térkép.',
    openOsm: 'Megnyitás az OpenStreetMap.org-on',
    history: 'előzmények',
  },
  pl: {
    siteName: 'Freemap Slovakia – mapa',
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
    siteName: 'Freemap Slovakia – mappa',
    showOnMap: 'Mostra sulla mappa',
    onMap: 'sulla mappa outdoor dettagliata.',
    contact: 'Contatti.',
    openingHours: 'Orari di apertura.',
    intro:
      'Escursionismo, ciclismo, sci di fondo. Mappa escursionistica dettagliata online, mappa ciclabile, mappa per equitazione, mappa per sci di fondo/sci, mappa aerea.',
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
  const { lang, areaId, full } = country;

  const copy = COPY[lang];

  if (!copy) {
    throw new Error(`Missing page copy for language "${lang}".`);
  }

  const { osmTagToNameMapping, colorNames } = await getOsmMapping(lang);

  const shardNames = langBase(lang) === BASE_EU ? euNames : skNames;

  const queries = full ? fullQueries(areaId) : outdoorQueries(areaId);

  const entries = Object.entries(queries);

  let countryPages = 0;

  for (let c = 0; c < entries.length; c++) {
    const [category, query] = entries[c];

    console.log(
      `[${country.name} ${c + 1}/${entries.length}] ${category}: querying Overpass…`,
    );

    const res = await fetch(
      process.env['OVERPASS_URL'] ??
        'https://overpass.freemap.sk/api/interpreter',
      {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: `[out:json][timeout:300]; (${query}); out center tags;`,
      },
    );

    const data = await res.json();

    const urls: string[] = data.elements.map((el) =>
      appUrl(`layers=X&osm-${el.type}=${el.id}`, lang),
    );

    // A single sitemap file may contain at most 50 000 URLs (sitemaps.org).
    // Split large categories into numbered shards so the index stays valid.
    const MAX_URLS_PER_FILE = 45000;

    const shardCount = Math.max(1, Math.ceil(urls.length / MAX_URLS_PER_FILE));

    console.log(
      `  ${country.name}/${category}: ${data.elements.length} elements → ${shardCount} sitemap shard(s)`,
    );

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

    for (const element of data.elements) {
      const genName = getGenericNameFromOsmElementSync(
        element.tags,
        element.type,
        osmTagToNameMapping,
        colorNames,
      );

      const name = getNameFromOsmElement(element.tags, lang);

      const center = element.center ?? element;

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
            <title>${`${fullName} - freemap.sk`}</title>

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
              <a href=${`/?layers=X&lang=${lang}`}>${copy.siteName}</a> ›${' '}
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
              ${Object.entries(element.tags as Record<string, string>).map(
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

    countryPages += data.elements.length;

    console.log(
      `  ${country.name}/${category}: wrote ${data.elements.length} feature pages`,
    );
  }

  console.log(`${country.name}: ${countryPages} feature pages (${lang}).`);

  return countryPages;
}

/**
 * Generate per-feature POI prerender pages for every configured country,
 * pushing each country's sitemap-shard names into the freemap.sk or freemap.eu
 * list per its language's home domain.
 */
export async function objects(skNames: string[], euNames: string[]) {
  let total = 0;

  for (const country of COUNTRIES) {
    total += await generateCountry(country, skNames, euNames);
  }

  console.log(`Feature pages: ${total} across ${COUNTRIES.length} countries.`);
}
