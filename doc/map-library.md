# Map library

The plan and the current state of the **map library**: a registry of maps that
users install into the app, instead of every known map sitting in the menus.
Branch `map-library`. Read this before working on the library, on how layer
definitions load, or on a map's install state.

## The problem and the decision

There are thousands of usable maps (national WMS services, imagery, historic
maps …). Putting them all in the menus makes the menus unusable, even with the
menu filter, country flags and coverage hints. Instead:

- **Every non-custom map is a library entry**, built-ins included. Built-ins
  and library maps are equal in the UI: the user installs or uninstalls any of
  them, and places an installed one in the toolbar and/or the menu.
- **Visibility levels:** library ⊃ installed ("Show all" in the map menu) ⊃
  {toolbar, menu}. Toolbar and menu are independent flags: a map can be in the
  toolbar only.
- **Uninstalling controls only what the UI offers, never whether a map works.**
  An uninstalled map is out of the toolbar, the menu (Show all included), its
  keyboard shortcut, the search box and the offline-map/export pickers. A link
  naming it in `layers=`, a map combination or the default `X` base still
  renders it, and the menu lists it while it is on so it can be switched off.
- **Library maps are not custom maps.** A custom map is a frozen copy in the
  account settings, has no credits, coverage or licence, and travels in links
  as JSON (`custom-layers=`). A library map is stored by reference (its id), so
  a fix in the registry reaches everyone, and links carry only the id. Custom
  maps stay the way out of the library: a future **Copy as custom map** action,
  and a "search further" path (ArcGIS search, a WMS GetCapabilities URL) whose
  unvetted results become custom maps.
- **Ids are stable forever.** Existing ids stay (`X`, `S`, `WKA`, `l2`, … —
  old links and `LAYER_ALIASES` depend on them). A new id is generated once
  (e.g. a truncated hash of the source key, collision-checked), **stored** in a
  committed table, and never recomputed or reused — not a hash of the content
  (a URL fix would change it), not the source's own id (ELI renames ids, and
  one service can sit in several catalogs). It must not be able to collide with
  a custom map id: those are 6 random lowercase base-36 chars (`makeType()` in
  `CustomMapsModal.tsx`), so e.g. `[0-9A-Z]{5}` with at least one letter is
  safe. Links join ids with `~`, so any id works in `layers=`.
- **Definitions stay in TypeScript** (types validate them; icons, `process.env`
  URLs and translated names keep working) and load **per map, lazily**.

## What is built

### Step 1 — the install flag (commit `4d86eaf8`)

- `LayerSettings.installed?: boolean` in `src/features/map/model/actions.ts`;
  missing means installed. Synced to the account with the rest of
  `layersSettings`.
- `isLayerInstalled` / `isLayerOffered` (installed, or on the map) in
  `src/shared/mapLibrary/installed.ts`.
- Honoured by `MapSwitchButton`, `keyboardHandler`, `commandDefinitions` (search
  box), `CacheTilesForm` (an edited offline map keeps its own source),
  `OfflineMapExportModal` and `MapCombinationForm`'s pickers.
- **Layers configuration** (`MapLayersSettings.tsx`) has an installed column
  (plug icon) for library maps; an uninstalled row has its toolbar/menu boxes
  disabled and its opacity/shortcut controls hidden. Custom, cached and
  combination rows have no box — they are deleted instead.
- The agent tool `list-map-layers` still lists uninstalled maps (an agent acts
  like a link).

### Step 2 — the registry split

- **`src/shared/mapLibrary/mapIndex.tsx`** — one row per map with what must be
  known without loading it: `type`, `layer`, `technology`, `icon`, `countries`,
  `bbox`, `shortcut`, `defaultInMenu`/`defaultInToolbar`, `superseededBy`,
  `experimental`, `layerPreview`, and `load()` (or `bundled`). The `entry()`
  helper ties a loader's return type to the row's `technology`. Also
  `mapIndexById`, `knownLayerIds()`, `bundledBodies`, `withBody()` and
  `loadIntegratedLayerDef(type)`.
- **`src/shared/mapLibrary/defs/*.ts`** — one file per map with the rest (`url`,
  zooms, `premiumFromZoom`, `attribution`, `detail`, `offlineExport`, …), typed
  `MapBody<'tile'>` etc. **File names are readable, not ids**: ids differ only by
  case (`WKA`/`wka`, `I`/`i`), which collides on case-insensitive file systems.
  The renderer overlays (`rendererOverlay.ts`) and MapTiler styles
  (`maptiler.ts`) share factories.
- **Bundled maps** — `X`, `S`, `O`, `h` and the feature layers `I`, `w`, `v`,
  `R`, `i` are imported statically (`bundled:`), so they are present from the
  first render. The other 26 are one rspack chunk each (~2.4 KB).
- **Types** — `MapIndexEntry`, `MapBody`, `LayerTechnology` in
  `src/shared/mapDefinitions.tsx`, which keeps the shared types, credits
  (`FM_ATTR`, `NLC_ATTR`, …), `OUTDOOR_COUNTRIES`/`OUTDOOR_BBOX`,
  `rendererTileUrl`, `LAYER_ALIASES`, `SHADING_SOURCE`. Shading helpers
  (`hasShadingLayer`, `hasSharedShadingLayer`, `withShadingSource`) moved to
  `src/shared/mapLibrary/shadingLayers.ts` to avoid an import cycle.
- **Store** — `src/features/mapLibrary/model/`: the `mapLibrary` slice holds
  `bodies` (seeded with `bundledBodies`), and `mapLibraryLoadProcessor` loads
  the bodies of installed maps, maps on the map, offline maps' sources and the
  shading source. A failed load retries with backoff (2 s → 60 s) and on the
  `online` event; a failure for a map on screen toasts `general.loadError`.
- **Selectors** (`src/features/mapLibrary/model/selectors.ts`):
  - `integratedLayerDefMapSelector` — every **loaded** map by id, offered or
    not. Use for lookups by id (sources of offline maps, opacity, shading).
  - `integratedLayerDefsSelector` — loaded maps that are **offered** (installed
    or on), in index order. Use for lists.
  - `shadingSourceSelector` — the `h` body custom shading maps draw.
  - Code that must know **every** map regardless of loading (ids, base vs
    overlay, links, shortcuts, legacy warnings, combinations) reads `mapIndex`.
- **Premium gate** — `downloadTiles` awaits `loadIntegratedLayerDef(sourceType)`
  rather than reading the store, so an unloaded source can't skip the gate.
- **Browse cache** — `syncBrowseCache(getState)` queues writes and reads the
  state at each turn, so the last write is the latest; its change key is a
  memoized selector.
- **Download forms** derive their default map until the user picks one, since
  the maps on the map may still be loading.

### Verification done

- A throwaway test merged every index row with its body and compared it with
  the pre-split `integratedLayerDefs` from `4d86eaf8`: all 35 identical field
  for field (icons excluded).
- Tests: `mapIndex.test.ts` (unique ids, every body loads, bundled set,
  `loadIntegratedLayerDef`), `selectors.test.ts` (offered rule),
  `mapLibraryLoadProcessor.test.ts` (retry + toast). 1380 tests pass; `tsc`,
  Biome and `scripts/react-compiler-check.mjs rewrites` are clean.
- A code review found 10 issues, all fixed (retry, premium gate, form defaults,
  browse-cache race, offered rule for lists, startup cost via bundling, agent
  catalog zooms, memoized predicates, one WMS-legend helper, one shading-source
  selector). **A second review is still due** — the retry and premium-gate
  fixes change behaviour.
- Not tried in a browser yet.

## Open questions

- **The API and `installed`.** Unverified whether `freemap-v3-api` keeps an
  unknown key in `layersSettings`; if it validates strictly the flag is lost on
  save. Check before shipping step 1. Older clients parse settings with a
  non-strict `z.object`, which also strips the key when they save back.
- **Startup requests.** The 26 non-bundled maps are installed by default, so a
  first visit still fetches 26 small chunks after the first paint. If that
  shows, group default-installed bodies into one chunk (`webpackChunkName`).
- `list-map-layers` loads every body to report zooms; fine at 35 maps, needs
  rethinking (index-level zoom/premium fields) at thousands.

## Next steps

1. **More maps, not installed by default.** Add a `defaultInstalled` index field
   (today every map defaults to installed via `isLayerInstalled`'s `?? true`),
   then add a handful of curated maps: e.g. national topo maps of CZ (ČÚZK), AT
   (basemap.at), PL (Geoportal), HU; OpenTopoMap; CyclOSM; a historic military
   survey. Only free, https, EPSG:3857; check each one's terms.
2. **Coverage as a union.** `{ countries } | { bbox } | { polygon }` (simplified
   polygon, its bbox derived). Keep the zoom-to target separate: `X` has both
   `countries` and a `bbox`. Countries keep using the server's covered-countries
   check; polygons are tested in the browser. Most catalog polygons are country
   outlines — convert those to `countries` in the pipeline.
3. **The library modal** (its own modal, not Layers configuration or Custom
   maps): search, filters (category, "covers this view", best), rows with a live
   thumbnail tile, coverage, dates, credits and licence link; actions Preview
   (show without installing), Install (with the existing `LayerVisibilityFields`),
   Copy as custom map. Entry points: "Add maps…" in the map menu and in Layers
   configuration, a search-box row "Search the map library for '…'" (needs a
   `commandDefinitions` row + `search.commands.keywords`). A link to an
   uninstalled map offers to install it.
4. **Library metadata** on index rows as needed: category, start/end dates,
   licence URL, source — an optional `HasCatalogMeta` group.
5. **Harvesting pipeline** (later, server side or a script emitting `defs/` +
   index rows): ingest, normalise JOSM-style URL placeholders (`{zoom}`, `{-y}`,
   `{switch:a,b}`) to Leaflet's, filter, probe liveness, allocate ids via the
   committed id table. At thousands of rows the index itself should become a
   lazily loaded chunk, with icons as specs/URLs rather than React components.

## Catalog research (checked 2026-10-01)

| Source | Size | Notes |
|---|---|---|
| OSM Editor Layer Index (`osmlab.github.io/editor-layer-index/imagery.geojson`) | 1,755 (867 tms, 861 wms) | **Best seed.** Coverage polygon, attribution (+`required`), licence/privacy URLs, category, country, `best`, `overlay`, dates, icon. Catalog licence **CC BY-SA 3.0** — a derived registry must stay CC BY-SA and credit ELI. Mostly aerial imagery (516 historic photo entries); 78 http-only; 18 need keys; 812/861 WMS offer EPSG:3857. Active. |
| JOSM `josm.openstreetmap.de/maps?format=geojson` | 1,593 | ELI plus more WMTS (74) and vector tiles (5); LGPL/CC BY-SA. |
| xyzservices `providers.json` | 938 (705 Géoportail FR) | Global basemaps and keyed providers; BSD-3; bbox only, no category. |
| QuickMapServices API (`qms.nextgis.com/api/v1/geoservices/`) | ~1,180 live | Daily liveness check, `cors_status`, WKT boundary. **Catalog licence unclear**, contains Google/Yandex/2GIS scrapes — ask NextGIS before use. |
| NASA GIBS WMTS (epsg3857) | ~1,300 layers | Public domain, mostly time-dimensioned science overlays. |
| ArcGIS Online search | 440k map services, 18k tiled | Mostly junk/dead; Esri terms restrict use. Only as a live "search further" backend producing custom maps. |
| INSPIRE → data.europa.eu | 500k dataset records | INSPIRE Geoportal retired 2026-07-01. Many services offer only national CRSs; good for hand-picked national maps, not bulk. |

Always exclude scraped commercial tiles (Google, Bing, Yandex, 2GIS) and
non-commercial licences (EOX Sentinel-2 cloudless 2018+ is CC BY-NC-SA, which
clashes with premium). ELI's `permission_osm` means "OSM editors may trace", not
permission to display in an app with a paid tier — check each entry's
`license_url`.
