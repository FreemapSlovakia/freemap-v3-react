import axios from 'axios';
import { opendir, readFile, writeFile } from 'fs/promises';
import { getNameFromOsmElementSync, categoryKeys } from './osmNameResolver.js';
import { colorNames, osmTagToNameMapping } from './osmTagToNameMapping-sk.js';
import HtmlCreator from 'html-creator';

const sitemapNames = [];

{
  const out = [];

  for (const lang of ['sk', 'cs', 'en', 'hu']) {
    out.push(`https://www.freemap.sk/?layers=X&lang=${lang}`);

    // basic modals
    out.push(
      ...[
        'legend',
        'upload-track',
        'about',
        'export-gpx',
        'export-pdf',
        'settings',
        'embed',
        'supportUs',
        'tracking-watched',
        // 'tracking-my', // not logged in
        // 'maps', // not logged in
      ].map(
        (modal) =>
          `https://www.freemap.sk/?layers=X&show=${modal}&lang=${lang}`,
      ),
    );

    // tips
    out.push(
      ...[
        'freemap',
        'osm',
        'attribution',
        'shortcuts',
        'exports',
        'sharing',
        'galleryUpload',
        'gpxViewer',
        'planner',
        'dvePercenta',
        'privacyPolicy',
      ].map(
        (modal) => `https://www.freemap.sk/?layers=X&tip=${modal}&lang=${lang}`,
      ),
    );
  }

  const name = 'sitemap-core.txt';

  sitemapNames.push(name);

  await writeFile('../sitemap/' + name, out.join('\n'));
}

const queries = {
  'bicycle-routes':
    'relation["type"="route"]["route"="bicycle"](area:3600014296);',
  'ski-routes':
    'relation["type"="route"]["route"="ski"](area:3600014296); relation["type"="route"]["route"="piste"](area:3600014296);',
  'hiking-routes':
    'relation["type"="route"]["route"="hiking"](area:3600014296); relation["type"="route"]["route"="foot"](area:3600014296);',
  'admin-boundaies': 'relation["boundary"="administrative"](area:3600014296);',
  amenities: 'nwr["amenity"]["name"](area:3600014296);',
  buildings: 'nwr["building"]["name"](area:3600014296);',
  'geomorfological-units':
    'relation["boundary"="geomorphological-unit"](area:3600014296);',
  landuses: 'nwr["landuse"]["name"](area:3600014296);',
  leisures: 'nwr["leisure"]["name"](area:3600014296);',
  man_made: 'nwr["man_made"]["name"](area:3600014296);',
  'protected-areas':
    'nwr["boundary"="protected_area"]["name"](area:3600014296);',
  shops: 'nwr["shop"]["name"](area:3600014296);',
};

for (const [category, query] of Object.entries(queries)) {
  console.log('Category:', category);

  const res = await axios.request({
    method: 'POST',
    url: 'https://overpass.freemap.sk/api/interpreter',
    headers: { 'Content-Type': 'text/plain' },
    data: `[out:json][timeout:120]; (${query}); out center tags;`,
  });

  const name = `sitemap-feat-${category}.txt`;

  sitemapNames.push(name);

  await writeFile(
    '../sitemap/' + name,
    res.data.elements
      .map(
        (el) =>
          `https://www.freemap.sk/?layers=X&osm-${el.type}=${el.id}&lang=sk`,
      )
      .join('\n'),
  );

  for (const element of res.data.elements) {
    const [genName, name] = getNameFromOsmElementSync(
      element.tags,
      element.type,
      'sk',
      osmTagToNameMapping,
      colorNames,
    );

    const html = new HtmlCreator();

    html.withBoilerplate([
      {
        type: 'h1',
        content: [
          { content: genName.trim() + ' ' },
          {
            type: 'i',
            content: name,
          },
        ],
      },
      {
        type: 'p',
        content: [
          {
            type: 'a',
            attributes: {
              href: `https://www.openstreetmap.org/${element.type}/${element.id}`,
            },
            content: 'Otvoriť na OpenStreetMap.org',
          },
          { content: ' (' },
          {
            type: 'a',
            attributes: {
              href: `https://www.openstreetmap.org/${element.type}/${element.id}/history`,
            },
            content: 'história',
          },
          { content: ')' },
        ],
      },
      {
        type: 'p',
        content: [
          {
            content:
              'Turistika, cyklistika, bežky. Online detailná turistická mapa, cyklistická mapa, cyklomapa, jazdecká mapa, bežkárska/lyžiarska mapa, letecká mapa.',
          },
        ],
      },
      element.tags['description']
        ? { type: 'p', content: element.tags['description'] }
        : {},
      {
        type: 'table',
        content: Object.entries(element.tags).map(([key, value]) => ({
          type: 'tr',
          content: [
            {
              type: 'th',
              content: [
                {
                  type: 'a',
                  attributes: {
                    href: `https://wiki.openstreetmap.org/wiki/Key:${encodeURIComponent(
                      key,
                    )}`,
                  },
                  content: key,
                },
              ],
            },
            {
              type: 'td',
              content:
                key === 'wikidata'
                  ? [
                      {
                        type: 'a',
                        attributes: {
                          href: `https://www.wikidata.org/entity/${encodeURIComponent(
                            key,
                          )}`,
                        },
                        content: value,
                      },
                    ]
                  : key === 'contact:website' ||
                    key === 'website' ||
                    key === 'url' ||
                    key === 'image'
                  ? [
                      {
                        type: 'a',
                        attributes: {
                          href: /^https?:\/\//.test(value)
                            ? value
                            : `http://${value}`,
                        },
                        content: value,
                      },
                    ]
                  : key === 'contact:email' || key === 'email'
                  ? [
                      {
                        type: 'a',
                        attributes: {
                          href: 'mailto:' + value,
                        },
                        content: value,
                      },
                    ]
                  : key === 'phone' ||
                    key === 'contact:phone' ||
                    key === 'contact:mobile'
                  ? [
                      {
                        type: 'a',
                        attributes: {
                          href: 'tel:' + value.replace(/ /g, ''),
                        },
                        content: value,
                      },
                    ]
                  : key === 'wikipedia'
                  ? [
                      {
                        type: 'a',
                        attributes: {
                          href: `https://sk.wikipedia.org/wiki/${encodeURIComponent(
                            key,
                          )}`,
                        },
                        content: value,
                      },
                    ]
                  : categoryKeys.has(key)
                  ? [
                      {
                        type: 'a',
                        attributes: {
                          href: `https://wiki.openstreetmap.org/wiki/Tag:${encodeURIComponent(
                            key,
                          )}=${encodeURIComponent(value)}`,
                        },
                        content: value,
                      },
                    ]
                  : value,
            },
          ],
        })),
      },
    ]);

    html.document.setTitle(
      (genName + ' ' + (name ?? '')).trim() + ' - freemap.sk',
    );

    html.document.attributes = { lang: 'sk' };

    const center = element.center ?? element;

    html.document.addElementToType('head', {
      type: 'meta',
      attributes: {
        name: 'robots',
        content: 'index,nofollow',
      },
    });

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

    if (element.tags)
      html.document.addElementToType('head', {
        type: 'meta',
        attributes: {
          name: 'description',
          content: description.filter(Boolean).join(' '),
        },
      });

    html.document.addElementToType('head', {
      type: 'meta',
      attributes: {
        name: 'geo.position',
        content: center.lat + ';' + center.lon,
      },
    });

    html.document.addElementToType('head', {
      type: 'meta',
      attributes: {
        name: 'ICBM',
        content: center.lat + ', ' + center.lon,
      },
    });

    await writeFile(
      `../sitemap/layers=X&osm-${element.type}=${element.id}&lang=sk`,
      html.renderHTML(),
    );
  }
}

await writeFile(
  '../sitemap/sitemap-index.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapNames
  .map(
    (name) => `  <sitemap>
    <loc>https://www.freemap.sk/${name}</loc>
  </sitemap>
`,
  )
  .join('')}
</sitemapindex>
`,
);
