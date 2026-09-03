# SEO bot-prerender architecture

SEO for this map SPA is a **bot-prerender** system, not server-side rendering. Crawlers are served static HTML snapshots; humans get the normal single-page app. Several coordinated parts must stay consistent.

## Two-domain model (freemap.sk + freemap.eu)

The same deployment is served under both `www.freemap.sk` and `www.freemap.eu` (identical files, one nginx `root /home/freemap/www`). They are **not** mirrors for SEO — each language is canonical on exactly one domain:

- **freemap.sk** — canonical for `sk` and `cs` (the `.sk` ccTLD is strongest in SK/CZ; the Slovak home).
- **freemap.eu** — canonical for every other language (`en, de, fr, it, hu, pl, sl`); the international brand used in foreign outreach. `x-default` → `freemap.eu/…lang=en`.

`langBase(lang)` in `seo.ts` is the single source of truth for this mapping (`SK_LANGS = ['sk','cs']`, everything else → `BASE_EU`). Because `appUrl()` routes through it, every canonical, `hreflang`, `og:url` and sitemap URL lands on the language's home domain automatically — the cluster spans both domains, which is what tells Google they are translations, not duplicates. All redirect-only domains (`freemap.cz`, `osm.sk`, `openstreetmap.sk`, the apexes) `301` into these two; see `etc/nginx/sites-available/`.

## 1. `sitemap-generator/` — produces the static pages

Run with `pnpm gen-sitemap` (executes `sitemap-generator/index.ts` via `tsx`). It writes static HTML and sitemap files into the repo's `sitemap/` directory (gitignored). Filenames are **exactly the app query string**, e.g. `tool=route-planner&lang=en`, so nginx can map a request straight to a file. Filenames are the same regardless of domain (the language suffix already implies the domain).

What it generates:

- **Per-language homepages** — `layers=X&lang=<lang>` for all 9 UI languages, cross-linked with `hreflang` + `x-default`. Title/description come from `src/translations/<lang>-shared.ts`.
- **Hub (layer/tool) landing pages** — `seo.ts` holds curated copy distilled from `src/static/llms.txt` for the main map layers and tools (e.g. `layers=O`, `tool=route-planner`). Rendered in **sk + en** (`HUB_LANGS`) for now, with `WebPage` JSON-LD, canonical, Open Graph, and a cross-linked sibling list. Curated copy writes the two names as placeholders, expanded by `expandNames(text, lang)`: `{brand}` → the home domain (`Freemap.sk` for sk/cs, `Freemap.eu` otherwise) and `{site}` → the portal name (`Freemap Slovakia` / `Freemap Europe`). Never hardcode either in the copy, or `freemap.eu` pages advertise the wrong site. The same pair drives the `<title>` suffix, the nav breadcrumb, `og:site_name` and the JSON-LD `name` — in `objects.ts`'s POI pages too. The homepage `<title>`/description come from `src/translations/<lang>-shared.ts`, where each language's title already carries the name for its own domain. _Expanding hubs to all 9 languages is pending — it needs the `Hub.title`/`description` records translated (≈19 hubs × title+description per language)._
- **Per-feature POI pages** — `objects.ts`, see below.
- **Document pages** — `layers=X&document=<name>&lang=<lang>` rendered from `src/documents/<key>.<lang>.md`; each document appears only in the languages it has a markdown file for.
- **Sitemaps** — two indexes:
  - `sitemap-index.xml` → freemap.sk: `sitemap-core.txt` (sk/cs homepages, hubs, documents, `llms.txt`) + the `sitemap-feat-<lang>-*.txt` POI shards for sk/cs.
  - `sitemap-index-eu.xml` → freemap.eu: `sitemap-core-eu.txt` (international pages, `llms.txt`) + POI shards for the eu languages.
  - Shards are chunked at 45 000 URLs (the per-file limit is 50 000). `index.ts` routes every URL/shard to the sk or eu bucket by its home domain.

The generator imports name resolvers (`getGenericNameFromOsmElementSync`, `getNameFromOsmElement`, `getOsmMapping`) and tag→name maps from `src/osm/`. **It is not in the project `tsc` scope**, so type errors there are silent (it runs via `tsx`) — verify changes by running it, or by a small `tsx` smoke script.

### Per-feature POI pages (`objects.ts`) — multi-country

`COUNTRIES` drives generation: for each country, features are read from the OSM database by boundary relation and rendered as one page per feature in that country's **most-prominent language**, with `schema.org/Place` JSON-LD (type derived from tags), canonical (via `appUrl`, so the right domain), Open Graph, a homepage back-link, and the full tag table.

**It queries Postgres directly, not the HTTP API** (`osmDb.ts`) — `/v1/features` caps a response at 2000 features, and a country runs to hundreds of thousands. The table is `osm_object`, the same one osm.freemap.sk serves from; see the freemap-osm-api repo on fm5 for its schema. Connection comes from the standard libpq environment variables, defaulting to the socket, database and role an fm5 run wants — see [Running the generator](#running-the-generator).

Each category is two queries: one for the matching ids (a GIN scan on `kv` ANDed with the boundary's bbox off the geometry index, then the exact boundary test), then tags and label points in batches of 1000 — which is what keeps a country's worth of features from having to fit in memory at once. Categories are `OsmFilter`s (`all`/`any`/`has`/`type`) rather than Overpass QL; `has: ['name']` is rechecked against `tags` instead of going through `kv`, since `name` is on most of Europe and narrows nothing.

The boundary test is `ST_Intersects` **and `NOT ST_Touches`**: neighbouring polygons share the border line, so intersection alone gives Slovakia ~400 foreign municipalities with Slovak-language pages. `NOT ST_Touches` still keeps a route that crosses the border, which testing the label point instead would drop (2916 hiking routes vs 2777). It costs nothing measurable — it only runs on the rows the indexes already left.

Sitemap shards list the pages the run actually wrote, not the ids it fetched: the tag batches trail the id query by minutes, and anything deleted from OSM in between would otherwise be advertised without a page behind it.

| Country | Lang | Boundary relation | Category set |
| --- | --- | --- | --- |
| Slovakia | `sk` | 14296 | **full** (outdoor + admin/amenities/buildings/landuse/leisure/man_made/shops) |
| Czechia | `cs` | 51684 | outdoor-only |
| Hungary | `hu` | 21335 | outdoor-only |
| Poland | `pl` | 49715 | outdoor-only |
| Italy | `it` | 365331 | outdoor-only |

- **One language per country** — never all 9 (that would be a thin-content / crawl-budget explosion, and locals search in the local language anyway). Domain follows the language via `langBase`, so e.g. Polish POI pages are `freemap.eu/?…&lang=pl` and land in `sitemap-index-eu.xml`; Czech ones stay on freemap.sk.
- **Outdoor-only for non-SK countries** — `OUTDOOR_CATEGORIES` = hiking/bicycle/ski routes, high-value **natural landmarks** (`peak|volcano|saddle|ridge|arete|spring|hot_spring|geyser|cave_entrance|cliff|arch|glacier`), protected areas, alpine/wilderness huts. Deliberately **excludes** `buildings`/`amenities`/`shops`/`landuse` and the unrestricted `natural=*` set abroad: those run to hundreds of thousands / millions of thin pages in big countries (query cost, disk, crawl budget). Slovakia keeps the `FULL_CATEGORIES` set (unchanged, already indexed, including broad `naturals`).
- **Per-language page copy** — the `COPY` dictionary (`onMap`, `contact`, `openingHours`, `intro`, nav labels, …). Only the generated languages need an entry. These are hand-translated; **the Slavic and Italian wordings warrant a native review** before leaning on them for ranking.
- **Adding a country** = one `COUNTRIES` row (boundary relation + language) + a `COPY` entry (if the language is new) + confirm `getOsmMapping(lang)` resolves (the `osmTagToNameMapping-<lang>.messages` module and the `getOsmMapping` allowlist in `osmNameResolver.ts`). Roll out one country at a time and watch GSC indexing before adding the next.

### Running the generator

**It runs on fm5, as the `freemap` user.** That is where the OSM database is, and Postgres there takes local connections only; as `freemap` the read-only role peer-authenticates over the socket, which is what `osmDb.ts` defaults to, so nothing needs to be in the environment.

```sh
pnpm deploy-sitemap     # sync-language-files → generate → rsync --delete to fm6
```

`gen-sitemap` alone stops after writing `sitemap/`. Both run `sync-language-files` first: `src/osm/osmTagToNameMapping-*.messages.ts` are generated and gitignored (only `-en` is tracked), so a fresh checkout has no name mappings without it.

The rsync target is `SITEMAP_RSYNC_TARGET`, default `freemap-fm6:www/sitemap/` — the same ssh alias `pnpm deploy` uses, so fm5's `~freemap/.ssh/config` needs a `Host freemap-fm6` entry (`fm6.freemap.sk`, port 21122, user `freemap`) and its key in fm6's `authorized_keys`. `--delete` is the point: the live directory must end up _replaced_, not merged, or pages for POIs deleted from OSM survive. A failed crawl exits non-zero, and the `&&` in the script is what keeps that from rsyncing a partial run over good pages.

Scale, as of the Europe import: **317 747 pages** (SK 143 090, IT 104 004, CZ 30 309, PL 26 873, HU 13 471), about 1.3 GB. Roughly 3 minutes of that is database time; the rest is rendering and writing the files.

**Two guards stand between a bad crawl and `rsync --delete`**, because the dangerous failure is not a crash but a *successful* run that produced nothing — a database mid-import, or a boundary relation with no usable geometry. A country that yields zero features throws, and so does a total under `MIN_TOTAL_PAGES` (200 000, against today's 317 747). Neither catches a database that is loaded but only slightly short, so raise the floor if the corpus grows a lot.

**Scheduled runs** — `.github/workflows/sitemap.yml`, monthly plus `workflow_dispatch`, on a **self-hosted runner on fm5 installed under the `freemap` account** (labels `self-hosted`, `fm5`). Running as any other user loses both the peer auth and the fm6 ssh alias. It is separate from `deploy.yml` because it regenerates from OSM data rather than from a push, and writes `www/sitemap/` rather than `www/`.

GitHub holds the schedule and dispatches to the runner, so: it fires only from the workflow file on the **default branch**, only while the runner service is up, and it never writes to the repository — each run is a fresh `main` checkout, rsync out, nothing back. `actions/checkout` cleans the workspace (`git clean -ffdx`) every run, so `node_modules` is reinstalled each time; that is cheap because pnpm's store lives outside the workspace and survives. A systemd timer on fm5 would do the same job without depending on GitHub, at the cost of the run log and the manual trigger.

**Running it from a dev box** is still possible but is not the normal path: tunnel Postgres (`ssh -L 5433:127.0.0.1:5432 fm5` — 5432 is usually taken by a local Postgres), then `PGHOST=127.0.0.1 PGPORT=5433 pnpm deploy-sitemap` with the `freemap` role's password in `~/.pgpass`. Both the tags and the 320 000 files then cross your uplink.

## 2. nginx — routes bots to the prerenders

In `etc/nginx/sites-available/www.freemap.sk` and `www.freemap.eu`, `location = /`:

- A known-crawler User-Agent allowlist sets `$prerender = bot`.
- A **path-traversal guard** — `if ($args ~ "[/.%]") { … -unsafe }` — demotes any query string containing `/`, `.` or `%`, so `$args` cannot escape `/sitemap/` in the `try_files` below.
- Bot + safe query → internal `rewrite ^ /__prerender last`.

`location = /__prerender` (internal) does:

```nginx
try_files "/sitemap/$args" "/sitemap/layers=X&lang=sk";   # freemap.sk
try_files "/sitemap/$args" "/sitemap/layers=X&lang=en";   # freemap.eu
```

So a bot hitting `/?tool=route-planner&lang=en` is served `sitemap/tool=route-planner&lang=en`; if no prerender exists (or bare `/`), it falls back to the domain's homepage prerender (Slovak on freemap.sk, English on freemap.eu). Humans (no crawler UA) always get the SPA.

**Canonical is not set in nginx** — each prerender file carries its own `<link rel="canonical">` (cross-domain, from `appUrl`), so a page served on the "wrong" host still points Google at its home domain. (There is no per-domain canonical `Link` header; the old hardcoded-SK one was removed.)

Humans fall through to a `try_files` in the same block that picks the entry document for the domain and the browser's language:

```nginx
try_files /index-sk-$ui_lang.html /index-sk-sk.html;   # freemap.sk
try_files /index-eu-$ui_lang.html /index-eu-en.html;   # freemap.eu
```

`$ui_lang` comes from the `map` in `etc/nginx/conf.d/ui-language.conf`, which captures the **first tag** of `Accept-Language` (nginx cannot weigh q-values) if it is two lowercase letters, else `""`. It deliberately does not enumerate the built languages — an unbuilt tag finds no file and drops to the fallback on its own, so nginx has no language list to keep in sync — and the `[a-z]{2}` shape is what makes the value safe to interpolate into the path. The block sends `Vary: Accept-Language`.

## 3. rspack — entry-document variants

The two domains are served from one directory, so `rspack.config.ts` emits one entry document per **site × language** — `index-<site>-<lang>.html`, site being `sk` or `eu` — from a single `entryDocs` table. `<title>`/`<meta description>` come from the `*-shared.ts` files; the `{site}` placeholder in each title is expanded to that site's portal name, which also fills `og:site_name` and `application-name`, while `og:url`/`og:image` get the site's own base URL.

The portal name follows the **domain**, never the language: every language on freemap.sk says Freemap Slovakia, every language on freemap.eu says Freemap Europe. `src/shared/sites.ts` is the single source of truth for both names and both base URLs; the sitemap generator derives them from the page language (which implies its home domain via `langBase`) and the running SPA derives them from `location.hostname` in `useHtmlMeta`, which re-expands the title once the app boots.

Plain `index.html` is still emitted (English copy, Slovak name): it is what the dev server serves and what the service worker keeps as the offline shell (`src/sw/sw.ts`, `src/shared/offlineStaticCache.ts` pin that exact name).

The web manifest is emitted over the same matrix — `manifest-<site>-<lang>.webmanifest`, rendered by `RspackWebManifestPlugin` from the single base document `src/manifest.webmanifest` (kept out of `static/`, which is copied verbatim). The base holds everything site- and language-independent — icons, `share_target`, `protocol_handlers`, `file_handlers`, the shortcut URLs; the variant supplies `name` (from the site), and `lang`, `description` plus the shortcut labels (from the `entryDocs` row). Shortcut labels are matched **positionally** to the base's `shortcuts`, and the plugin throws if the counts disagree, so adding a shortcut fails the build rather than shipping an unlabeled one.

Each entry document links its own manifest, which is what makes the install prompt and the home-screen icon's context menu follow the browser language: nginx already picked the language when it picked the entry document. `id` and `start_url` stay `/`, so an already-installed app keeps its identity and only its copy changes — Chrome refreshes it on its own manifest-update schedule, not immediately.

## Invariants & deployment

- **All artifacts live under `/sitemap/`** so a normal app deploy (which only writes the compiled assets) never wipes them. The root copies were lost once exactly because they sat at `/`.
- **`robots.txt` (`src/static/`) lists both indexes** — `https://www.freemap.sk/sitemap/sitemap-index.xml` and `https://www.freemap.eu/sitemap/sitemap-index-eu.xml`. `index.ejs`'s sitemap `<link>` and the generator's `<loc>`s must stay consistent with these paths.
- **GSC:** submit `sitemap-index.xml` under the `freemap.sk` property and `sitemap-index-eu.xml` under a `freemap.eu` property (add it if missing).
- **The entry-document `no-store` rule matches by name** — `location ~ ^/(index(-(sk|eu)-\w\w)?\.html|assets-manifest\.json)$` in both vhosts. Renaming the variants without widening that regex drops them to heuristic caching, which strands clients on a previous build's asset hashes.
- **That same block serves `/`.** `try_files` performs an internal redirect, so the entry document is re-matched against the locations and takes its headers from there — `location = /`'s own `add_header`s never reach a served entry document. Anything meant for the homepage (`Vary`, and emphatically anything like `X-Robots-Tag: noindex`) has to account for that; the raw filenames are kept out of search via `robots.txt` instead.
- **Regenerate and deploy with `pnpm deploy-sitemap`** on fm5 — see [Running the generator](#running-the-generator). It first wipes the local `sitemap/` dir, so the output is always exactly the current set: POIs deleted from OSM since the last run do not linger. One deploy serves both domains (both vhosts share `root /home/freemap/www`).
- `nginx -t` before reloading after editing a vhost.

## Keeping it in sync

`seo.ts` hub copy is hand-maintained and distilled from `src/static/llms.txt` and the layer registry (`src/shared/mapDefinitions.tsx`). **When layers or tools change, update `seo.ts` hubs in the same change set** — the same drift discipline that applies to `llms.txt` itself (see [CLAUDE.md](../CLAUDE.md)).

**Adding a UI language** also means an `entryDocs` row in `rspack.config.ts` — the bootstrap copy for the no-JS / error / loading states, plus the manifest's `appDescription` and shortcut labels. Miss it and that language falls back to the domain's default entry document with no error anywhere; `rspack.config.ts` is outside `tsconfig.json`, so `tsc` cannot help. A build-time guard against `translation-manager/templates.json` covers it, which is how `sl` and `fr` stopped being missing. nginx needs no change — its language map is generic.
