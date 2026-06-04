import htm from 'htm';
import vhtml from 'vhtml';
import csShared from '../src/translations/cs-shared.js';
import deShared from '../src/translations/de-shared.js';
import enShared from '../src/translations/en-shared.js';
import huShared from '../src/translations/hu-shared.js';
import itShared from '../src/translations/it-shared.js';
import plShared from '../src/translations/pl-shared.js';
import skShared from '../src/translations/sk-shared.js';

const html = htm.bind(vhtml);

export const BASE = 'https://www.freemap.sk';

export type Lang = 'sk' | 'en' | 'cs' | 'hu' | 'it' | 'de' | 'pl';

/** Languages for which curated hub-page copy exists. */
export type HubLang = 'sk' | 'en';

/** All UI languages the SPA accepts (see locationChangeHandler.ts). */
export const LANGS: Lang[] = ['sk', 'en', 'cs', 'hu', 'it', 'de', 'pl'];

export const HUB_LANGS: HubLang[] = ['sk', 'en'];

/** Per-language <title>/<meta description>, reused from the SPA's SEO strings. */
export const homeMeta: Record<Lang, { title: string; description: string }> = {
  sk: skShared,
  en: enShared,
  cs: csShared,
  hu: huShared,
  it: itShared,
  de: deShared,
  pl: plShared,
};

/** "Open the map" call-to-action label per language. */
export const openMapLabel: Record<Lang, string> = {
  sk: 'Otvoriť mapu',
  en: 'Open the map',
  cs: 'Otevřít mapu',
  hu: 'Térkép megnyitása',
  it: 'Apri la mappa',
  de: 'Karte öffnen',
  pl: 'Otwórz mapę',
};

/** Section heading ("Map features") per language for the homepage hub list. */
export const featuresLabel: Record<Lang, string> = {
  sk: 'Mapové funkcie a vrstvy',
  en: 'Map features and layers',
  cs: 'Mapové funkce a vrstvy',
  hu: 'Térképfunkciók és rétegek',
  it: 'Funzioni e livelli della mappa',
  de: 'Kartenfunktionen und Ebenen',
  pl: 'Funkcje i warstwy mapy',
};

export interface Hub {
  /** Query-string fragment identifying the app state, e.g. `layers=O` or `show=route-planner`. */
  param: string;
  title: Record<HubLang, string>;
  description: Record<HubLang, string>;
}

/**
 * Curated landing pages for the main layers and tools. Copy is distilled from
 * `src/static/llms.txt` and the layer registry; keep it in sync when those change.
 */
export const hubs: Hub[] = [
  // ---- Map layers ----
  {
    param: 'layers=O',
    title: {
      en: 'OpenStreetMap base map',
      sk: 'Podkladová mapa OpenStreetMap',
    },
    description: {
      en: 'OpenStreetMap base layer on Freemap.sk — the standard worldwide OpenStreetMap map. Pan, zoom and explore continuously updated OSM data, plan routes and view points of interest.',
      sk: 'Podkladová vrstva OpenStreetMap na Freemap.sk — štandardná celosvetová mapa OpenStreetMap. Posúvajte a približujte neustále aktualizované dáta OSM, plánujte trasy a prezerajte body záujmu.',
    },
  },
  {
    param: 'layers=S',
    title: {
      en: 'Aerial and satellite map',
      sk: 'Letecká a satelitná mapa',
    },
    description: {
      en: 'Aerial / satellite imagery on Freemap.sk — worldwide high-resolution aerial photography from Esri, combined with overlays for hiking and cycling trails, contours and shaded relief.',
      sk: 'Letecká / satelitná mapa na Freemap.sk — celosvetové ortofoto s vysokým rozlíšením od Esri, v kombinácii s prekryvmi turistických a cyklistických trás, vrstevníc a tieňovaného reliéfu.',
    },
  },
  {
    param: 'layers=Z',
    title: {
      en: 'Slovak and Czech orthophoto',
      sk: 'Slovenské a české ortofoto',
    },
    description: {
      en: 'Slovak and Czech orthophoto on Freemap.sk — detailed national aerial imagery (© GKÚ, NLC, ČÚZK) up to high zoom levels, ideal for precise outdoor navigation.',
      sk: 'Slovenské a české ortofoto na Freemap.sk — detailná štátna letecká mapa (© GKÚ, NLC, ČÚZK) do vysokého priblíženia, ideálna na presnú navigáciu v teréne.',
    },
  },
  {
    param: 'layers=d',
    title: {
      en: 'Public transport map',
      sk: 'Mapa verejnej dopravy',
    },
    description: {
      en: 'Public transport map on Freemap.sk — the ÖPNV layer showing bus, tram and train lines and stops based on OpenStreetMap data (© MeMoMaps).',
      sk: 'Mapa verejnej dopravy na Freemap.sk — vrstva ÖPNV zobrazujúca autobusové, električkové a vlakové linky a zastávky na základe dát OpenStreetMap (© MeMoMaps).',
    },
  },
  {
    param: 'layers=X~s0',
    title: {
      en: 'Strava heatmap',
      sk: 'Strava heatmap',
    },
    description: {
      en: 'Strava heatmap overlay on Freemap.sk — visualise the most popular running, cycling, water and winter activity routes on top of the detailed outdoor map.',
      sk: 'Prekryv Strava heatmap na Freemap.sk — zobrazte najpopulárnejšie bežecké, cyklistické, vodné a zimné trasy nad detailnou turistickou mapou.',
    },
  },
  {
    param: 'layers=X~w',
    title: {
      en: 'Wikipedia on the map',
      sk: 'Wikipédia v mape',
    },
    description: {
      en: 'Wikipedia overlay on Freemap.sk — discover nearby places that have Wikipedia articles, shown as markers directly on the map.',
      sk: 'Prekryv Wikipédia na Freemap.sk — objavujte okolité miesta s článkami na Wikipédii zobrazené ako značky priamo v mape.',
    },
  },
  {
    param: 'layers=X~I',
    title: {
      en: 'Community outdoor photos',
      sk: 'Komunitné outdoorové fotografie',
    },
    description: {
      en: 'Community photos on Freemap.sk — browse thousands of geotagged outdoor photos (CC BY-SA 4.0) shown as markers on the map; filter, rate and upload your own.',
      sk: 'Komunitné fotografie na Freemap.sk — prezerajte tisíce geolokalizovaných outdoorových fotografií (CC BY-SA 4.0) zobrazené ako značky v mape; filtrujte, hodnoťte a pridávajte vlastné.',
    },
  },
  // ---- Tools ----
  {
    param: 'show=route-planner',
    title: {
      en: 'Route planner',
      sk: 'Plánovač trás',
    },
    description: {
      en: 'Route planner on Freemap.sk — plan walking, hiking, cycling, mountain-bike and car routes with GraphHopper and OSRM routing, multiple waypoints, round trips and isochrones, then export to GPX.',
      sk: 'Plánovač trás na Freemap.sk — naplánujte pešie, turistické, cyklistické, horské a automobilové trasy pomocou smerovania GraphHopper a OSRM, s viacerými prechodmi, okruhmi a izochrónami, a exportujte do GPX.',
    },
  },
  {
    param: 'tool=draw-points',
    title: {
      en: 'Drawing and measurement',
      sk: 'Kreslenie a meranie',
    },
    description: {
      en: 'Drawing and measurement on Freemap.sk — draw points, lines and polygons on the map, measure distance, area, elevation and azimuth, view elevation profiles and style your annotations.',
      sk: 'Kreslenie a meranie na Freemap.sk — kreslite body, čiary a polygóny v mape, merajte vzdialenosť, plochu, výšku a azimut, zobrazujte výškové profily a štýlujte svoje poznámky.',
    },
  },
  {
    param: 'show=objects',
    title: {
      en: 'Points of interest (POIs)',
      sk: 'Body záujmu (POI)',
    },
    description: {
      en: 'Points of interest on Freemap.sk — search and display POIs by category (accommodation, food, shops, tourism, natural features and more) as icons on the map.',
      sk: 'Body záujmu na Freemap.sk — vyhľadávajte a zobrazujte POI podľa kategórie (ubytovanie, jedlo, obchody, turistika, prírodné prvky a ďalšie) ako ikony v mape.',
    },
  },
  {
    param: 'tool=map-details',
    title: {
      en: 'Map details',
      sk: 'Detaily mapy',
    },
    description: {
      en: 'Map details on Freemap.sk — click any place to query its address, nearby features and the administrative and geographic areas that contain it, with links to OpenStreetMap.',
      sk: 'Detaily mapy na Freemap.sk — kliknite na ľubovoľné miesto a získajte jeho adresu, okolité prvky a administratívne a geografické oblasti, ktoré ho obsahujú, s odkazmi na OpenStreetMap.',
    },
  },
  {
    param: 'tool=changesets',
    title: {
      en: 'OpenStreetMap changes',
      sk: 'Zmeny v OpenStreetMap',
    },
    description: {
      en: 'OpenStreetMap changes on Freemap.sk — browse recent OSM edits on the map by time window and author, with links to changesets on osm.org and Achavi.',
      sk: 'Zmeny OpenStreetMap na Freemap.sk — prezerajte nedávne úpravy OSM v mape podľa časového obdobia a autora, s odkazmi na changesety na osm.org a Achavi.',
    },
  },
  {
    param: 'show=map-to-document-export',
    title: {
      en: 'Map export to image or PDF',
      sk: 'Export mapy do obrázka alebo PDF',
    },
    description: {
      en: 'Map export on Freemap.sk — export the map as JPEG, PNG, PDF or SVG at a chosen resolution, optionally with contours, shaded relief, trails, drawing and planned routes, ready for printing.',
      sk: 'Export mapy na Freemap.sk — exportujte mapu ako JPEG, PNG, PDF alebo SVG vo zvolenom rozlíšení, voliteľne s vrstevnicami, tieňovaným reliéfom, trasami, kresbou a naplánovanými trasami, pripravené na tlač.',
    },
  },
  {
    param: 'show=map-features-export',
    title: {
      en: 'Map data export (GPX, GeoJSON)',
      sk: 'Export mapových dát (GPX, GeoJSON)',
    },
    description: {
      en: 'Map data export on Freemap.sk — export your routes, points of interest, photos, drawings, live tracks and GPX data as GPX or GeoJSON, or send them to Google Drive, Dropbox or Garmin Connect.',
      sk: 'Export mapových dát na Freemap.sk — exportujte svoje trasy, body záujmu, fotografie, kresby, živé záznamy a GPX dáta ako GPX alebo GeoJSON, alebo ich odošlite do Google Drive, Dropboxu či Garmin Connect.',
    },
  },
  {
    param: 'show=embed',
    title: {
      en: 'Embed the map',
      sk: 'Vloženie mapy do stránky',
    },
    description: {
      en: 'Embed the map from Freemap.sk — generate an iframe to put an interactive outdoor map on your own website, with configurable size and controls.',
      sk: 'Vloženie mapy z Freemap.sk — vygenerujte iframe a umiestnite interaktívnu turistickú mapu na vlastnú stránku s nastaviteľnou veľkosťou a ovládacími prvkami.',
    },
  },
  {
    param: 'show=offline-map-export',
    title: {
      en: 'Offline map export (MBTiles)',
      sk: 'Export offline máp (MBTiles)',
    },
    description: {
      en: 'Offline map export on Freemap.sk — download map areas as MBTiles or SQLiteDB for offline use in GPS apps, choosing the area and zoom range.',
      sk: 'Export offline máp na Freemap.sk — stiahnite oblasti mapy ako MBTiles alebo SQLiteDB na offline použitie v GPS aplikáciách s výberom oblasti a rozsahu priblíženia.',
    },
  },
];

/** Clean app URL (the canonical, bot-rewritten to a prerender) for a given query + language. */
export function appUrl(param: string, lang: Lang): string {
  return `${BASE}/?${param}&lang=${lang}`;
}

/** Prerender file name under `sitemap/` for a given query + language. */
export function fileName(param: string, lang: Lang): string {
  return `${param}&lang=${lang}`;
}

/** Escape `<` so a stray `</script>` in the data cannot break out of the JSON-LD block. */
export function encodeJsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}

/**
 * Shared <head> link tags for a multilingual page group: a self canonical plus
 * `hreflang` alternates for every language and an `x-default`.
 */
export function alternateLinks(
  param: string,
  langs: Lang[],
  selfLang: Lang,
  xDefaultLang: Lang,
) {
  return html`
    <link rel="canonical" href=${appUrl(param, selfLang)} />
    ${langs.map(
      (l) =>
        html`<link rel="alternate" hreflang=${l} href=${appUrl(param, l)} />`,
    )}
    <link
      rel="alternate"
      hreflang="x-default"
      href=${appUrl(param, xDefaultLang)}
    />
  `;
}

const sharedStyle = html`
  <style>
    a {
      display: inline-block;
      margin: 0.33rem;
    }
  </style>
`;

/** Render a hub (layer/tool) landing page for one language. */
export function renderHub(hub: Hub, lang: HubLang): string {
  const title = hub.title[lang];

  const description = hub.description[lang];

  const url = appUrl(hub.param, lang);

  const jsonLd = encodeJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url,
    inLanguage: lang,
    isPartOf: { '@type': 'WebSite', name: 'Freemap.sk', url: BASE },
  });

  return (
    '<!doctype html>\n' +
    html`<html lang=${lang}>
      <head>
        <title>${title + ' – Freemap.sk'}</title>

        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="description" content=${description} />

        ${alternateLinks(hub.param, HUB_LANGS, lang, 'en')}

        <meta property="og:title" content=${title} />
        <meta property="og:description" content=${description} />
        <meta property="og:url" content=${url} />
        <meta property="og:type" content="website" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML=${{ __html: jsonLd }}
        ></script>

        ${sharedStyle}
      </head>

      <body>
        <nav>
          <a href=${appUrl('layers=X', lang)}>Freemap Slovakia</a>
        </nav>

        <h1>${title}</h1>

        <p>${description}</p>

        <p><a href=${url}>${openMapLabel[lang]}</a></p>

        <h2>${featuresLabel[lang]}</h2>

        <ul>
          ${hubs
            .filter((h) => h.param !== hub.param)
            .map(
              (h) =>
                html`<li>
                  <a href=${appUrl(h.param, lang)}>${h.title[lang]}</a>
                </li>`,
            )}
        </ul>
      </body>
    </html>`
  );
}

/** Render the homepage for one language. */
export function renderHome(lang: Lang): string {
  const { title, description } = homeMeta[lang];

  const url = appUrl('layers=X', lang);

  // Hub links use the page language where curated copy exists, else fall back to English.
  const hubLang: HubLang = lang === 'sk' ? 'sk' : 'en';

  const jsonLd = encodeJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Freemap.sk',
    description,
    url,
    inLanguage: lang,
    applicationCategory: 'TravelApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  });

  return (
    '<!doctype html>\n' +
    html`<html lang=${lang}>
      <head>
        <title>${title}</title>

        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="description" content=${description} />

        ${alternateLinks('layers=X', LANGS, lang, 'en')}

        <meta property="og:title" content=${title} />
        <meta property="og:description" content=${description} />
        <meta property="og:url" content=${url} />
        <meta property="og:type" content="website" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML=${{ __html: jsonLd }}
        ></script>

        ${sharedStyle}
      </head>

      <body>
        <h1>${title}</h1>

        <p>${description}</p>

        <p><a href=${url}>${openMapLabel[lang]}</a></p>

        <h2>${featuresLabel[lang]}</h2>

        <ul>
          ${hubs.map(
            (h) =>
              html`<li>
                <a href=${appUrl(h.param, lang)}>${h.title[hubLang]}</a>
              </li>`,
          )}
        </ul>
      </body>
    </html>`
  );
}

/**
 * Render a document page (`src/documents/<key>.<lang>.md`). `langs` is the set
 * of languages the document is available in (for `hreflang`); `bodyHtml` is the
 * already-rendered markdown. The URL param is the bare key — language comes from
 * `&lang=`, matching how the SPA resolves `<key>.<lang>.md`.
 */
export function renderDocument(opts: {
  key: string;
  lang: Lang;
  langs: Lang[];
  xDefaultLang: Lang;
  title: string;
  bodyHtml: string;
}): string {
  const { key, lang, langs, xDefaultLang, title, bodyHtml } = opts;

  const param = `layers=X&document=${key}`;

  const url = appUrl(param, lang);

  const description = homeMeta[lang].description;

  return (
    '<!doctype html>\n' +
    html`<html lang=${lang}>
      <head>
        <title>${title + ' – Freemap.sk'}</title>

        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="description" content=${description} />

        ${alternateLinks(param, langs, lang, xDefaultLang)}

        <meta property="og:title" content=${title} />
        <meta property="og:url" content=${url} />
        <meta property="og:type" content="article" />

        ${sharedStyle}
      </head>

      <body>
        <nav>
          <a href=${appUrl('layers=X', lang)}>Freemap Slovakia</a>
        </nav>

        <article dangerouslySetInnerHTML=${{ __html: bodyHtml }}></article>
      </body>
    </html>`
  );
}
