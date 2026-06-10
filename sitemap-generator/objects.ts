import { writeFile } from 'fs/promises';
import htm from 'htm';
import vhtml from 'vhtml';
import {
  categoryKeys,
  getGenericNameFromOsmElementSync,
  getNameFromOsmElement,
} from '../src/osm/osmNameResolver.js';
import {
  colorNames,
  osmTagToNameMapping,
} from '../src/osm/osmTagToNameMapping-sk.messages.js';

const html = htm.bind(vhtml);

type Tags = Record<string, string>;

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
  appUrl: string,
): string {
  const t = element.tags;

  const obj: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': schemaType(t),
    name: fullName,
    url: appUrl,
    hasMap: appUrl,
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

export async function objects(sitemapNames: string[]) {
  const queries = {
    'bicycle-routes':
      'relation["type"="route"]["route"="bicycle"](area:3600014296);',
    'ski-routes':
      'relation["type"="route"]["route"="ski"](area:3600014296); relation["type"="route"]["route"="piste"](area:3600014296);',
    'hiking-routes':
      'relation["type"="route"]["route"="hiking"](area:3600014296); relation["type"="route"]["route"="foot"](area:3600014296);',
    'admin-boundaies':
      'relation["boundary"="administrative"](area:3600014296);',
    amenities: 'nwr["amenity"]["name"](area:3600014296);',
    buildings: 'nwr["building"]["name"](area:3600014296);',
    'geomorfological-units':
      'relation["boundary"="geomorphological-unit"](area:3600014296);',
    landuses: 'nwr["landuse"]["name"](area:3600014296);',
    leisures: 'nwr["leisure"]["name"](area:3600014296);',
    naturals: 'nwr["natural"]["name"](area:3600014296);',
    man_made: 'nwr["man_made"]["name"](area:3600014296);',
    'protected-areas':
      'nwr["boundary"="protected_area"]["name"](area:3600014296);',
    shops: 'nwr["shop"]["name"](area:3600014296);',
  };

  const entries = Object.entries(queries);

  let totalFeaturePages = 0;

  for (let c = 0; c < entries.length; c++) {
    const [category, query] = entries[c];

    console.log(`[${c + 1}/${entries.length}] ${category}: querying Overpass…`);

    const res = await fetch(
      'https://overpass.freemap.sk/api/interpreter', // is faster
      // 'https://overpass-api.de/api/interpreter',
      {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: `[out:json][timeout:120]; (${query}); out center tags;`,
      },
    );

    const data = await res.json();

    const urls: string[] = data.elements.map(
      (el) =>
        `https://www.freemap.sk/?layers=X&osm-${el.type}=${el.id}&lang=sk`,
    );

    // A single sitemap file may contain at most 50 000 URLs (sitemaps.org).
    // Split large categories into numbered shards so the index stays valid.
    const MAX_URLS_PER_FILE = 45000;

    const shardCount = Math.max(1, Math.ceil(urls.length / MAX_URLS_PER_FILE));

    console.log(
      `  ${category}: ${data.elements.length} elements → ${shardCount} sitemap shard(s)`,
    );

    for (let i = 0; i < shardCount; i++) {
      const name =
        shardCount === 1
          ? `sitemap-feat-${category}.txt`
          : `sitemap-feat-${category}-${i + 1}.txt`;

      sitemapNames.push(name);

      await writeFile(
        '../sitemap/' + name,
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

      const name = getNameFromOsmElement(element.tags, 'sk');

      const center = element.center ?? element;

      const description = [
        genName,
        name,
        'na detailnej outdoorovej mape.',
        element.tags['description'],
      ];

      if (
        Object.keys(element.tags).some((key) =>
          /^contact:|^addr:|^email$|^phone$|^web$|^url$/.test(key),
        )
      ) {
        description.push('Kontakt.');
      }

      if (element.tags['opening_hours']) {
        description.push('Otváracie hodiny.');
      }

      const appUrl = `https://www.freemap.sk/?layers=X&osm-${element.type}=${element.id}&lang=sk`;

      const fullName = (genName + ' ' + (name ?? '')).trim();

      const metaDescription = description.filter(Boolean).join(' ');

      const ogImage =
        element.tags['image'] && /^https?:\/\//.test(element.tags['image'])
          ? element.tags['image']
          : undefined;

      const jsonLd = buildJsonLd(element, center, fullName, appUrl);

      const h =
        '<!doctype html>\n' +
        html`<html lang="sk">
          <head>
            <title>${fullName + ' - freemap.sk'}</title>

            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />

            <meta name="description" content=${metaDescription} />

            <link rel="canonical" href=${appUrl} />

            <meta property="og:title" content=${fullName} />
            <meta property="og:description" content=${metaDescription} />
            <meta property="og:url" content=${appUrl} />
            <meta property="og:type" content="website" />
            ${ogImage && html`<meta property="og:image" content=${ogImage} />`}

            <meta
              name="geo.position"
              content=${center.lat + ';' + center.lon}
            />

            <meta name="ICBM" content=${center.lat + ', ' + center.lon} />

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
              <a href="/?layers=X&lang=sk">Freemap Slovakia – mapa</a> ›${' '}
              <a href=${appUrl}>Zobraziť na mape</a>
            </nav>

            <h1>${genName.trim()} <i>${name}</i></h1>

            <p>
              <a
                href=${`https://www.openstreetmap.org/${element.type}/${element.id}`}
                >Otvoriť na OpenStreetMap.org</a
              >
              ${' '}(<a
                href=${`https://www.openstreetmap.org/${element.type}/${element.id}/history`}
                >história</a
              >)
            </p>
            <p>
              Turistika, cyklistika, bežky. Online detailná turistická mapa,
              cyklistická mapa, cyklomapa, jazdecká mapa, bežkárska/lyžiarska
              mapa, letecká mapa.
            </p>

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
                            ? html`<a href=${'mailto:' + value}>${value}</a>`
                            : [
                                  'contact:phone',
                                  'contact:mobile',
                                  'phone',
                                ].includes(key)
                              ? html`<a href=${'tel:' + value.replace(/ /g, '')}
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

      await writeFile(
        `../sitemap/layers=X&osm-${element.type}=${element.id}&lang=sk`,
        h,
      );
    }

    totalFeaturePages += data.elements.length;

    console.log(`  ${category}: wrote ${data.elements.length} feature pages`);
  }

  console.log(
    `Feature pages: ${totalFeaturePages} across ${entries.length} categories`,
  );
}
