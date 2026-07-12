# Freemap Slovakia Web Application

Source of [www.freemap.sk](https://www.freemap.sk), the web map portal maintained by [OZ Freemap Slovakia](https://oz.freemap.sk).

Freemap is a free, non-commercial web map application built on OpenStreetMap data. Its focus is a detailed outdoor map for hiking, cycling, cross-country skiing and horse riding across Europe, complemented by many additional base and overlay layers and by tools for search, route planning, drawing and measurement, GPX viewing, live tracking, personal maps, map embedding, and export.

This repository is the **frontend** — a React single-page application. It talks to:

- the [Freemap API server](https://github.com/FreemapSlovakia/freemap-v3-nodejs-backend) (`freemap-v3-api`) for accounts, photos, tracking, saved maps and purchases, and
- external tile, routing (GraphHopper) and geocoding (Nominatim / Overpass) services.

## Tech stack

- **React 19** + **Redux Toolkit** (application state is reflected in the URL hash)
- **Leaflet** / **react-leaflet** with **MapLibre GL** for vector layers
- **TypeScript**, type-checked with `tsc`
- **rspack** bundler, **Biome** for linting/formatting, **pnpm** as the package manager
- **Zod** schemas for validation (see [CLAUDE.md](./CLAUDE.md) for conventions)

## Requirements

- Node.js 22+
- [pnpm](https://pnpm.io/)
- A running [Freemap API server](https://github.com/FreemapSlovakia/freemap-v3-nodejs-backend) for features that depend on the backend (login, photos, tracking, saved maps, export); the map itself renders without it.

## Compiling and running in development mode

1. Map `local.freemap.sk` to `127.0.0.1` in your system hosts file (on Linux and macOS this is `/etc/hosts`):

   ```
   127.0.0.1 local.freemap.sk
   ```

1. Install dependencies:

   ```bash
   pnpm install
   ```

1. Start the dev server (it compiles protobufs, syncs language files, and rebuilds on change):

   ```bash
   pnpm start
   ```

1. Trust the [development CA certificate](./ssl/Freemap_CA.crt) in your browser (the dev server is served over HTTPS).

1. Open the application at <https://local.freemap.sk:9000/>.

## Building for production

The build target is selected with the `DEPLOYMENT` environment variable:

- _unset_ or `dev` — development build for `local.freemap.sk` (uses local backend / base URLs).
- `www` — production build for `www.freemap.sk` (wires up the production backend, GraphHopper, Matomo, Sentry and Facebook app IDs).
- any other value (e.g. `next`) — a production-optimized build that still uses the local / default URLs.

```bash
pnpm install
DEPLOYMENT=www pnpm build
```

The static web resources are emitted into the `dist/` directory.

Deploying `www.freemap.sk` is done with the `dep` script, which runs a `www` production build, injects and uploads Sentry source maps, and rsyncs `dist/` to the server:

```bash
pnpm dep
```

### Server (nginx) configuration

The production nginx site configs are checked into this repo under [`etc/nginx/sites-available/`](./etc/nginx/sites-available/) as a reference for what is actually deployed:

- [`www.freemap.sk`](./etc/nginx/sites-available/www.freemap.sk) — the main site.
- [`www.freemap.eu`](./etc/nginx/sites-available/www.freemap.eu) — the `.eu` mirror (additionally allows CORS for the GlitchTip/Sentry origin).

Both serve the static build from `/home/freemap/www` and share the same **cache-header policy**, which is critical to get right — mismatched headers pin users to stale hashed asset names and break the layout after a deploy:

- **Entry HTML** (`index*.html`, the `/` redirect), **service workers** (`sw.js`, `upload-sw.js`) and `assets-manifest.json` are served `Cache-Control: no-store, max-age=0` — they are unhashed and must never go stale.
- **Content-addressed assets** (rspack emits 16-char `[contenthash]`/`[chunkhash]` names) are `max-age=31536000, immutable`.
- `*.png` / `*.jpg` get a one-year `max-age` (without `immutable`).

The configs also handle: HSTS / `Referrer-Policy` headers, HTTP→HTTPS redirect and HTTP/3 (QUIC) via Certbot-managed TLS, per-user directory listings under `/~<user>/`, search-engine sitemap rewrites for bots on `/`, `/mbtiles` offline-map downloads, and a reverse proxy for `/tiles/parametric-shading`.

When changing build-output naming, the service worker, or the asset manifest, update these configs in the same change set.

### Scheduled jobs (systemd)

Server-side scheduled jobs are checked in under [`etc/systemd/system/`](./etc/systemd/system/) as a reference for what is actually deployed (like the nginx configs above).

- [`freemap-wikimedia-import.service`](./etc/systemd/system/freemap-wikimedia-import.service) / [`freemap-wikimedia-import.timer`](./etc/systemd/system/freemap-wikimedia-import.timer) — the **monthly Wikimedia Commons photo import**. It runs on the API server (`fm6`) as the `freemap` user and executes the backend's built importer (`build/wikimedia/importWikimedia.js` in [`freemap-v3-nodejs-backend`](https://github.com/FreemapSlovakia/freemap-v3-nodejs-backend)), which streams the monthly Commons `geo_tags` + `page` + `image` + Structured-Data (`mediainfo`) dumps into the `wikimediaPicture` table — filtered to real photographs (a photo-extension whitelist plus title filters that drop orthophoto/DOP survey grids and astronaut/space imagery) — and **atomically swaps** the fresh table in (zero downtime; the independent `wikimediaRating` / `wikimediaComment` tables are untouched). Alongside each photo's coordinates it imports the metadata the map colorizes by (and the direction markers): `capturedAt` (EXIF `DateTimeOriginal`, falling back to the SDC `P571` inception date, since the image dump externalizes rich EXIF out of reach), `uploadedAt`, `authorId` (numeric Commons actor id), `azimuth` (EXIF `GPSImgDirection`) and `license` (SDC `P275`). The uploader's *name* isn't in any public dump, so it stays client-side via the Commons API.

  Install / update on the server:

  ```bash
  sudo cp etc/systemd/system/freemap-wikimedia-import.{service,timer} /etc/systemd/system/
  sudo systemctl daemon-reload
  sudo systemctl enable --now freemap-wikimedia-import.timer
  systemctl list-timers freemap-wikimedia-import.timer   # next run
  sudo systemctl start freemap-wikimedia-import.service   # run once now
  journalctl -u freemap-wikimedia-import.service -f       # watch
  ```

  Notes: `TimeoutStartSec=0` is required (the import runs several hours — it downloads and streams the ~17 GB `image` dump and the ~75 GB Structured-Data `mediainfo` dump on top of `geo_tags` + `page` — well past the default oneshot timeout); it runs `node` directly with `EnvironmentFile=/etc/freemap.conf` (the same env the API service uses, supplying `MARIADB_*`) rather than the `dotenvx`-wrapped `pnpm run import:wikimedia`, so no decryptable `.env` is needed on the server; `Nice`/`IOSchedulingClass=idle` keep it from starving the live DB. It runs whatever `build/` is deployed, so the filters stay current with each backend deploy.

## Environment variables

Most deployment-specific values are derived from `DEPLOYMENT` (see above). The remaining overrides:

- `FM_MAPSERVER_URL` — base URL of the Mapnik tile server, **without** a trailing slash (default `https://outdoor.tiles.freemap.sk`; e.g. `http://localhost:4000` for local rendering).
- `PREVENT_ADS` — if set (to any value), disables the ad banner.

## Documentation

Deeper reference docs live in [`doc/`](./doc/):

- [Drawing feature export/import format mapping](./doc/drawing-export-mapping.md) — how points, lines and polygons round-trip through GPX and GeoJSON, including the curated icon mappings for Garmin / OsmAnd / Locus.

[`src/static/llms.txt`](./src/static/llms.txt) is a hand-maintained, user-facing description of the application (its functions, modals and map layers) for AI assistants, served at [www.freemap.sk/llms.txt](https://www.freemap.sk/llms.txt) per the [llmstxt.org](https://llmstxt.org) convention. Keep it in sync when changing user-visible behavior — see [CLAUDE.md](./CLAUDE.md).

Contributor notes for Claude Code (workflow, conventions): [CLAUDE.md](./CLAUDE.md).

## Translation (i18n)

The English master is `src/translations/en.tsx`; other locales are edited via their `*.template.tsx` files (the plain `*.tsx` files are generated — see [CLAUDE.md](./CLAUDE.md)).

Files holding translatable text:

- [rspack.config.ts](rspack.config.ts) — texts in `htmlPluginProps`
- [src/translations/en-shared.json](src/translations/en-shared.json)
- [src/translations/en.tsx](src/translations/en.tsx)
- [src/components/supportUsModal/translations/en.tsx](src/components/supportUsModal/translations/en.tsx)
- [src/globalErrorHandler.ts](src/globalErrorHandler.ts) — bottom error message
- [src/osm/osmTagToNameMapping-en.ts](src/osm/osmTagToNameMapping-en.ts)
- <https://github.com/FreemapSlovakia/freemap-mapnik/blob/develop/legend.js>

## License

[Apache-2.0](./LICENSE)
