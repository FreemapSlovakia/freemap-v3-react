# TODO / improvement backlog

Project-review findings (2026-06-08). Roughly ordered by payoff. See
[`doc/architecture.md`](./doc/architecture.md) for the surrounding context.

## Committed work

- [~] **Add automated tests.** Vitest + jsdom now configured (`vitest.config.ts`,
  `pnpm test`). Starter characterization tests pin the persistence layer:
  `getInitialState()` legacy migrations + `parseWithFallback` + per-slice
  isolation + merge-over-initialState, the `Persisted*Schema` parsers, and
  the save side / round-trip (`statePersistingMiddleware`). Pure reducer tests
  now cover the `map`, `routePlanner`, `toasts`, `l10n`, `trackViewer`,
  `objects`, `search`, `gallery`, `tracking`, and drawing points/lines slices —
  the branchy slices with non-trivial logic. The `src/app/store/selectors.ts`
  selectors (picking-mode/cursor/gallery-visibility composition) are also
  covered. Still TODO: widening coverage to processors (side-effect
  middleware).
- [~] **Enable `noUncheckedIndexedAccess`.** Flag still off in `tsconfig.json`,
  but the array/coordinate-heavy hotspots are now cleaned up against it (error
  count 348 → ~180).
- [x] **Separate feature-related messages from `src/translations/messagesInterface.ts`
      into per-feature lazy bundles.** Every feature-specific block now lives in its
      feature's `translations/` bundle (own webpack chunk per language, resolved via
      `use<Feature>Messages` in components and `load<Feature>Messages` for
      processor/toast strings); toast keys carry an optional `messageLoader`, so even
      JSX-returning toasts could leave the global blob. Cross-cutting blocks were
      split by ownership (e.g. `settings` across auth/gallery/mapSettings/
      routePlanner, `mapDetails` across objects + a new mapDetails bundle), and a few
      bundle-only feature dirs gained co-located code so they are real features
      (`measurement`, `purchases`, `premium`). Dead keys were dropped along the way.
      What stays in the global blob is deliberate — boot-critical/shared strings and
      registries: `general`, `generic`, `theme`, `selections`, `tools`, `mainMenu`,
      `main`, `mapLayers`, `errorCatcher`, `errorStatus`, plus small app-level
      `search`/`gpu`/`mapCtxMenu`.

## Softer / design opinions

- [ ] **Derive `Messages` from `en.tsx`.** `src/translations/messagesInterface.ts`
      is hand-maintained against the master and can drift. Explore deriving the
      type from `typeof en` (or a codegen step) so `en.tsx` is the single source.
- [ ] **Minor processor-middleware cleanups.** Internal `any` casts;
      `Math.random()` for fallback toast IDs; duplicated transform/handle predicate
      logic. Low priority.
- [ ] **Adopt React 19 hooks codebase-wide** (own session — it's a cross-cutting
      decision, not a local cleanup). The app uses zero Suspense today; all async
      loading goes through `useLazy` (`src/app/hooks/useLazy.ts`) + effects
      (modal lazy-loading, `useLocalMessages`). Start at `useLazy` → `use` +
      `<Suspense>`; then `LazyToastMessage` in `Toasts.tsx` falls out for free.
      Gotcha: `use` needs a _stable_ promise, but the `load*Messages` loaders
      cache the resolved _value_, not the promise — so passing `loader(x)` inline
      is the suspend-forever anti-pattern; add a per-key promise cache. Also
      evaluate `useActionState`/`useFormStatus` for form submits, `useOptimistic`
      for manual pending state, and **React Compiler** eligibility (decide first —
      it would let many hand-written `useMemo`/`useCallback` be dropped, changing
      how much manual hook churn is worthwhile).

## Modal/overlay state unification

Phase 1 (done) made `state.main.activeModal` a `Selection`-like discriminated
union `{ type; …args } | null`, folded the `document` overlay into it, drove the
watched-device form from `activeModal.token` (removed `modifiedTrackedDevice`),
and unified URL serialization through the packed `show=type/arg` codec
(`encodeActiveModal`/`decodeShow` in `src/app/store/actions.ts`), with backward
compat for `document=`/`tip=`/legacy `show=` renames.

Phase 2 (done) routed the gallery viewer, the Wikimedia Commons preview, and the
Wikipedia (`wiki`) preview through the same `show=` param
(`show=gallery-viewer/<id>`, `show=wmc/<pageId>`, `show=wiki/<lang>:<title>`),
dropping the bespoke `image=`/`wmc=` serialize/deserialize blocks (kept as legacy
read-aliases). Their slice state (`gallery.activeImageId`,
`wikimediaCommons.preview/loading`, `wiki.preview/loading`) is unchanged — only
the URL layer was unified.

Optional deeper cleanup (not required; `show=` is already the single param):

- [ ] **Fold `gallery-viewer`/`wmc`/`wiki` state into `activeModal`.** Replace
      `gallery.activeImageId` / `wikimediaCommons.preview` / `wiki.preview` with
      `activeModal.type === 'gallery-viewer' | 'wmc' | 'wiki'` as the source of
      truth. Needs moving the `next`/`prev` resolution out of the
      `galleryRequestImage` reducer into a processor, and updating
      `showGalleryViewerSelector`, `GalleryViewerModal`, and the gallery
      delete/stars/comment processors. Higher churn, no user-visible change — only
      do it if the dual state becomes a problem.
- [ ] **Delete dead `src/features/documents/model/reducer.ts`.** Its `documentKey`
      slice is not wired into `rootReducer`; the document overlay now lives in
      `activeModal`.

## Premium / monetization

Context: payment provider (Polar) acceptable-use rules and content licensing
constrain what can be gated. Safe premium = our own compute/infra or power-user
limits; avoid third-party data (license risk — see Strava) and community content
(CC-BY-SA can't be made exclusive + optics). Keep the free/open core intact.

- [ ] **Remove the "premium photos" perk.** Decision: drop it. Photos are
      CC-BY-SA 4.0 (can't be exclusive — any premium user may redistribute), and
      contributors have no intent to flag their own photos premium-only.
      Action: remove the "premium photos" bullet from the premium modal copy in
      all 7 locales (`en.messages.tsx` + `sk/cs/de/pl/hu/it.template.tsx`),
      regenerate locale files.
- [ ] **Premium feature — Map → image/document export** (Tier 1). Gate high
      resolution, large format, PDF/vector output, and no-watermark behind
      premium (or credits). Print-quality rendering is our own compute, clearly
      worth paying for, and rights-clean.
- [ ] **Premium feature — Live tracking limits** (Tier 2). Gate number of
      tracked devices, history retention, and update frequency. Convenience
      limit, rights-clean.
- [ ] **Premium feature — My Maps limits** (Tier 2). Free tier gets a limited
      number of saved maps; premium unlimited + sharing. Convenience limit.
- [ ] **Audit existing premium third-party layers** (same risk class as Strava):
      confirm licenses permit gating/charging for NLC forestry WMS
      (`gis.nlcsk.org`), ŠGÚDŠ geology WMS (`ags.geology.sk`), and ÚGKK ortho/DMR
      (LLS DMR). Own renders (Outdoor map, parametric hillshade SK/CZ) are fine.

## Elevation & track colorization (in progress on `feat/elevation-colorization`)

Context: GraphHopper now returns per-point elevation inline (with `0` as its
no-data sentinel, normalized to 2D). The aim is one shared elevation-acquisition
layer feeding one shared colorizer/consumer layer across routePlanner,
trackViewer, tracking, and export. Sample tracks of every shape live in
[`samples/`](./samples/) (regenerate via `node samples/gen-samples.mjs`).

Guiding principle: **gaps are the honest default; enrichment is opt-in.** Fill
elevation automatically only where intent is unambiguous (planned route, where
GraphHopper ≈ DEM); prompt the user where the data's provenance is unknown
(imported tracks).

- [x] Carry GraphHopper elevation through routes + GPX export; normalize the
      `0` sentinel to 2D per-coordinate (`StepCoordinate`).
- [x] Elevation chart: require *every* coordinate to carry elevation
      (`containsElevations`) and share the `/geotools/elevation` call via
      `fetchElevations` (`src/shared/elevation.ts`).
- [x] **`enrichElevations(features, 'missing' | 'all')`** in `src/shared/elevation.ts`
      on top of `fetchElevations`: `missing` fills only coords lacking `z`,
      `all` overwrites every `z`. Foundation for the consumers below.
- [x] **Gap rendering.** Elevation chart (`ElevationChart.tsx`) splits the SVG
      polyline/area into contiguous finite runs (min/max ignoring `NaN`; climb
      accumulation resets across `null` API points). Colorize (`colorizeByValues`
      + the two elevation-derived colorizers) flags missing values as gaps on
      `ColorizedPoint`, and the Hotline render loop splits each feature's points
      into gap-free runs.
- [x] **Densify sparse lines for rendering (chart + colorize + details).** Opt-A
      done. `densifyAlong(feature, getState, cancelActions?)` in
      `src/shared/elevation.ts` inserts intermediate points (at ~2 px / ≤100 m
      spacing via `along`) only into segments long enough to matter, DEM-samples
      just the inserted points (existing vertices keep their elevation), drops
      `coordTimes`/`coordinateProperties` (can't be interpolated), and is a
      reference-equal no-op for dense lines. Cached as a derived
      `renderTrackGeojson` on the trackViewer slice (separate from `trackGeojson`,
      never exported; cleared on `trackViewerSetData` / `trackViewerSetElevation`),
      built lazily by `ensureRenderGeojson` **only after a server override**
      (`elevationOverridden`) — the one state where every point is known DEM-derived,
      so inserted DEM points add no seam. A track's own recorded elevation is left
      alone even when full (no DEM injected between measured points), as are *fill
      missing* / *keep recorded*. A `trackViewerDensifyProcessor` (on
      `trackViewerSetElevation`) keeps it fresh for the colorize + details
      consumers; the chart paths `await ensureRenderGeojson` then feed the
      densified line. Consumers read `renderTrackGeojson ?? trackGeojson`
      (`Results.tsx` → `TrackViewerResult`, `TrackViewerDetails`). **Route planner**
      gets the same render-only treatment via `ensureRouteRenderGeojson` →
      `renderGeojson`: a planned route has no recorded measurement, so the router's
      own (different-DEM, shape-point-density) elevation is *always* ignored —
      `enrichElevations('all')` overrides every vertex from our DEM, then
      `densifyAlong` adds DEM points on long segments. Fed to the chart +
      elevation/steepness colorize only; `alternatives` stay GraphHopper's so
      export and the drawn route/distances are untouched (replaced the old
      `elevationsFilled` / `routePlannerSetEnrichedAlternatives` write-into-source).
- [x] **Promote `colorizers/`** out of `src/features/trackViewer/` to a shared
      location (`src/shared/colorizers/`, imported via `@shared/colorizers/…`) so
      routePlanner + tracking can reuse them. `Colorizer.isAvailable` already
      gates which modes apply per feature.
- [x] **trackViewer**: prompt-on-trigger (chart / elevation-colorize / info)
      when elevation is missing/partial — **Fill missing / Override all / Keep
      recorded** — answered once per track. Result drives `enrichElevations`
      writing `z` into `trackGeojson` (cached; static data). Full-elevation tracks
      skip the prompt; an explicit "update elevation" button overrides from the
      server via a plain confirm. The prompt hints that "Override all" avoids the
      recorded-vs-DEM seam (steepness spikes at gap edges).
- [x] **tracking**: colorize + elevation chart, reusing the shared colorizers via
      a `TrackPoint[] → Feature<LineString>` adapter (`trackGeojson.ts`: coords
      `[lon,lat,alt?]`, `coordTimes`, `coordinateProperties` for battery/gsmSignal).
      New `battery` + `gsmSignal` colorizers (shared, gated by `isAvailable`) on an
      absolute 0–100 % scale via `coordPropColorizerAbsolute` (so a color means the
      same across tracks). Tracking is now a real **tool**
      (`ToolSchema`/`toolDefinitions`, <kbd>g</kbd> <kbd>t</kbd>) whose toolbar
      (`TrackingMenu`) holds the old `TrackingSubmenu` items (watched/my devices,
      visual) plus colorize + elevation-chart toggle; `TrackingSubmenu` and the
      `tracking-visual-*` menu plumbing were removed. The chart uses recorded
      altitude as-is (`keepRecorded`) — no fetch/cache, so it stays ephemeral for
      live data. Colorize mode is persisted (`PersistedTrackingSchema`).
- [x] **routePlanner**: auto `ensureRouteElevations('missing')` (lazy, cached
      per result via `elevationsFilled`) writes DEM-filled `z` back into the
      alternatives' step coordinates, so the chart (now rendered from local
      coordinates, keepRecorded) and the new colorize dropdown read complete
      local data; no prompt. Colorize renders the active alternative as a
      Hotline (its own white outline; the halo stays for leg-select/drag),
      gated by `Colorizer.isAvailable` (routes expose Elevation, Steepness,
      Time, Heading). The local elevation resolver now also accumulates
      climb/descent, so the chart keeps those totals. Colorize-mode labels
      moved to a shared `src/shared/colorizers/translations/` bundle
      (`useColorizerMessages`).
- [x] **export**: opt-in **Elevation** control (Keep recorded / Fill missing /
      Override all) in the map-data export modal (`ExportElevationSchema`,
      persisted, hidden for Garmin). Both export paths reuse the shared
      `fetchElevations` (`src/shared/elevation.ts`): GeoJSON via `fillFcElevations`
      on a cloned FeatureCollection, GPX via `fillGpxElevations` filling/replacing
      `<ele>` on wpt/trkpt/rtept. Polygons (and `fm:type=polygon` GPX tracks) are
      skipped. `enrichElevations` stays the LineString-feature path used by
      routePlanner/trackViewer; the export fills points + lines in one batched
      request, so it builds on the same shared fetch rather than that wrapper.

## KML / TCX import & export (on `feat/kml-tcx-import`)

Goal: import KML/KMZ (#605) and TCX, and export KML/KMZ (#500). togeojson
already bundles `kml`/`tcx` parsers, so KML/TCX import needs no new dependency;
KMZ needs an unzip step.

- [x] **GeoJSON-transfer export is lossless.** `addGeojson` (now
      `gpxFromGeojson.ts`) round-trips per-point elevation/time and the
      `gpxtpx` sensor channels (hr, cad, atemp, speed, course, bearing) plus
      `<power>`, and re-emits routes as `<rte>` via togeojson's `_gpxType`. This
      removes the fidelity reason for keeping the raw source string.
- [x] **Colorizers read recorded speed/course/bearing**, fall back to computed;
      timestamps normalized to `coordinateProperties.times` ∪ `coordTimes`.
- [ ] **Import boundary** `parseToGeojson(text|bytes, filename)`: dispatch on
      extension/content to togeojson `gpx`/`kml`/`tcx` or `parseGeojsonFile`;
      wire into both drop paths (`Main.tsx` `onDrop`, `TrackViewerUploadModal`).
- [ ] **TCX normalization.** togeojson's `tcx` puts the extended channels as
      *top-level* props under different names (`cadences`, `speeds`, `watts`,
      `heartRates`) instead of `coordinateProperties.{cads,speeds,powers,heart}`.
      Remap + hoist them in the import boundary so the existing colorizers pick
      them up. (Do this when TCX import lands.)
- [ ] **KMZ**: add an unzip step (e.g. `fflate`) + binary read for `.kmz`,
      then route the inner `.kml` through the KML path.
- [ ] **KML/KMZ export** (#500): hand-write the XML (togeojson is import-only),
      reusing the `geojsonToGpxDoc` pattern. TCX export only fits tracks.
- [ ] **Power channel mismatch** (pre-existing): Garmin `<gpxpx:PowerExtension>`
      parses to `coordinateProperties['gpxpx:PowerExtensions']`, but the power
      colorizer reads `powers`. Standard Garmin power files don't colorize.
- [x] **Dropped the retained raw source string.** Removed `trackGpx` from
      trackViewer state; it survives only as a transient set-data input the
      processor parses to GeoJSON. share-upload + My Maps save now serialize the
      loaded GeoJSON to GPX via `geojsonToGpxDoc`; the export `import` path goes
      straight through `addGeojson`. Safe because the track+waypoint export is
      now lossless. (Truly exotic third-party GPX extensions are no longer
      preserved — an accepted trade-off; freemap.sk is not a file host.)

### Idea for later — multi-property track chart

Generalize the elevation chart into a multi-property chart: X axis = time **or**
distance; Y axis selectable among elevation, speed, orientation/heading, GSM
signal, battery level, distance, time, … Applies to trackViewer and tracking
(and, where data exists, the planned route). The colorizer data adapters already
expose most of these series, so the chart and the colorizers could share one
per-track "series" extraction layer.
