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
  naming it in `layers=`, a map preset or the default `X` base still
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
  `CustomMapEditor.tsx`), so e.g. `[0-9A-Z]{5}` with at least one letter is
  safe. Links join ids with `~`, so any id works in `layers=`.
- **Definitions stay in TypeScript** (types validate them; icons, `process.env`
  URLs and translated names keep working) and load **per map, lazily**.

## What is built

### The install flag

- `LayerSettings.installed?: boolean` in `src/features/map/model/actions.ts`;
  missing means installed. Synced to the account with the rest of
  `layersSettings`.
- `isLayerInstalled` / `isLayerOffered` (installed, or on the map) in
  `src/shared/mapLibrary/installed.ts`.
- Honoured by `MapSwitchButton`, `keyboardHandler`, `commandDefinitions` (search
  box), `CacheTilesForm` (an edited offline map keeps its own source),
  `OfflineMapExportModal`'s pickers.
- Custom maps, offline maps and presets are deleted rather than uninstalled.
- The agent tool `list-map-layers` still lists uninstalled maps (an agent acts
  like a link).

### The library modal

`src/features/mapLibrary/components/MapLibraryModal.tsx`, one modal under two
ids that are its tabs: `installed-maps` (**Installed maps**, chord <kbd>m</kbd>
<kbd>i</kbd>, where each map the user has is configured) and `available-maps`
(**Available maps**, <kbd>m</kbd> <kbd>a</kbd>, the catalog); the Manage maps
menu has one **Map manager** item opening Installed maps, the search box a row
for each tab, and switching tabs changes
`show=`. `map-library`, `map-layers-config` and the older ids are renamed to
`installed-maps`. Built for a catalog of thousands:

- **Catalog** — `src/features/mapLibrary/catalog.ts`: `loadLibraryCatalog()`
  loads it on first opening. A `CatalogEntry` carries what search and the row
  need, and either a built-in map's `index` row or a catalog map (`map`). The
  catalog maps come from `eli/eliCatalog.json` (see **Harvesting**), a chunk of
  its own (`eli-catalog`), and from `curated/curatedCatalog.json`: hand-picked
  maps ELI lacks (Slovak WMS and tile services so far), written by hand with
  ids of their own (`FSK..`; a test keeps them clear of ELI's). A catalog map
  is image tiles or, with `technology: 'wms'`, a WMS. The modal credits ELI
  under its CC BY-SA 3.0.
- **Search** — `librarySearch.ts`: the search box's fuzzy match over the name,
  then (ranked lower) each keyword, country code and name and category on its
  own; targets are normalized once per catalog and language. With no query,
  the filtered catalog with the maps that `coversView` first, in each part
  base maps before overlays, then by name (`Intl.Collator`). An
  `IntersectionObserver` at the list's end adds 50 rows at a time. Paging
  restarts only on a new query or filter, not when an install or the view
  changes the list.
- **Tabs and filters** — the modal has two tabs, `YourMapsTab` and
  `LibraryTab`, each with its box and `FilterChips`; the modal keeps both
  filter objects, so they outlast the custom map form; `filters.ts` holds the rules
  (`passes`: a group of chips lets all through until one is on, then any
  match). Installed maps filters by category, kind, `coversView` (an offline map by its
  downloaded bounds), where a map is shown (toolbar, menu,
  shortcut, or hidden: neither toolbar nor menu) and technology group (tile,
  maplibre, wms, parametricShading, color, data — the layers the app draws);
  Available maps, which holds only maps
  not installed, by layer, category,
  technology group and `coversView`: one of a map's countries must be in
  `map.countries`, and for a catalog map, whose countries don't tell its
  coverage, its box must also meet `map.bounds` — a country's box alone can
  span the globe (France's overseas territories) or reach into a neighbour.
  The covered-countries service answers only within Europe (issue #1073), so
  where it names no country (elsewhere, at sea) a catalog map's box alone
  decides. Each tab shows its count.
  Category is the ELI one; built-in maps carry theirs in their index row, a
  custom map the one its form sets (`category` on `CustomLayerDef`), an
  offline map its source map's, and presets count as Other.
  Installed maps is one table: base maps, then overlays in stack order, presets
  first in each, each row marked by `LayerKindMark`; a Layer chip filters by
  kind.
- **Installed maps** — `YourMapsList`: the installed library maps (from
  `installedLibraryIndexSelector`, so no catalog is needed; the tab's count is
  `yourMapsCountSelector`) and the custom maps, offline maps and presets, with
  columns for every map's settings (toolbar, menu, opacity, shortcut), so they
  read as one overview.
  A row's actions sit in a ⋮ menu (`ResponsiveActions`, all `showFrom="never"`):
  preview for all but a preset (an offline map's fits to its downloaded
  area), show on map for a preset, modify for the user's own (an
  offline map's form in Offline maps via `cachedMapsSetView({ edit })`), and
  uninstall for a library map or delete for a custom map or preset
  (`useCustomMapActions`, after a confirm). The opacity column edits the
  map's layer setup, or a preset's own.
- **Layer setups** — `LayerSetup` (`map/model/layerSetup.ts`: kind, opacity,
  WMS layers, shading, colour), one per map in `map.layerSetups` (account
  settings), kept whether the map is on or off. `setSetup` drops a kind equal
  to the map's own and an empty setup. A map's WMS layers, shading and colour
  (`configOf`) are its own wherever it is drawn; each drawing — the map on its
  own, or a preset's copy — has its own opacity and kind (`usageOf`). So an
  edit of the shading inside a preset changes the map everywhere. Shading
  edits on the server renderer wait as `map.shadingDrafts`, by map.
- **Named maps** — "Parcels", "Contour 1000": a custom-map entry with a
  `source` map — a library map or a custom server, deleted with it — instead
  of a server of its own (`NamedMapDef`), its WMS layers,
  shading or colour in its own setup like any map's. `resolvedCustomLayersSelector`
  draws it as its source under its own id, name and icon (`resolveNamedMap`),
  once the source's body is loaded. **Save as map** on a map's page in the
  panel creates one (`mapNamedMapCreate`) from that drawing's setup and kind,
  in its place.
- **Presets** (`map/model/mapPreset.ts`) — a named composite layer with its
  own copies of maps, bottom first, each with its opacity and kind, and its
  own opacity. In `map.layers` it is one item, `@<id>`; `layerInstancesSelector`
  flattens the stack into what is drawn, so one map can be drawn on its own
  and inside presets at once. `Layers.tsx` draws a preset's layers
  in a `PresetPane`, which carries its place and opacity. A preset with a base
  map is the base item (`mapPresetToggle` replaces the base like
  `mapToggleLayer`); one without is an overlay item. Edits inside apply to the
  preset at once (`mapLayerSetupChange` with `preset`, `mapPresetLayerAdd`/
  `Remove`, `mapOverlayMove` with `preset`). The data layers are never in a
  preset (`canJoinPreset`), nor is another preset or an offline map, and a
  preset holds each map once: `capturePreset` keeps a map drawn twice at its
  upper drawing's opacity (`mergeLayers`). A link writes the setup of a map
  drawn only in presets as `l.<id>` too, and `p.<n>.l.<id>` holds only the
  copy's opacity and kind. Deleting a custom or offline map takes it out of every preset too
  (`dropMap`), and `mapReplaceLayer` (the legacy-map warning) replaces it in
  presets as on the map. Code asking which maps are drawn reads
  `drawnTypesSelector`, not `map.layers`.
- **Links and documents carry presets inline** — `inlinePresets` numbers them
  (`@<n>` in `layers=`, `p.<n>…` params, `layerSetupUrl.ts`); on reading,
  `adoptPresets` maps one alike to one of the account's back to it (compared
  as a link writes them, `sameInLink`), the rest become `map.linkPresets`
  (`~<n>`), which the panel offers to save as the account's own.
- **Overlay stack** — `map.layers` order (bottom first) is the stack.
  `overlayStackSelector` lists the overlays a list may name (installed or on,
  the user's own, overlay presets on the map) and says which may move: the
  non-pinned ones on the map.
  `overlayStack` (`map/model/overlayStack.ts`) puts pinned ones
  (`isPinnedOverlay`: photos, Wikipedia, the data layer, which draw partly in
  panes above every tile overlay) on top, then the order, then any overlay not
  on the map by its default `zIndex` (a custom map's, if set), the later one
  above on a tie, on the map or not, so turning one on doesn't move its row
  past an equal one. `overlayZIndexSelector` gives each its z-index in
  `Layers.tsx`; tile, WMS-tile and gallery layers apply a changed one through
  `updateGridLayer` (browser-drawn shading too), the radar on every pooled
  frame. The map menu, toolbar and the table list overlays in the same order.
- **The Map layers panel** (`mapSettings/components/MapLayersPanel.tsx`),
  opened by the toolbar button beside the map switcher, lists what is on the
  map: the tools' features (`useMapFeatureRows`: a row each that holds
  anything, opening its tool and its items page, `MapFeatureItems`, and
  clearing it; not in embeds), then overlays
  and overlay presets in `overlayStackSelector` order (dragged
  with `mapOverlayMove`), then the base item, each with its opacity, and Save
  as preset (not in embeds). It drills down rather than expanding rows: a
  preset opens to its own layers, a map to a page of its settings (kind
  switch, opacity, WMS section, shading editor in its own chunk, colour,
  Reset), so no other layer shows beside them. Where it is (`PanelPlace`) and
  whether it is open live in `mapLayersPanelStore.ts`, outside Redux, so the
  toolbar button and `useRevealEditableMaps` (opening a WMS or shading map
  just turned on at its settings, and closing it with that map unless the user
  opened or moved in it; below `sm` a closed panel only marks the button, the
  panel covering the map there) share them. Pages put actions that must stay in
  view into the header through `PanelHeaderSlotContext`. Opened on the stack
  when the map's only item is a map with a page and no tool's features are
  listed, it goes to that page. The
  setting controls take a
  `SetupTarget` — a map, or a preset's copy of it (`layerTarget.ts`).
- **The WMS section** (`WmsSection.tsx`). An empty pick draws nothing and is
  left out of feature info. It reads the service's capabilities (cached per URL for the page's life) into
  `WmsLayerTree`, shared with the custom map form, and stores the pick as the
  setup's `wmsLayers`, which `Layers.tsx` draws in place of the
  def's `layers` — for custom maps too; `mapCustomLayerSave` clears it. The
  legend and the map details' feature info ask for the same layers
  (`withTickedLayers`).
- **Switched kind** — any library or custom map but the data layers
  (`canSwitchKind`; the switch leaves the opacity alone, and a vector map's
  opacity is set on its canvas container) may be the other kind by
  its setup's `kind`; a custom map's form sets its default kind, and saving it
  drops the switch. `withKind` applies it in `libraryIndexSelector`,
  `resolvedCustomLayersSelector` and `allLayerEntries`; a preset's copy goes
  by its own setup. A switch, a deletion or a map's own reset that takes the
  only base away leaves none, and `settleBase` only keeps one at most, first.
  Signing in or out and resetting every setting are not the user's act on the
  map, so `keepingBase` puts X under where they took the only one (unless X
  itself is switched to overlay). A base map has an opacity too, opaque by
  default (never an overlay's `defaultOpacity`, `resolveLayerOpacity`), the
  map background showing through it. The library browse view keeps the catalog's
  kind; offline maps keep the kind they were saved with. Wherever no layer
  draws, `map.backgroundColor` (a local pref, `#dddddd` by default) shows.
- **The custom map form** (`CustomMapEditor`) replaces the list in the
  modal while its state carries a request: `setActiveModal({ type:
  'installed-maps', customMap: { edit?, addPreset?, addPresetFrom?, returnTo? }
  })` — a custom map or preset to edit, a new preset of everything on the map
  or a copy of a preset — a link's, or a duplicate (from the Map layers panel, either put in place
  of what it was made of), or a new map. A preset's form holds only its name,
  icon and how it is reached. A custom map is image tiles, WMS or MapLibre.
  Cancel goes where `returnTo` says (a tab, or
  `null` to close, as from the menu's New custom map or the panel);
  Save passes `highlight`, which scrolls Installed maps to that row (it passes
  the filters whatever they are) and
  flashes it (`fm-flash`), as Offline maps' Show in Installed maps does.
  The forms set how a map is reached (toolbar, menu, shortcut:
  `LayerVisibilityFields`). Offline maps keeps a
  `highlight` of its own for the map just saved. The form has no `show=`; `show=custom-maps` opens the library.
- Available maps is one table too, rows marked by `LayerKindMark`: a search in
  rank order, browsing by `coversView`, then base maps before overlays, then
  name.
- **Every change applies at once.** `mapLayerSettingsChange` (installing
  included), `mapLayerSetupChange`/`Reset`, `mapLayersSettingsReset` (keeps
  `installed`; asks first), and `mapCustomLayerSave`/`Delete` and
  `mapPresetSave`/`Delete` (each with the map's own settings) change the store;
  `mapSettingsSaveProcessor` then
  sends the whole account settings — at once, or 500 ms after the last setup
  change (an opacity drag), a pending immediate save never being postponed —
  through `queueSettingsSave` (`src/app/store/settingsSaveQueue.ts`), the
  queue `saveSettingsProcessor` uses too: the API replaces each key a save
  sends, so saves must land in order. Each sends the state at its turn, so none is
  cancelled (`saveSettings` neither), no list goes from a stale copy, and a
  save still waiting in the queue carries later changes. `saveSettings` takes
  only `maxZoom`, and closes only the modal it came from. The saved toasts
  (with Activate, decided when shown) and ending a saved shading draft wait
  for success; a failure toasts
  `savingError` and keeps the local state, which the server's replaces at the
  next sign-in. A change made during the startup auth check can be overwritten
  by its older copy (issue #1072).
- **Eye** previews: `mapLibraryPreviewStart({ type })` puts
  `mapLibrary.preview`, which hides the modal (`d-none`, as area selection
  does, with its Escape and focus trap off) and mounts `MapLibraryPreviewMenu`.
  The start processor's `transform` snapshots the layers as `restore`; its
  handler switches the map on (loading an uninstalled built-in body first) and
  fits the view to it when away — by the countries in view where the map names
  countries, else by its `bbox`; the target is `bbox`, else `getCountriesBbox`.
  Install and Keep end it with `keep: true`; Back (<kbd>Esc</kbd>) and × end it
  with `keep: false`, whose processor puts `restore` back. Another modal ends it
  the same way. The browser's Back, which takes the previewed map off itself,
  ends it with the library shown again. A reload doesn't restore. It is
  a picking mode (`mapLibraryPreviewingSelector` in `pickingModeSelector`), and
  unlike the others it also hides the map switcher and the manage button and
  turns off the layer shortcuts: a switch would be undone by `restore`.
- Both buttons hand a catalog map to the store first
  (`mapLibraryCatalogMapsLoaded`), so the reducer knows its kind when it is
  toggled.

### Catalog maps

A catalog map is not in `mapIndex`; it works once the map slice knows it.

- **Ids** — `isCatalogId` (`src/shared/mapLibrary/catalogId.ts`): five
  uppercase letters or digits with a letter. No built-in id has five characters
  and custom and offline maps' ids are lowercase, so the id alone tells a
  catalog map apart. `isLayerInstalled` defaults a catalog id to not installed.
- **`CatalogMap`** (`src/shared/mapLibrary/catalogMap.tsx`) — plain data with
  its own `name`, a `bbox` (a preview's target: `COUNTRY_BBOXES` knows only
  SK and CZ) and a `tile` body; `catalogIndexEntry` makes an index row of it,
  its body bundled.
- **`map.catalogMaps`** — the catalog maps known so far, never persisted.
  `catalogMapsLoadProcessor` loads the ones wanted — installed, on the map, or
  an offline map's source — from the catalog on start and whenever that set
  grows; an id the catalog lacks is asked for once and left in `layers`
  unrendered.
- **`libraryIndexSelector`** — `mapIndex` plus the known catalog maps. The
  definition selectors, `allLayerEntries` (so the reducer's base/overlay
  decision), `YourMapsList`, keyboard shortcuts,
  the search box and `list-map-layers` read it. Names read `def.name` before
  `mapLayers.letters`.
- **Links** — `layers=` keeps a catalog id unchecked (the catalog loads after
  the link is read) and writes it back; a lone one is written with a trailing
  `~` (`layers=XSOR7~`), as legacy concatenated links (`XSJ17` = X, S, J1, 7)
  share its alphabet, and so is a lone preset (`layers=@1~`). A link is read as
  written: one without a base map opens without one, the map background
  showing.
- **Names** — `layerName(def, m)` (`src/shared/layerName.ts`): a custom or
  catalog map's own name, else the translation.
- **Icons** — `catalogIcon(category)`, one per ELI category.
- **Coverage** — ELI's `country_code` says where the imagery lies, not what it
  covers (a city orthophoto names its country), so a preview tells a catalog
  map's distance by its `bbox`.

### Harvesting

`node scripts/harvest-eli.mjs [imagery.geojson] [--reuse-probe]` turns the OSM
Editor Layer Index, plus the maps found beyond it in
`scripts/national-sources.json`, into `src/features/mapLibrary/eli/`. A national
source is ELI's properties with a `bbox` for the coverage, a WMS by its base
`url` and `layers`, and an id `fm:<country>-…`; it goes through the same filters
and probe. The national sources are researched one country at a time.

- **`ids.json`** — the committed id table, ELI id → catalog id (a SHA-256 of
  the ELI id mod 36⁵, rehashed while it has no letter or is taken). An entry
  keeps its id for good; one that leaves moves to `retired` and gets it back
  if it returns. Ids never go to anything else.
- **`eliCatalog.json`** — `{ source, licence, maps: CatalogMap[] }`, sorted by
  id; derived from ELI, so CC BY-SA 3.0 and credited.
- **`probe.json`** — one tile per map fetched as the app would (no referrer,
  an `Origin`), a failed fetch tried once more: status, whether CORS lets both
  www.freemap.sk and www.freemap.eu read it (`*`, or each origin named back),
  and the `@Nx` scales. `--reuse-probe` keeps answers (2xx or 404) of the
  current `PROBE_VERSION`; failures are always asked again.

`.github/workflows/harvest.yml` runs the harvest every Monday on the fm5 runner
— from Europe, as many European servers refuse GitHub's US runners — without
`--reuse-probe`, so every map is asked again, and opens (or updates) one PR on
`harvest/map-library` when the catalog or the id table changed. Its body is the
`--report` markdown: the maps that left, with the drop reason, came back or are
new. A server down for one run shows up as left — read the reason before
merging.

Kept: `tms` entries — https, no key, placeholders Leaflet fills (`{zoom}`,
`{-y}` → `tms`, `{switch:…}` → `subdomains`) — and `wms` entries — https, no
key, EPSG:3857 among `available_projections`, `LAYERS` named, no `STYLES` but
`default` (the app asks for the default) — stored as a `wms` body: the GetMap
URL without its request parameters, and the layers. ELI files ArcGIS REST
`export` URLs as `wms`; those are dropped. A WMS is probed with the app's own
request (1.3.0, a 256 px tile, JPEG for a base map, transparent PNG for an
overlay), and one answering with anything but an image — a WMS error is an XML
200 — is dropped; its CORS is recorded but only its layer list in the Map
layers panel needs it, as the map is plain images. Dropped:
OSMF-hosted (`*.openstreetmap.org`, editing only by its usage policy),
`*.freemap.sk` (built in), scraped commercial sources (Google, Bing, Yandex,
2GIS, HERE, Mapbox, Apple, Maxar, Esri basemaps — matched on the ELI id and
host only, as agency maps credit Esri), non-commercial licences, entries
without a `license_url` (ELI's permissions are for tracing, not display — they
wait for a review), maps whose probe got no answer or anything but 2xx or
404, and maps whose https request is redirected to http, which an https page
blocks. A 404 stays: the probed spot may just lie outside a ragged coverage. A
tile map CORS doesn't open to both origins gets `cors: false`. The probe also asks for a
tile map's tile with the app's `@2x` suffix (then `@3x`, `@4x`) and takes each one whose
image is that many times wider as `extraScales`; without them, imagery and
elevation (`photo`, `historicphoto`, `elevation`) get `scaleWithDpi`, as the
built-in aerials do, and maps with labels neither. `eliCatalog.test.ts` checks
the ids and templates.

### The registry

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
- **Bundled maps** — `X`, `S`, `O`, `h`, `c` and the feature layers `I`, `w`, `v`,
  `R`, `i` are imported statically (`bundled:`), so they are present from the
  first render. The other 26 are one rspack chunk each (~2.4 KB).
- **Types** — `MapIndexEntry`, `MapBody`, `LayerTechnology` in
  `src/shared/mapDefinitions.tsx`, which keeps the shared types, credits
  (`FM_ATTR`, `NLC_ATTR`, …), `OUTDOOR_COUNTRIES`/`OUTDOOR_BBOX`,
  `rendererTileUrl`, `LAYER_ALIASES`, `SHADING_SOURCE`.
- **Store** — `src/features/mapLibrary/model/`: the `mapLibrary` slice holds
  `bodies` (seeded with `bundledBodies`), and `mapLibraryLoadProcessor` loads
  the bodies of installed maps, maps on the map and offline maps' sources.
  Built-in maps are installed by default, but for those whose
  index row has `defaultInstalled: false` and, on freemap.eu, those of
  Slovakia alone (`uninstalledByDefault` in `installed.ts`, until the user sets
  anything for one), so their bodies load at startup — one small chunk each, which HTTP/3 multiplexes cheaply. A failed
  load retries with backoff (2 s → 60 s) and on the `online` event; a failure
  for a map on screen toasts `general.loadError`.
- **Selectors** (`src/features/mapLibrary/model/selectors.ts`):
  - `integratedLayerDefMapSelector` — every **loaded** map by id, offered or
    not. Use for lookups by id (sources of offline maps, opacity, shading).
  - `integratedLayerDefsSelector` — loaded maps that are **offered** (installed
    or on), in index order. Use for lists.
  - `mapByIdSelector` — any map by id, library before custom before offline,
    with its origin; `mapEntryOf` gives what to name it by before its body
    loads. Use when an id may name a map of any origin.
  - Code that must know **every** map regardless of loading (ids, base vs
    overlay, links, shortcuts, legacy warnings, presets) reads `mapIndex`.
- **Premium gate** — `downloadTiles` awaits `loadIntegratedLayerDef(sourceType)`
  rather than reading the store, so an unloaded source can't skip the gate.
- **Offline map on its source** — online with the network fallback on, a cached
  map whose library source has not loaded is not rendered: without the source's
  envelope the service worker would fetch past the premium gate. A failed load
  of that source toasts like one of a map on screen.
- **Browse cache** — `syncBrowseCache(getState)` queues writes and reads the
  state at each turn, so the last write is the latest; its change key is a
  memoized selector. Templates are also stored by map id, so an offered tile
  map whose body is still loading keeps its last template and a cache-only
  start doesn't lose it.
- **Download forms** derive their default map until the user picks one; the
  default zooms and scale apply once per map (and, for offline maps, per
  premium limit), since `mapDef` is rebuilt on every body load and layer toggle.
- **Legend** shows "loading" for a WMS map whose body is not in yet.
- **Tests:** `mapIndex.test.ts` (unique ids, every body loads, bundled set,
  `loadIntegratedLayerDef`), `selectors.test.ts` (offered rule),
  `mapLibraryLoadProcessor.test.ts` (retry + toast).

## Open questions

- **The API and `installed`.** Unverified whether `freemap-v3-api` keeps an
  unknown key in `layersSettings`; if it validates strictly the flag is lost on
  save. Check before shipping. Older clients parse settings with a
  non-strict `z.object`, which also strips the key when they save back.
- `list-map-layers` loads every body to report zooms; fine at 35 maps, needs
  rethinking (index-level zoom/premium fields) at thousands.
- **Startup with an installed catalog map** loads the whole catalog chunk
  (~53 KB gzipped) to resolve one id. Splitting an id → map lookup from the
  list the library searches would fix it once the catalog grows.

## Next steps

1. **More catalog maps.** Review the entries held for a missing licence URL
   and the services with usage policies of their own (OpenTopoMap, CyclOSM,
   Waymarked Trails, Wikimedia); the WMS entries with a non-default style (the
   `wms` body has no `styles`) or without `LAYERS`; a committed overrides file
   the script applies, by id, for a better name or icon or to hide an entry.
2. **Coverage as a union.** `{ countries } | { bbox } | { polygon }` (simplified
   polygon, its bbox derived). Keep the zoom-to target separate: `X` has both
   `countries` and a `bbox`. Countries keep using the server's covered-countries
   check; polygons are tested in the browser. Most catalog polygons are country
   outlines — convert those to `countries` in the pipeline.
3. **The library modal, further:** filters (category, "covers this view",
   best), rows with a live thumbnail tile, dates, credits and licence link;
   Install with the existing `LayerVisibilityFields`; Copy as custom map. Entry
   points: "Add maps…" in the map menu, a search-box
   row "Search the map library for '…'". A link to an uninstalled map offers to
   install it.
4. **Library metadata** on index rows as needed: start/end dates,
   licence URL, source — an optional `HasCatalogMeta` group.
5. **Other sources** for the harvest (JOSM's WMTS, national catalogs), into
   the same id table.

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
