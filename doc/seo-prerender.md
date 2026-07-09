# SEO bot-prerender architecture

SEO for this map SPA is a **bot-prerender** system, not server-side rendering. Crawlers are served static HTML snapshots; humans get the normal single-page app. Three coordinated parts must stay consistent.

## 1. `sitemap-generator/` — produces the static pages

Run with `pnpm gen-sitemap` (executes `sitemap-generator/index.ts` via `tsx`). It writes static HTML and sitemap files into the repo's `sitemap/` directory (gitignored). Filenames are **exactly the app query string**, e.g. `show=route-planner&lang=en`, so nginx can map a request straight to a file.

What it generates:

- **Per-language homepages** — `layers=X&lang=<lang>` for all 7 UI languages, cross-linked with `hreflang` + `x-default`. Title/description come from `src/translations/<lang>-shared.ts`.
- **Hub (layer/tool) landing pages** — `seo.ts` holds curated copy distilled from `src/static/llms.txt` for the main map layers and tools (e.g. `layers=O`, `show=route-planner`). Rendered in **sk + en**, with `WebPage` JSON-LD, canonical, Open Graph, and a cross-linked sibling list (the internal crawl graph).
- **Per-feature POI pages** — `objects.ts` fetches named OSM features for Slovakia from Overpass and renders one page per feature with `schema.org/Place` JSON-LD (type derived from tags), canonical, Open Graph, a back-link to the homepage, and the full tag table.
- **Document pages** — `layers=X&document=<name>&lang=sk` rendered from `src/documents/*.md`.
- **Sitemaps** — `sitemap-feat-*.txt` URL shards (chunked at 45 000 URLs — the per-file limit is 50 000) and the `sitemap-index.xml` that references them.

The generator imports name resolvers (`getGenericNameFromOsmElementSync`, `getNameFromOsmElement`) and tag→name maps from `src/osm/`. **It is not in the project `tsc` scope**, so type errors there are silent — it broke once when `getNameFromOsmElementSync` was split apart. Verify changes by running it.

## 2. nginx — routes bots to the prerenders

In `etc/nginx/sites-available/www.freemap.sk`, `location = /`:

- A known-crawler User-Agent allowlist sets a condition.
- A query-string allowlist `^[A-Za-z0-9=&_~-]+$` (no `/`, `.` or `%`) sets a second condition — this is the **path-traversal guard** for the `try_files` below.
- Bot + safe query → internal `rewrite ^ /__prerender last`.

`location = /__prerender` (internal) does:

```nginx
try_files "/sitemap/$args" "/sitemap/layers=X&lang=sk";
```

So a bot hitting `/?show=route-planner&lang=en` is served `sitemap/show=route-planner&lang=en`; if no prerender exists for the query, it falls back to the Slovak homepage. Humans (no crawler UA) always get the SPA.

## 3. rspack — language index variants

`rspack.config.ts` emits `index-<lang>.html` (en/sk/cs/hu/it/de/pl) with localized `<title>`/`<meta description>` from the `*-shared.ts` files.

## Invariants & deployment

- **All artifacts live under `/sitemap/`** so a normal app deploy (which only writes the compiled assets) never wipes them. The root copies were lost once exactly because they sat at `/`.
- **`robots.txt` (`src/static/`), `index.ejs`'s sitemap `<link>`, and the generator's `<loc>` must all point to `/sitemap/sitemap-index.xml`.**
- **Regenerate with `pnpm gen-sitemap`.** It first wipes the local `sitemap/` dir, so the output is always exactly the current set — pages for POIs deleted from OSM since the last run do not linger. The generator exits non-zero on a failed Overpass crawl, so chain any deploy step with `&&` to avoid shipping a partial crawl.
- **Deployment is manual** (rsync to a staging area, then ssh to the server and move the files into `/home/freemap/www/sitemap/`). The only requirement: the live `sitemap/` dir must end up _replaced_, not merged — otherwise stale pages from a previous generation survive on the server even though the local dir is clean. If your move replaces the directory wholesale, no `rsync --delete` is needed.
- `nginx -t` before reloading after editing the vhost.

## Keeping it in sync

`seo.ts` hub copy is hand-maintained and distilled from `src/static/llms.txt` and the layer registry (`src/shared/mapDefinitions.tsx`). **When layers or tools change, update `seo.ts` hubs in the same change set** — the same drift discipline that applies to `llms.txt` itself (see [CLAUDE.md](../CLAUDE.md)).
