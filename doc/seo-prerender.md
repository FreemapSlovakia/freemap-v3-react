# SEO bot-prerender architecture

SEO for this map SPA is a **bot-prerender** system, not server-side rendering. Crawlers are served static HTML snapshots; humans get the normal single-page app. Several coordinated parts must stay consistent.

## Two-domain model (freemap.sk + freemap.eu)

The same deployment is served under both `www.freemap.sk` and `www.freemap.eu` (identical files, one nginx `root /home/freemap/www`). They are **not** mirrors for SEO — each language is canonical on exactly one domain:

- **freemap.sk** — canonical for `sk` and `cs` (the `.sk` ccTLD is strongest in SK/CZ; the Slovak home).
- **freemap.eu** — canonical for every other language (`en, de, fr, it, hu, pl, sl`); the international brand used in foreign outreach. `x-default` → `freemap.eu/…lang=en`.

`langBase(lang)` in `seo.ts` is the single source of truth for this mapping (`SK_LANGS = ['sk','cs']`, everything else → `BASE_EU`). Because `appUrl()` routes through it, every canonical, `hreflang`, `og:url` and sitemap URL lands on the language's home domain automatically — the cluster spans both domains, which is what tells Google they are translations, not duplicates. All redirect-only domains (`freemap.cz`, `osm.sk`, `openstreetmap.sk`, the apexes) `301` into these two; see `etc/nginx/sites-available/`.

## 1. `sitemap-generator/` — produces the static pages

Run with `pnpm gen-sitemap` (executes `sitemap-generator/index.ts` via `tsx`). It writes static HTML and sitemap files into the repo's `sitemap/` directory (gitignored). Filenames are **exactly the app query string**, e.g. `show=route-planner&lang=en`, so nginx can map a request straight to a file. Filenames are the same regardless of domain (the language suffix already implies the domain).

What it generates:

- **Per-language homepages** — `layers=X&lang=<lang>` for all 9 UI languages, cross-linked with `hreflang` + `x-default`. Title/description come from `src/translations/<lang>-shared.ts`.
- **Hub (layer/tool) landing pages** — `seo.ts` holds curated copy distilled from `src/static/llms.txt` for the main map layers and tools (e.g. `layers=O`, `show=route-planner`). Rendered in **sk + en** (`HUB_LANGS`) for now, with `WebPage` JSON-LD, canonical, Open Graph, and a cross-linked sibling list. _Expanding hubs to all 9 languages is pending — it needs the `Hub.title`/`description` records translated (≈19 hubs × title+description per language)._
- **Per-feature POI pages** — `objects.ts`, see below.
- **Document pages** — `layers=X&document=<name>&lang=<lang>` rendered from `src/documents/<key>.<lang>.md`; each document appears only in the languages it has a markdown file for.
- **Sitemaps** — two indexes:
  - `sitemap-index.xml` → freemap.sk: `sitemap-core.txt` (sk/cs homepages, hubs, documents, `llms.txt`) + the `sitemap-feat-<lang>-*.txt` POI shards for sk/cs.
  - `sitemap-index-eu.xml` → freemap.eu: `sitemap-core-eu.txt` (international pages, `llms.txt`) + POI shards for the eu languages.
  - Shards are chunked at 45 000 URLs (the per-file limit is 50 000). `index.ts` routes every URL/shard to the sk or eu bucket by its home domain.

The generator imports name resolvers (`getGenericNameFromOsmElementSync`, `getNameFromOsmElement`, `getOsmMapping`) and tag→name maps from `src/osm/`. **It is not in the project `tsc` scope**, so type errors there are silent (it runs via `tsx`) — verify changes by running it, or by a small `tsx` smoke script.

### Per-feature POI pages (`objects.ts`) — multi-country

`COUNTRIES` drives generation: for each country, features are fetched from Overpass by area id (`3600000000 + relation id`) and rendered as one page per feature in that country's **most-prominent language**, with `schema.org/Place` JSON-LD (type derived from tags), canonical (via `appUrl`, so the right domain), Open Graph, a homepage back-link, and the full tag table.

| Country | Lang | Area id | Category set |
| --- | --- | --- | --- |
| Slovakia | `sk` | 3600014296 | **full** (outdoor + admin/amenities/buildings/landuse/leisure/man_made/shops) |
| Czechia | `cs` | 3600051684 | outdoor-only |
| Hungary | `hu` | 3600021335 | outdoor-only |
| Poland | `pl` | 3600049715 | outdoor-only |
| Italy | `it` | 3600365331 | outdoor-only |

- **One language per country** — never all 9 (that would be a thin-content / crawl-budget explosion, and locals search in the local language anyway). Domain follows the language via `langBase`, so e.g. Polish POI pages are `freemap.eu/?…&lang=pl` and land in `sitemap-index-eu.xml`; Czech ones stay on freemap.sk.
- **Outdoor-only for non-SK countries** — `outdoorQueries()` = hiking/bicycle/ski routes, high-value **natural landmarks** (`peak|volcano|saddle|ridge|arete|spring|hot_spring|geyser|cave_entrance|cliff|arch|glacier`), protected areas, alpine/wilderness huts. Deliberately **excludes** `buildings`/`amenities`/`shops`/`landuse` and the unrestricted `natural=*` set abroad: those run to hundreds of thousands / millions of thin pages in big countries (Overpass load, generator OOM, disk, crawl budget). Slovakia keeps the `fullQueries()` set (unchanged, already indexed, including broad `naturals`).
- **Per-language page copy** — the `COPY` dictionary (`onMap`, `contact`, `openingHours`, `intro`, nav labels, …). Only the generated languages need an entry. These are hand-translated; **the Slavic and Italian wordings warrant a native review** before leaning on them for ranking.
- **Adding a country** = one `COUNTRIES` row (area id + language) + a `COPY` entry (if the language is new) + confirm `getOsmMapping(lang)` resolves (the `osmTagToNameMapping-<lang>.messages` module and the `getOsmMapping` allowlist in `osmNameResolver.ts`). Roll out one country at a time and watch GSC indexing before adding the next.

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

So a bot hitting `/?show=route-planner&lang=en` is served `sitemap/show=route-planner&lang=en`; if no prerender exists (or bare `/`), it falls back to the domain's homepage prerender (Slovak on freemap.sk, English on freemap.eu). Humans (no crawler UA) always get the SPA.

**Canonical is not set in nginx** — each prerender file carries its own `<link rel="canonical">` (cross-domain, from `appUrl`), so a page served on the "wrong" host still points Google at its home domain. (There is no per-domain canonical `Link` header; the old hardcoded-SK one was removed.)

## 3. rspack — language index variants

`rspack.config.ts` emits `index-<lang>.html` with localized `<title>`/`<meta description>` from the `*-shared.ts` files.

## Invariants & deployment

- **All artifacts live under `/sitemap/`** so a normal app deploy (which only writes the compiled assets) never wipes them. The root copies were lost once exactly because they sat at `/`.
- **`robots.txt` (`src/static/`) lists both indexes** — `https://www.freemap.sk/sitemap/sitemap-index.xml` and `https://www.freemap.eu/sitemap/sitemap-index-eu.xml`. `index.ejs`'s sitemap `<link>` and the generator's `<loc>`s must stay consistent with these paths.
- **GSC:** submit `sitemap-index.xml` under the `freemap.sk` property and `sitemap-index-eu.xml` under a `freemap.eu` property (add it if missing).
- **Regenerate with `pnpm gen-sitemap`.** It first wipes the local `sitemap/` dir, so the output is always exactly the current set — POIs deleted from OSM since the last run do not linger. It exits non-zero on a failed Overpass crawl, so chain any deploy step with `&&` to avoid shipping a partial crawl.
- **Deployment is manual and serves both domains at once** (both vhosts share `root /home/freemap/www`): rsync the local `sitemap/` into `freemap-fm6:www/sitemap/` with `--delete` (the live dir must end up _replaced_, not merged, or stale pages survive).
- `nginx -t` before reloading after editing a vhost.

## Keeping it in sync

`seo.ts` hub copy is hand-maintained and distilled from `src/static/llms.txt` and the layer registry (`src/shared/mapDefinitions.tsx`). **When layers or tools change, update `seo.ts` hubs in the same change set** — the same drift discipline that applies to `llms.txt` itself (see [CLAUDE.md](../CLAUDE.md)).
