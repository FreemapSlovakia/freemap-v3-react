import { writeFile } from 'fs/promises';
import htm from 'htm';
import vhtml from 'vhtml';
import {
  categoryKeys,
  getNameFromOsmElementSync,
} from '../src/osm/osmNameResolver';
import {
  colorNames,
  osmTagToNameMapping,
} from '../src/osm/osmTagToNameMapping-sk';

const html = htm.bind(vhtml);

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

  for (const [category, query] of Object.entries(queries)) {
    console.log('Category:', category);

    const res = await fetch('https://overpass.freemap.sk/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: `[out:json][timeout:120]; (${query}); out center tags;`,
    });

    const name = `sitemap-feat-${category}.txt`;

    sitemapNames.push(name);

    const data = await res.json();

    await writeFile(
      '../sitemap/' + name,
      data.elements
        .map(
          (el) =>
            `https://www.freemap.sk/?layers=X&osm-${el.type}=${el.id}&lang=sk`,
        )
        .join('\n'),
    );

    for (const element of data.elements) {
      const [genName, name] = getNameFromOsmElementSync(
        element.tags,
        element.type,
        'sk',
        osmTagToNameMapping,
        colorNames,
      );

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

      const h =
        '<!doctype html>\n' +
        html`<html lang="sk">
          <head>
            <title>
              ${(genName + ' ' + (name ?? '')).trim() + ' - freemap.sk'}
            </title>

            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />

            <meta
              name="description"
              content=${description.filter(Boolean).join(' ')}
            />

            <meta
              name="geo.position"
              content=${center.lat + ';' + center.lon}
            />

            <meta name="ICBM" content=${center.lat + ', ' + center.lon} />

            <style>
              a {
                display: inline-block;
                margin: 0.33rem;
              }
            </style>
          </head>

          <body>
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

            ${element.tags['description'] &&
            html`<p>${element.tags['description']}</p>`}

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
                    ${key === 'wikidata'
                      ? html`<a
                          href=${`https://www.wikidata.org/entity/${encodeURIComponent(
                            key,
                          )}`}
                          >${value}</a
                        >`
                      : ['contact:website', 'website', 'url', 'image'].includes(
                          key,
                        )
                      ? html`<a
                          href=${/^https?:\/\//.test(value)
                            ? value
                            : `http://${value}`}
                          >${value}</a
                        >`
                      : ['contact:email', 'email'].includes(key)
                      ? html`<a href=${'mailto:' + value}>${value}</a>`
                      : ['contact:phone', 'contact:mobile', 'phone'].includes(
                          key,
                        )
                      ? html`<a href=${'tel:' + value.replace(/ /g, '')}
                          >${value}</a
                        >`
                      : key === 'wikipedia'
                      ? html`<a
                          href=${`https://sk.wikipedia.org/wiki/${encodeURIComponent(
                            key,
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
                      : value}
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
  }
}
