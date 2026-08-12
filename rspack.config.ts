import path from 'node:path';
import process from 'node:process';
import type {
  Configuration,
  CssExtractRspackLoaderOptions,
} from '@rspack/core';
import { rspack } from '@rspack/core';
import { ReactRefreshRspackPlugin } from '@rspack/plugin-react-refresh';
import HtmlRspackPlugin from 'html-rspack-plugin';
import { RspackManifestPlugin } from 'rspack-manifest-plugin';
import type { LoaderOptions as SassLoaderOptions } from 'sass-loader';
import TerserPlugin from 'terser-webpack-plugin';
import { TsCheckerRspackPlugin } from 'ts-checker-rspack-plugin';
import { RspackMarkdownDictPlugin } from './RspackMarkdownDictPlugin.js';
import { RspackSyncLanguagesPlugin } from './RspackSyncLanguagesPlugin.js';
import {
  RspackWebManifestPlugin,
  type WebManifestVariant,
} from './RspackWebManifestPlugin.js';
import type { Language } from './src/shared/langUtils.js';
import {
  expandSite,
  type Site,
  siteNames,
  siteUrls,
} from './src/shared/sites.js';
import csMessages from './src/translations/cs-shared.js';
import deMessages from './src/translations/de-shared.js';
import enMessages from './src/translations/en-shared.js';
import frMessages from './src/translations/fr-shared.js';
import huMessages from './src/translations/hu-shared.js';
import itMessages from './src/translations/it-shared.js';
import plMessages from './src/translations/pl-shared.js';
import type { SharedMessages } from './src/translations/sharedMessagesInterface.js';
import skMessages from './src/translations/sk-shared.js';
import slMessages from './src/translations/sl-shared.js';
import templatesConfig from './translation-manager/templates.json' with {
  type: 'json',
};

const __dirname = import.meta.dirname;

const prod = 'DEPLOYMENT' in process.env && process.env['DEPLOYMENT'] !== 'dev';
const cssModuleRegex = /\.module\.css$/;
const scssModuleRegex = /\.module\.scss$/;

// In prod, extract CSS to files; in dev, inject via <style> for HMR.
const styleOrExtractLoader = prod
  ? {
      loader: rspack.CssExtractRspackPlugin.loader,
      options: {
        publicPath: (resourcePath: string, context: string) =>
          `${path.relative(path.dirname(resourcePath), context)}/`,
      } satisfies CssExtractRspackLoaderOptions,
    }
  : 'style-loader';

// Browser targets for CSS lowering. The `.css` files use native CSS nesting,
// which `css-loader` does not transpile; without lowering it ships verbatim and
// breaks on browsers lacking nesting support (Firefox < 117 incl. ESR 115,
// Chrome < 112, Safari < 16.5). LightningCSS flattens nesting (and adds vendor
// prefixes) for these targets. JS is left as-is — these browsers handle it.
const cssTargets = [
  '>= 0.5%',
  'last 2 versions',
  'Firefox ESR',
  'firefox >= 115',
  'not dead',
];

// Both domains are served from the same directory, so each entry document is
// emitted once per site with that site's portal name baked in.
const sites: Site[] = ['sk', 'eu'];

// The bootstrap copy of an entry document. The rest of its parameters (the
// title, the site name, the base URL) follow from the language and the site.
type EntryDoc = {
  lang: Language;
  shared: SharedMessages;
  errorHtml: string;
  nojsMessage: string;
  loadingMessage: string;
  /** Web-manifest copy. Site-neutral — the portal name is added per site. */
  appDescription: string;
  /** Labels for the base manifest's `shortcuts`, in order. */
  shortcutNames: string[];
};

const enDoc: EntryDoc = {
  lang: 'en',
  shared: enMessages,
  errorHtml:
    '<h1>Problem starting application</h1>' +
    '<p>Please make sure you are using recent version of a modern browser (Google Chrome, Firefox, Safari, Opera, Edge, Chromium, Vivaldi, Brave, …).</p>',
  nojsMessage:
    'JavaScript enabled browser is required to run this application.',
  loadingMessage: 'Loading…',
  appDescription:
    'Freemap is a free online outdoor map based on OpenStreetMap data',
  shortcutNames: ['My maps', 'Route finder', 'Objects'],
};

const entryDocs: EntryDoc[] = [
  enDoc,
  {
    lang: 'sk',
    shared: skMessages,
    errorHtml:
      '<h1>Aplikáciu sa nepodarilo spustiť</h1>' +
      '<p>Uistite sa, že používate aktuálnu verziu niektorého zo súčasných prehliadačov (Google Chrome, Firefox, Safari, Opera, Edge, Chromium, Vivaldi, Brave, …).<p>',
    nojsMessage:
      'Aplikácia vyžaduje prehliadač so zapnutou podporou JavaScriptu.',
    loadingMessage: 'Načítavam…',
    appDescription:
      'Freemap je voľne dostupná online outdoorová mapa založená na dátach z OpenStreetMap',
    shortcutNames: ['Moje mapy', 'Vyhľadávač trás', 'Objekty'],
  },
  {
    lang: 'cs',
    shared: csMessages,
    errorHtml:
      '<h1>Aplikaci se nepodařilo spustit</h1>' +
      '<p>Ujistěte se, že používáte aktuální verzi některého ze současných prohlížečů (Google Chrome, Firefox, Safari, Opera, Edge, Chromium, Vivaldi, Brave, …).<p>',
    nojsMessage:
      'Aplikace vyžaduje prohlížeč se zapnutou podporou JavaScriptu.',
    loadingMessage: 'Načítám…',
    appDescription:
      'Freemap je volně dostupná online outdoorová mapa založená na datech z OpenStreetMap',
    shortcutNames: ['Moje mapy', 'Vyhledávač tras', 'Objekty'],
  },
  {
    lang: 'hu',
    shared: huMessages,
    errorHtml:
      '<h1>Hiba történt az alkalmazás elindításánál</h1>' +
      '<p>Győződjék meg arról, hogy egy modern böngésző (Google Chrome, Firefox, Safari, Opera, Edge, Chromium, Vivaldi, Brave, …) friss verzióját használja.</p>',
    nojsMessage:
      'Az alkalmazás futtatásához JavaScriptet támogató böngészőre van szükség.',
    loadingMessage: 'Betöltés…',
    appDescription:
      'A Freemap szabadon elérhető online szabadidős térkép az OpenStreetMap adatai alapján',
    shortcutNames: ['Saját térképeim', 'Útvonaltervező', 'Objektumok'],
  },
  {
    lang: 'it',
    shared: itMessages,
    errorHtml:
      "<h1>Problema nell'avvio dell'applicazione</h1>" +
      '<p>Per favore assicurati di utilizzare una versione recente di un browser moderno (Google Chrome, Firefox, Safari, Opera, Edge, Chromium, Vivaldi, Brave, …).</p>',
    nojsMessage:
      "E' richiesto un browser con JavaScript abilitato per avviare questa applicazione.",
    loadingMessage: 'Caricamento…',
    appDescription:
      'Freemap è una mappa outdoor online gratuita basata sui dati di OpenStreetMap',
    shortcutNames: ['Le mie mappe', 'Cerca percorso', 'Oggetti'],
  },
  {
    lang: 'de',
    shared: deMessages,
    errorHtml:
      '<h1>Fehler beim Starten der Anwendung</h1>' +
      '<p>Bitte stellen Sie sicher, dass Sie eine aktuelle Version eines modernen Browsers verwenden (Google Chrome, Firefox, Safari, Opera, Edge, Chromium, Vivaldi, Brave, …).</p>',
    nojsMessage:
      'Zum Ausführen dieser Anwendung ist ein Browser mit aktiviertem JavaScript erforderlich.',
    loadingMessage: 'Lade…',
    appDescription:
      'Freemap ist eine frei zugängliche Outdoor-Onlinekarte auf Basis von OpenStreetMap-Daten',
    shortcutNames: ['Meine Karten', 'Routenplaner', 'Objekte'],
  },
  {
    lang: 'pl',
    shared: plMessages,
    errorHtml:
      '<h1>Nie udało się uruchomić aplikacji</h1>' +
      '<p>Upewnij się, że używasz aktualnej wersji jednej ze współczesnych przeglądarek (Google Chrome, Firefox, Safari, Opera, Edge, Chromium, Vivaldi, Brave, …).</p>',
    nojsMessage: 'Aplikacja wymaga przeglądarki z włączoną obsługą JavaScript.',
    loadingMessage: 'Ładowanie…',
    appDescription:
      'Freemap to bezpłatna mapa outdoorowa online oparta na danych OpenStreetMap',
    shortcutNames: ['Moje mapy', 'Wyszukiwarka tras', 'Obiekty'],
  },
  {
    lang: 'sl',
    shared: slMessages,
    errorHtml:
      '<h1>Aplikacije ni bilo mogoče zagnati</h1>' +
      '<p>Prepričajte se, da uporabljate najnovejšo različico sodobnega brskalnika (Google Chrome, Firefox, Safari, Opera, Edge, Chromium, Vivaldi, Brave, …).</p>',
    nojsMessage:
      'Za zagon te aplikacije potrebujete brskalnik z omogočenim JavaScriptom.',
    loadingMessage: 'Nalaganje…',
    appDescription:
      'Freemap je prosto dostopen spletni zemljevid za dejavnosti v naravi, ki temelji na podatkih OpenStreetMap',
    shortcutNames: ['Moji zemljevidi', 'Iskalnik poti', 'Objekti'],
  },
  {
    lang: 'fr',
    shared: frMessages,
    errorHtml:
      "<h1>Impossible de démarrer l'application</h1>" +
      "<p>Veuillez vous assurer d'utiliser une version récente d'un navigateur moderne (Google Chrome, Firefox, Safari, Opera, Edge, Chromium, Vivaldi, Brave, …).</p>",
    nojsMessage:
      'Un navigateur avec JavaScript activé est nécessaire pour exécuter cette application.',
    loadingMessage: 'Chargement…',
    appDescription:
      'Freemap est une carte outdoor en ligne gratuite basée sur les données OpenStreetMap',
    shortcutNames: ['Mes cartes', 'Planificateur d’itinéraire', 'Objets'],
  },
];

// A language with no row here gets no entry document and no web manifest, and
// silently falls back to the domain's default ones. This config is not
// type-checked, so nothing but this guard catches the omission.
const missingDocs = ['en', ...templatesConfig.langs].filter(
  (lang) => !entryDocs.some((doc) => doc.lang === lang),
);

if (missingDocs.length > 0) {
  throw new Error(`entryDocs has no entry for: ${missingDocs.join(', ')}`);
}

// The installable app carries the portal name of the domain it was installed
// from and the copy of the language its entry document was served in.
// `id`/`start_url` stay `/`, so an already-installed app keeps its identity.
const webManifestVariants: WebManifestVariant[] = entryDocs.flatMap((doc) =>
  sites.map((site) => ({
    filename: `manifest-${site}-${doc.lang}.webmanifest`,
    name: siteNames[site],
    lang: doc.lang,
    description: doc.appDescription,
    shortcutNames: doc.shortcutNames,
  })),
);

const baseUrlOf = (site: Site) =>
  ({ www: siteUrls[site] })[process.env['DEPLOYMENT']!] ??
  'https://local.freemap.sk:9000';

function htmlPluginProps(doc: EntryDoc, site: Site, filename: string) {
  return {
    filename,
    template: 'index.ejs',
    inject: false,
    templateParameters: {
      lang: doc.lang,
      site,
      title: expandSite(doc.shared.title, site),
      description: doc.shared.description,
      siteName: siteNames[site],
      baseUrl: baseUrlOf(site),
      errorHtml: doc.errorHtml,
      nojsMessage: doc.nojsMessage,
      loadingMessage: doc.loadingMessage,
    },
  };
}

const config: Configuration = {
  mode: prod ? 'production' : 'development',
  // @rspack/cli auto-enables lazy compilation for web-only targets unless we
  // set it explicitly. It injects an XHR-based client that pings
  // /_rspack/lazy/trigger (harmless Firefox "XML Parsing Error" noise) and,
  // worse, gets bundled into the `sw`/`upload-sw` service-worker entries where
  // XMLHttpRequest is unavailable. Opt out.
  lazyCompilation: false,
  context: path.resolve(__dirname, 'src'),
  entry: {
    main: './app/index.tsx',
    sw: './sw/sw.ts',
    'upload-sw': './sw/upload-sw.ts',
  },
  output: {
    clean: true,
    filename: (pathData) => {
      return pathData.chunk?.name === 'upload-sw' ||
        pathData.chunk?.name === 'sw'
        ? '[name].js'
        : '[name].[chunkhash].js';
    },
    chunkFilename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@app': path.resolve(__dirname, 'src/app'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@osm': path.resolve(__dirname, 'src/osm'),
    },
    extensionAlias: {
      '.js': ['.js', '.ts', '.tsx'],
    },
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        minify: TerserPlugin.swcMinify,
      }),
      // LightningCSS (replaces cssnano) so it also downlevels native CSS
      // nesting to flat selectors for the browsers in `cssTargets`.
      new rspack.LightningCssMinimizerRspackPlugin({
        minimizerOptions: { targets: cssTargets },
      }),
    ],
  },
  devServer: {
    hot: true,
    liveReload: false,
    server: {
      type: 'https',
      options: {
        key: path.resolve(__dirname, 'ssl/freemap.sk.key'),
        cert: path.resolve(__dirname, 'ssl/freemap.sk.pem'),
      },
    },
    host: '0.0.0.0',
    port: 9000,
    allowedHosts: 'all',
    client: {
      overlay: false,
    },
    static: false,
  },
  devtool: prod ? 'source-map' : 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'builtin:swc-loader',
        options: {
          jsc: {
            parser: {
              syntax: 'typescript',
              tsx: true,
            },
            transform: {
              react: {
                runtime: 'automatic',
                refresh: !prod,
              },
            },
          },
        },
        type: 'javascript/auto',
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|woff|ttf|eot|woff2)$/,
        type: 'asset/resource',
        // Keep the original filename in the emitted asset so URLs are readable
        // (also lets drawing points reference poi icons by name, not by hash).
        generator: { filename: '[name].[contenthash][ext]' },
      },
      {
        test: /\.scss$/,
        use: [
          styleOrExtractLoader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: scssModuleRegex,
                namedExport: false,
                exportLocalsConvention: 'as-is',
                localIdentName: prod
                  ? '[hash:base64:6]'
                  : '[path][name]__[local]',
              },
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                quietDeps: true,
              },
            } satisfies SassLoaderOptions,
          },
        ],
      },
      {
        test: /\.overpass$/,
        loader: '../overpass-loader',
      },
      {
        test: /\.css$/,
        oneOf: [
          {
            // CSS modules get a precise `*.module.d.css.ts` declaration emitted
            // next to each file (see cssModulesDtsLoader.js). It must sit
            // directly above css-loader so it receives css-loader's JS output
            // (the locals object), which it parses to extract the class names.
            test: cssModuleRegex,
            use: [
              styleOrExtractLoader,
              {
                loader: path.resolve('cssModulesDtsLoader.js'),
              },
              {
                loader: 'css-loader',
                options: {
                  modules: {
                    namedExport: false,
                    // camelCase kebab class names so they can be accessed as
                    // `classes.fooBar` rather than `classes['foo-bar']`. The
                    // dts loader picks up whatever keys css-loader emits.
                    exportLocalsConvention: 'camelCaseOnly',
                    localIdentName: prod
                      ? '[hash:base64:6]'
                      : '[path][name]__[local]',
                  },
                },
              },
            ],
          },
          {
            // Global stylesheets — no css-modules transform, no typings.
            use: [
              styleOrExtractLoader,
              {
                loader: 'css-loader',
                options: { modules: false },
              },
            ],
          },
        ],
      },
      {
        test: /\.md$/,
        use: [
          {
            loader: 'html-loader',
          },
          {
            loader: path.resolve('markdown-loader.js'),
          },
        ],
        type: 'javascript/auto',
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
        // Some published `.mjs` (e.g. react-qr-code) import dependencies
        // without a file extension; relax fully-specified ESM resolution so
        // those bare `qr.js/lib/QRCode`-style requests resolve.
        resolve: { fullySpecified: false },
      },
      {
        test: /\.(wasm|wgsl)$/,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    !prod &&
      new TsCheckerRspackPlugin({
        typescript: {
          configFile: path.resolve(__dirname, 'tsconfig.json'),
        },
      }),
    new RspackMarkdownDictPlugin({ dir: 'src/documents' }),
    new RspackSyncLanguagesPlugin({
      root: __dirname,
      script: path.resolve(
        __dirname,
        'translation-manager/sync-language-files.js',
      ),
    }),
    !prod && new ReactRefreshRspackPlugin(),
    new RspackManifestPlugin({
      fileName: 'assets-manifest.json',
      filter: (file) => {
        return (
          !file.name.endsWith('.map') &&
          !file.name.endsWith('.sw') &&
          file.name !== '.htaccess'
        );
      },
    }),
    new rspack.EnvironmentPlugin({
      ...(prod ? { NODE_ENV: 'production' } : null), // for react
      BROWSER: 'true',
      PREVENT_ADS: 'PREVENT_ADS' in process.env ? 'true' : '',
      DEPLOYMENT: process.env['DEPLOYMENT'] ?? null,
      FM_MAPSERVER_URL:
        process.env['FM_MAPSERVER_URL'] || 'https://outdoor.tiles.freemap.sk',
      OVERPASS_URL:
        process.env['OVERPASS_URL'] ||
        'https://overpass.freemap.sk/api/interpreter',
      OSM_API_URL:
        process.env['OSM_API_URL'] || 'https://api.openstreetmap.org',
      // Origin for the weather radar layer. Addressed directly: the upstream
      // authenticates by Referer and sends CORS for our origins, so nothing of
      // ours needs to sit in the path. Note both depend on the request
      // carrying a Referer — see the `referrerPolicy` in RadarLayer and in the
      // status fetch, since the app is served with `Referrer-Policy:
      // no-referrer`.
      WEATHER_RADAR_URL:
        process.env['WEATHER_RADAR_URL'] || 'https://cache.bigware.sk',
      // Where single OSM element (node/way/relation) lookups are resolved:
      // 'overpass' (default, internal instance) or 'osm-api' (public OSM API).
      OSM_ELEMENT_SOURCE: process.env['OSM_ELEMENT_SOURCE'] || 'overpass',
      BASE_URL:
        {
          www: 'https://www.freemap.sk',
        }[process.env['DEPLOYMENT']!] ?? 'https://local.freemap.sk:9000',
      API_URL:
        {
          www: 'https://backend.freemap.sk',
        }[process.env['DEPLOYMENT']!] ?? 'https://local.freemap.sk:3000',
      MATOMO_SITE_ID: { www: '1' }[process.env['DEPLOYMENT']!] ?? null,
      SENTRY_DSN:
        {
          www: 'https://6a5c1cf5b7a1d03dd6346c1a0bf60449@sentry.freemap.sk/2',
        }[process.env['DEPLOYMENT']!] ?? null,
      FB_APP_ID: { www: '681854635902254' }[process.env['DEPLOYMENT']!] ?? null,
      GRAPHHOPPER_URL:
        {
          www: 'https://graphhopper.freemap.sk',
        }[process.env['DEPLOYMENT']!] || 'https://graphhopper.freemap.sk', //'http://localhost:8989',
    }),
    // Entry documents: one per site × language, plus the plain `index.html`
    // that dev serves and the service worker keeps as the offline shell.
    new HtmlRspackPlugin(htmlPluginProps(enDoc, 'sk', 'index.html')),
    ...entryDocs.flatMap((doc) =>
      sites.map(
        (site) =>
          new HtmlRspackPlugin(
            htmlPluginProps(doc, site, `index-${site}-${doc.lang}.html`),
          ),
      ),
    ),
    new RspackWebManifestPlugin({
      base: 'manifest.webmanifest',
      variants: webManifestVariants,
    }),
    new rspack.CopyRspackPlugin({
      patterns: [
        {
          from: 'static/**/*',
          to: '[name][ext]',
          globOptions: { dot: true },
        },
      ],
    }),
    prod &&
      new rspack.CssExtractRspackPlugin({
        filename: '[name].[chunkhash].css',
        chunkFilename: '[name].[chunkhash].css',
      }),
  ].filter(Boolean),
};

export default config;
