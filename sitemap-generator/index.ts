import { readdir, readFile, writeFile } from 'fs/promises';
import htm from 'htm';
import { marked } from 'marked';
import vhtml from 'vhtml';
import { objects } from './objects.js';

const html = htm.bind(vhtml);

// console.log(marked);
// console.log(Markup);
// console.log(h);

const raw = (html: string) =>
  vhtml(null, {
    dangerouslySetInnerHTML: { __html: html },
  });

async function gen() {
  const sitemapNames: string[] = [];

  const out: string[] = [];

  await writeFile(
    `../sitemap/layers=X&lang=sk`,
    '<!doctype html>\n' +
      html`<html lang="sk">
        <head>
          <title>Freemap Slovakia, digitálne mapy</title>

          <description
            >Detailná turistická mapa, cyklistická mapa, bežkárska mapa a
            jazdecká mapa strednej Európy, založená na databáze OpenStreetMap.
          </description>

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />

          <style>
            a {
              display: inline-block;
              margin: 0.33rem;
            }
          </style>
        </head>

        <body>
          Detailná turistická mapa, cyklistická mapa, bežkárska mapa a jazdecká
          mapa strednej Európy (Slovenska, Česka, Maďarska, Chorvátska,
          Slovinska, Rumunska, Bulharska, Bosny a Hercegoviny, Rakúska,
          Švajčiarska severného Talianska a Zakarpatskej Rusi). Mapa obsahuje
          značené turistické, cyklistické, bežkárske a jazdecké chodníky. Je
          založená na databáze OpenStreetMap a preto je neustále aktualizovaná.
          Rôzne podklady ako Strava heatmap, lesné cesty NLC, ortofoto,
          satelitný podklad, verejná doprava, wikipédia, fotografie. Funkcie ako
          vyhľadávanie (podľa názvu alebo POI podľa kategórie), plánovanie trás
          (pešo, cyklo, kočík, vozík, ...), anotácia mapy (kreslenie,
          body/značky v mape), meranie (vzdialenosti, výšky, plochy, polohy),
          zobrazenie vlastných GPX záznamov, vlastné mapy, živé sledovanie
          (tracking), export do GPX a GeoJSON, tlač máp, exportovanie mapy do
          PDF. Vloženie mapy do vlastnej stránky. Alternatíva k mapám ako
          ${' '}<a href="https://mapy.dennikn.sk">hiking.sk</a>,${' '}<a
            href="https://mapy.cz"
            >mapy.cz</a
          >${' '}alebo${' '}<a href="https://maps.google.com">maps.google.com</a
          >.

          <ul>
            <li><a href="/?layers=X&show=legend&lang=sk">legenda mapy</a></li>
            <li>
              <a href="/?layers=X&show=upload-track&lang=sk"
                >nahrať GPX súbor</a
              >
            </li>
            <li>
              <a href="/?layers=X&show=export-map-features&lang=sk"
                >export do GPX / GeoJSON / Garmin</a
              >
            </li>
            <li>
              <a href="/?layers=X&show=export-map&lang=sk"
                >export mapy do PDF, SVG, PNG a JPEG</a
              >
            </li>
            <li>
              <a href="/?layers=X&show=supportUs&lang=sk">podporte Freemap</a>
            </li>
            <li>
              <a href="/?layers=X&show=tracking-watched&lang=sk"
                >sledované zariadenia</a
              >
            </li>
          </ul>
          <!-- TODO maybe put here words from freemap website (from sk.tsx) -->
        </body>
      </html>`,
  );

  out.push(`https://www.freemap.sk/?layers=X&lang=sk`);

  // // basic modals
  // out.push(
  //   ...[
  //     'legend',
  //     'upload-track',
  //     'about',
  //     'export-map-features',
  //     'export-map',
  //     'account',
  //     'embed',
  //     'supportUs',
  //     'tracking-watched',
  //     // 'tracking-my', // not logged in
  //     // 'maps', // not logged in
  //   ].map((modal) => `https://www.freemap.sk/?layers=X&show=${modal}&lang=sk`),
  // );

  const documentsDir = '../src/documents';

  for (const document of await readdir(documentsDir)) {
    if (document.endsWith('.md')) {
      await writeFile(
        `../sitemap/layers=X&document=${document.slice(0, -3)}&lang=sk`,
        '<!doctype html>\n' +
          html`<html lang="sk">
            <head>
              <title>freemap.sk</title>

              <description
                >Detailná turistická mapa, cyklistická mapa, bežkárska mapa a
                jazdecká mapa strednej Európy, založená na databáze
                OpenStreetMap.
              </description>

              <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
              />

              <style>
                a {
                  display: inline-block;
                  margin: 0.33rem;
                }
              </style>
            </head>

            <body>
              ${raw(
                marked.parse(
                  await readFile(documentsDir + '/' + document, 'utf-8'),
                ),
              )}
            </body>
          </html>`,
      );

      out.push(
        `https://www.freemap.sk/?layers=X&document=${document.slice(0, -3)}&lang=sk`,
      );
    }
  }

  const name = 'sitemap-core.txt';

  sitemapNames.push(name);

  await writeFile('../sitemap/' + name, out.join('\n'));

  await objects(sitemapNames);

  await writeFile(
    '../sitemap/sitemap-index.xml',
    `<?xml version="1.0" encoding="UTF-8"?>` +
      html`
        <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          ${sitemapNames.map(
            (name) =>
              html`<sitemap>
                <loc>https://www.freemap.sk/${name}</loc>
              </sitemap>`,
          )}
        </sitemapindex>
      `,
  );
}

gen().catch(console.error);
