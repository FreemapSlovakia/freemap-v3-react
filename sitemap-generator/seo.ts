import htm from 'htm';
import vhtml from 'vhtml';
import { type Site, siteNames, siteUrls } from '../src/shared/sites.js';
import csShared from '../src/translations/cs-shared.js';
import deShared from '../src/translations/de-shared.js';
import enShared from '../src/translations/en-shared.js';
import frShared from '../src/translations/fr-shared.js';
import huShared from '../src/translations/hu-shared.js';
import itShared from '../src/translations/it-shared.js';
import plShared from '../src/translations/pl-shared.js';
import skShared from '../src/translations/sk-shared.js';
import slShared from '../src/translations/sl-shared.js';
import { type Hub, hubs } from './hubs.js';

const html = htm.bind(vhtml);

/** The Slovak home domain — canonical for Slovak and Czech pages. */
export const BASE_SK = siteUrls.sk;

/** The international domain — canonical for every other language. */
export const BASE_EU = siteUrls.eu;

/** Default base (the Slovak home domain), used for freemap.sk-only artifacts. */
export const BASE = BASE_SK;

export type Lang = 'sk' | 'en' | 'cs' | 'hu' | 'it' | 'de' | 'pl' | 'sl' | 'fr';

/** All UI languages the SPA accepts (see locationChangeHandler.ts). */
export const LANGS: Lang[] = [
  'sk',
  'en',
  'cs',
  'hu',
  'it',
  'de',
  'pl',
  'sl',
  'fr',
];

/** Hub copy exists in every UI language, so hubs render in all of them. */
export const HUB_LANGS: Lang[] = LANGS;

/** Languages canonical on {@link BASE_SK}; every other language on {@link BASE_EU}. */
const SK_LANGS: Lang[] = ['sk', 'cs'];

/** The site a language's pages are canonical on. */
function langSite(lang: Lang): Site {
  return SK_LANGS.includes(lang) ? 'sk' : 'eu';
}

/** The home (canonical) domain hosting a language's pages. */
export function langBase(lang: Lang): string {
  return siteUrls[langSite(lang)];
}

/**
 * The domain name to show in a language's page copy — it must match the domain
 * the page is canonical on, so `freemap.eu` pages never advertise `Freemap.sk`.
 */
export function brand(lang: Lang): string {
  return SK_LANGS.includes(lang) ? 'Freemap.sk' : 'Freemap.eu';
}

/**
 * The portal name to show in a language's page copy — the pages on
 * {@link BASE_EU} carry the international brand.
 */
export function siteName(lang: Lang): string {
  return siteNames[langSite(lang)];
}

/**
 * Substitutes the copy placeholders `{brand}` (the domain, {@link brand}) and
 * `{site}` (the portal name, {@link siteName}) for the page's language.
 */
export function expandNames(text: string, lang: Lang): string {
  return text
    .replace(/\{brand\}/g, brand(lang))
    .replace(/\{site\}/g, siteName(lang));
}

/**
 * Per-language <title>/<meta description>, reused from the SPA's SEO strings.
 * The titles carry the `{site}` placeholder — run them through
 * {@link expandNames} before rendering.
 */
export const homeMeta: Record<Lang, { title: string; description: string }> = {
  sk: skShared,
  en: enShared,
  cs: csShared,
  hu: huShared,
  it: itShared,
  de: deShared,
  pl: plShared,
  sl: slShared,
  fr: frShared,
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
  sl: 'Odpri zemljevid',
  fr: 'Ouvrir la carte',
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
  sl: 'Funkcije in sloji zemljevida',
  fr: 'Fonctions et couches de la carte',
};

/** Clean app URL (the canonical, bot-rewritten to a prerender) for a given query + language. */
export function appUrl(param: string, lang: Lang): string {
  return `${langBase(lang)}/?${param}&lang=${lang}`;
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
export function renderHub(hub: Hub, lang: Lang): string {
  const title = expandNames(hub.title[lang], lang);

  const description = expandNames(hub.description[lang], lang);

  const url = appUrl(hub.param, lang);

  const jsonLd = encodeJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url,
    inLanguage: lang,
    isPartOf: {
      '@type': 'WebSite',
      name: siteName(lang),
      url: langBase(lang),
    },
  });

  return (
    '<!doctype html>\n' +
    html`<html lang=${lang}>
      <head>
        <title>${`${title} – ${siteName(lang)}`}</title>

        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="description" content=${description} />

        ${alternateLinks(hub.param, HUB_LANGS, lang, 'en')}

        <meta property="og:site_name" content=${siteName(lang)} />
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
          <a href=${appUrl('layers=X', lang)}>${siteName(lang)}</a>
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
                  <a href=${appUrl(h.param, lang)}>
                    ${expandNames(h.title[lang], lang)}
                  </a>
                </li>`,
            )}
        </ul>
      </body>
    </html>`
  );
}

/** Render the homepage for one language. */
export function renderHome(lang: Lang): string {
  const { description } = homeMeta[lang];

  const title = expandNames(homeMeta[lang].title, lang);

  const url = appUrl('layers=X', lang);

  const jsonLd = encodeJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: siteName(lang),
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

        <meta property="og:site_name" content=${siteName(lang)} />
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
                <a href=${appUrl(h.param, lang)}>
                  ${expandNames(h.title[lang], lang)}
                </a>
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
        <title>${`${title} – ${siteName(lang)}`}</title>

        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="description" content=${description} />

        ${alternateLinks(param, langs, lang, xDefaultLang)}

        <meta property="og:site_name" content=${siteName(lang)} />
        <meta property="og:title" content=${title} />
        <meta property="og:url" content=${url} />
        <meta property="og:type" content="article" />

        ${sharedStyle}
      </head>

      <body>
        <nav>
          <a href=${appUrl('layers=X', lang)}>${siteName(lang)}</a>
        </nav>

        <article dangerouslySetInnerHTML=${{ __html: bodyHtml }}></article>
      </body>
    </html>`
  );
}
