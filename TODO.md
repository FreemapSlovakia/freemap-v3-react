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

## Lint: re-enable Biome rules disabled during `recommended` adoption

`biome.json` now uses `"preset": "recommended"` with `--error-on-warnings`
(`lint`, `lint:fix`, lint-staged). Adopting the full recommended set lit up
rules the curated config never ran; the safely-autofixable ones were applied,
and the rest were switched `"off"` to keep the tree green. Re-enable and fix
these one at a time (counts are from first adoption):

- [ ] `suspicious/noImplicitAnyLet` (~23) — annotate bare `let x;` with a real type.
- [ ] `a11y/noSvgWithoutTitle` (8) — `<title>`/`aria-label` for meaningful, `aria-hidden` for decorative.
- [ ] `a11y/useHtmlLang` (3) — `lang` on `<html>` in `src/static/*.html`.
- [ ] `a11y/useButtonType`, `a11y/useValidAnchor`, `a11y/noStaticElementInteractions`,
      `suspicious/noConfusingLabels` (1 each).

Permanently off by decision (convention / tsconfig clash, **not** backlog):
`style/noNonNullAssertion`, `suspicious/noArrayIndexKey`,
`complexity/noImportantStyles`, `security/noDangerouslySetInnerHtml`,
`complexity/useLiteralKeys` (fights `noPropertyAccessFromIndexSignature`).

Still emitting at info level (non-blocking, optional cleanup):
`style/useTemplate` (145), `complexity/useIndexOf` (4), `correctness/useParseIntRadix` (1).

## Softer / design opinions

- [ ] **Remove the `*Settings` localStorage migration code (after ~2026-09).**
      The one-time migration from the old transient-slice keys can be dropped
      once active users have re-saved under the new keys (a couple of months
      from 2026-06; users who haven't opened the app by then aren't worth keeping
      it for). Delete `fallbackKey` (and `mergeFallback`) from the
      `routePlannerSettings`/`trackingSettings`/`gallerySettings`/
      `trackViewerSettings` PERSIST entries in `persistence.ts`; once nothing
      sets `mergeFallback`, simplify `parseWithFallback` back to primary-wins.
      The `fallbackKey: 'main'` migrations
      (`drawingSettings`/`homeLocation`/`cookieConsent`) are unrelated and stay.
- [ ] **Derive `Messages` from `en.tsx`.** `src/translations/messagesInterface.ts`
      is hand-maintained against the master and can drift. Explore deriving the
      type from `typeof en` (or a codegen step) so `en.tsx` is the single source.
- [ ] **Minor processor-middleware cleanups.** Internal `any` casts;
      `Math.random()` for fallback toast IDs; duplicated transform/handle predicate
      logic. Low priority.
- [ ] **Let changesets outlive their tool.** Every other data-bearing tool leaves
      its features on the map when its toolbar closes (objects, tracks, tracking,
      drawings); changesets are the exception — `changesets/model/reducer.ts`
      resets the slice on `closeTool('changesets')`, so closing the tool clears
      the markers. To make them behave like the rest: drop that case, add a
      `changesetsDelete` action + a `danger`/`FaTrash` button to `ChangesetsMenu`
      gated on the `hasChangesets` selector already there, and a matching
      `isToolOpen(state, 'changesets')` branch in `deleteProcessor` so the button
      and `Del` agree. `changesetsDelete` must also null `lastFetchedBBox` (else
      `canRefresh` stays false and Refresh is dead until the map is panned) and
      join the detail toast's `cancelType`. For getting the toolbar back after a
      marker click, add an action button to that detail toast rather than opening
      the tool from the click — nothing else in the app opens chrome from a plain
      map click. Watch the clutter: the markers carry `permanent` tooltips, so a
      screenful left behind is heavier than leftover POIs. (*Clear map* already
      counts them.)
- [ ] **Reconcile toolbar Delete/Close buttons with their `kbd` shortcut.** A
      dedicated toolbar button can dispatch a feature-specific action while its
      `kbd` hint advertises a global key that resolves differently. The dataViewer
      trash button dispatches `dataViewerDelete()` but shows `kbd="Del"`, and the
      `Del` key (`keyboardHandler` → `deleteFeature()` → `deleteProcessor`) is
      selection-aware — so with a track loaded *and* a drawing selected, the button
      deletes the track while `Del` deletes the drawing. The same mismatch applies
      to Close buttons (`kbd="Esc"`) vs. the global `Esc` handling. A deeper fix
      would teach `deleteProcessor` / the Esc handler to prefer the active tool's
      own feature over an unrelated selection, so button and key always agree.
- [ ] **Toast auto-dismiss policy — do NOT centralize on `style`.** The
      convention is "errors (`danger`) persist + dedupe by `id`; transient
      notices auto-hide via `timeout`", enforced per call site. It's tempting to
      move this into `toastsAdd`'s `prepare` (`src/features/toasts/model/actions.ts`)
      as a style-keyed default (danger → no timeout, else 5000), but an audit of
      all ~100 `toastsAdd` calls shows `style` does **not** map to timeout policy:
      `info` is used for *persistent panels* (measurement results in
      `measurementProcessor`, feature/POI detail in `searchHighlightProcessor` /
      `ChangesetsResult` / `ObjectsResult`, `trackInfoToast`), and some
      `warning`/`info` intentionally stick (`awaitingBankPayment`, `moreResults`,
      `tooManyPoints`). Today an undefined `timeout` means "persist", so a
      non-danger default would silently auto-dismiss ~10 of those. Keep the
      per-site timeouts — they encode real intent, not boilerplate. The only
      style where the mapping holds is `success` (always transient); if any
      centralization is wanted, limit it to defaulting `success`-with-no-`actions`
      to 5000 (would also tidy a few success toasts that currently persist by
      omission: `copyOk`, `disconnectSuccess`, download success).
- [ ] **Stop remounting path layers to change `interactive`.** react-leaflet
      doesn't diff the `interactive` option, so every `<Polyline>`/`<Polygon>`/
      `<CircleMarker>` whose interactivity is derived from `selectingModeSelector`
      carries it in its `key` (`trackViewer`, `tracking`, `routePlanner`'s route
      halo, `drawing` lines) and is destroyed + rebuilt whenever
      `state.main.mapTool` changes. Unlike markers — fixed by
      `setMarkerInteractive` in `RichMarker.tsx`, whose async icon root made the
      remount a visible blink — paths swap within one commit so there's no flash,
      just wasted work on big tracks. Toggling a path's interactivity only means
      toggling the `leaflet-interactive` class (the SVG renderer registers the
      hit-test target unconditionally; the canvas renderer hit-tests straight off
      `options.interactive`) — the work is in getting at the layer instance.
      Rather than per-layer refs, do it the way react-leaflet itself recommends
      (PaulLeCam/react-leaflet#843) and this repo already does for tile layers:
      `createPathComponent(create, update)` wrappers whose `update` diffs
      `interactive`. Note `createPathComponent` replaces the built-in update
      rather than composing with it, so each wrapper must also re-implement the
      upstream diffs (e.g. `setLatLngs` for a polyline) — copy them from
      `@react-leaflet/core`'s `Polyline`/`Polygon` and re-check them on bumps.
      The same wrapper would let `RichMarker` drop `setMarkerInteractive`.
      Watch the route planner while doing this: its halo and foreground lines
      stack by DOM order via `ref={bringToFront}`, so the foreground carries
      `interactive` in its key purely to remount in lockstep with the halo.
      Removing that entry alone leaves the halo covering the line (only the
      white outline renders until a click reshuffles the pane); both keys have to
      lose it together, or the stacking has to stop depending on mount order.
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

`state.main.activeModal` is a `Selection`-like discriminated union
`{ type; …args } | null` serialized through the packed `show=type/arg` codec
(`encodeActiveModal`/`decodeShow` in `src/app/store/actions.ts`); the gallery
viewer (own + Wikimedia Commons photos) and the Wikipedia
(`show=wiki/<lang>:<title>`) preview both route through the same `show=` param.
(Legacy `show=wmc/<pageId>` now decodes to the gallery viewer.)

Optional deeper cleanup (not required; `show=` is already the single param):

- [ ] **Fold `gallery-viewer`/`wiki` state into `activeModal`.** Replace
      `gallery.activeImageId` / `wiki.preview` with
      `activeModal.type === 'gallery-viewer' | 'wiki'` as the source of
      truth. Needs moving the `next`/`prev` resolution out of the
      `galleryRequestImage` reducer into a processor, and updating
      `showGalleryViewerSelector`, `GalleryViewerModal`, and the gallery
      delete/stars/comment processors. Higher churn, no user-visible change — only
      do it if the dual state becomes a problem.
- [ ] **Delete dead `src/features/documents/model/reducer.ts`.** Its `documentKey`
      slice is not wired into `rootReducer`; the document overlay now lives in
      `activeModal`.

## Premium / monetization

User-facing premium features are tracked as GitHub issues (label
`area: premium`): map/document export gating (#929), live-tracking limits (#930),
My Maps limits (#931), and removing the premium-photos perk (#932). The framing
constraints still hold and gate what's acceptable there: payment provider (Polar)
acceptable-use rules and content licensing mean safe premium = our own
compute/infra or power-user limits; avoid third-party data (license risk — see
Strava) and community content (CC-BY-SA can't be made exclusive + optics). Keep
the free/open core intact.

On 1 September 2026 the premium price rises to €15 for new customers. Nothing
switches by itself — do all of this on the day:

- set `PREMIUM_PRICE_EUR` to `15` in `src/shared/premiumPricing.ts`;
- drop the announcement: the premium branch of `InfoBar.tsx`,
  `usePremiumPriceIncreaseInfo`, the `priceIncrease*` and `switch*` messages,
  the alert in `PremiumActivationModal`, and `PremiumSwitchModal` together with
  its `premium-switch` modal id and its `AsyncModal` entry in `Main.tsx`;
- point `POLAR_PREMIUM_RECURRING_PRODUCT_ID` and
  `POLAR_PREMIUM_ONETIME_PRODUCT_ID` at the €15 products in the backend env;
- in Polar, archive the €8 products;
- update the price in `src/documents/premium.{en,sk}.md`,
  `src/documents/termsOfService.{en,sk}.md` and `src/static/llms.txt`.

## Elevation / track chart

Feature requests are tracked as GitHub issues (label `area: elevation-chart`):
multi-property chart (#933), toggle waypoints (#934), label route midpoints
(#935), waypoint distance ticks (#936), waypoint elevation readout (#937), export
chart as SVG (#938), and further enrichments (#939). The remaining item here is an
engineering task, not a user-facing feature:

- [~] **Attribute the elevation data source where it's used.** Done for the
      elevation chart (a credit line under its toolbar) and the point readout
      (an info icon beside the value) — see the crediting section of
      [`doc/elevation-and-colorizers.md`](./doc/elevation-and-colorizers.md).
      The backend reports which models answered, as this item asked: `?sources=1`
      switches `/geotools/elevation` to `{ elevations, sources }`, so no
      country→provider table is hand-synced across the two sides. Names and links
      come from the attribution table the outdoor map already uses. **Still open:
      track colorization**, which paints the same terrain-model values with no
      credit anywhere near it. The colorize legend is the obvious place;
      `useElevationSources` and the `fm:elevationSources` stamp on the render
      geometry give it the tokens without another request.
- [x] **Keep the elevation profile open when its source line changes.** The
      chart redraws from its target instead of being reset, and the incidental
      reducer resets (`routePlannerSetResult`, `drawingLineAdd`/
      `Update`/`RemovePoint`, `selectFeature`) are gone — re-routing, dragging a
      waypoint or reshaping a drawn line redraws the profile. Only an explicit
      close, `clearMapFeatures`, closing the owning tool, or the charted line
      going away ends it. A vertex drag doesn't fire an
      elevation request per frame — a redraw now happens only when the object
      the profile derives from is actually replaced.
- [ ] **Show which line an open elevation profile belongs to.** A drawing
      profile is pinned to its line (`target.lineId`) and selecting another line
      no longer moves it — deliberate, but nothing on screen says so. The only
      cue is the `active` state of the *Elevation profile* item, which lives
      inside `DrawingLineSelection`'s `···` dropdown and so isn't visible
      without expanding it. Options: label the chart with the line (its `label`,
      else an index), highlight the charted line on the map while the profile is
      open, or surface the toggle out of the overflow menu.
- [x] **Give the elevation chart a target.** `elevationChart.target` says what
      the chart shows ('route-planner' | 'track-viewer' | 'drawing' + lineId |
      'tracking' + token), and the chart is a derived view of it: one
      `elevationChartProcessor` resolves the target against current state
      through a small per-feature resolver, replacing the four per-feature
      processors that used to push into it and guess ownership from which tool
      was open. `chartIdentity` — one reference naming what the profile derives
      from — is the whole redraw rule, so there is no trigger list to keep in
      step. Drawn lines gained a stable `id` (`DrawnLine`, state-only, absent
      from `LineSchema` so saved maps still parse), because an index is not an
      identity. `elevation-chart=` in the URL carries the target, naming a drawn
      line by position and resolving it to an id at that boundary.
- [ ] **Let the user pick how much detail colorization keeps.** `SMOOTH_PX` in
      `src/shared/colorizers/smoothing.ts` is the zoom-derived floor on every
      mode's value smoothing — how many screen pixels of ground a wiggle must
      cover to be worth drawing. It was halved from 32 to 16 because the line
      generalized more than the scale called for, but that is one taste standing
      in for everyone's. Expose it as a multiplier toggle beside `resolutionScale`
      / `featureScale` in `MapPreferencesModal` ("less ↔ more detail",
      `0.5× / 1× / 2×`), not as a pixel count — nobody has an opinion about 32 px.
      It is a rendering knob, so it belongs with those two rather than with the
      metre windows in the elevation section.
- [ ] **Steepness colorization and the chart readout measure differently.** The
      colored line takes its grade over a zoom-derived span with its own
      elevation pre-smoothing (`steepnessColorizer`), while the readout takes it
      over the user's `gradeWindow` via `gradeAt` — so hovering a stretch can
      report a grade the color doesn't match. Threading `gradeWindow` into
      `ColorizeOptions` was tried and reverted: it is plumbing through three call
      sites for a difference visible only at high zoom, and it makes the two
      *look* reconciled while they still compute independently. The worthwhile
      version is to have both read one grade function over the same series, with
      zoom affecting only the rendering's level of detail.

## Track viewer: generic geodata vs. recorded tracks

The track viewer began as a GPX recording viewer and grew into a general geodata
viewer (GPX/KML/KMZ/TCX/GeoJSON, later maybe GPKG). Affordances written for a
single recorded GPS log now misfire on arbitrary imported geometry. The
through-line of the fixes below is **provenance, not heuristics**: tag each
feature at parse time with what it actually was in the source and key behavior
off that — never re-derive "is this a track?" from density/timestamps.

- [~] **Start/finish markers + distance labels only for tracks/routes.**
      `useStartFinishPoints` now emits a pair only for `fm:kind` track or route
      (`isTrackOrRoute`), so a KML/GeoJSON full of generic lines/polygons gets no
      flags — the original clutter complaint. (Route included too: GPX `<rte>` is
      a deliberate line where start/finish + distance helps; only generic
      `feature` geometry caused the clutter.) **Still TODO:** with several tracks
      the permanent distance tooltips can still stack — show them on
      hover/selection when there's more than one.
- [~] **Multi-segment stats & elevation profile.** Aggregate distance/time across
      segments with the inter-segment gap excluded (no phantom straight-line
      distance across a pause). Elevation profile lays segments end-to-end on the
      cumulative-distance axis with a visible discontinuity at the boundary, not
      a sloped bridge. **Done:** the elevation chart now charts a `MultiLineString`
      track — `elevationChartSetTrackGeojson` accepts it, the chart handler is
      segment-aware (gap break + climb-baseline reset between segments, no jump
      distance), `containsElevations`/`elevationCoverage`/`enrichElevations` are
      multi-segment-aware, and the suitability selector + toggle/resolve
      processors no longer drop `MultiLineString`. `densifyAlong` /
      `ensureRenderGeojson` densify a `MultiLineString` per segment (no inserts
      across the gap), so a server elevation override gets the same chart detail
      as a single-segment track. A new `dataViewerSetElevation` processor
      refreshes an already-open chart when elevation is refilled (it no longer
      goes stale until re-opened). The "more info" stats are now multi-segment
      aware (climb/descent measured per segment).
      **Still TODO:** start/finish markers' permanent distance tooltips can stack
      when several tracks are shown (hover-only when >1).
- [~] **Waypoints on the elevation profile.** Standalone points (GPX `<wpt>`)
      are pinned onto the chart with a stem, a dot on the line, and the name as
      a label. `elevationChartSetTrackGeojson` takes a `waypoints` arg (the
      dataViewer passes its Point features via `trackWaypoints`, including each
      `<wpt>`'s optional time). A waypoint is pinned only where the profile
      passes within `WAYPOINT_SNAP_METERS` (100 m); among those candidates it
      picks the one closest in **time** when both the waypoint and the track
      carry timestamps (disambiguating a self-crossing track), else the nearest
      in space. The local resolver carries each profile point's recorded time;
      the API-sampled path has none and uses spatial pairing. **Refinement:** a
      very sparse line could still miss a mid-segment waypoint — could project
      onto the nearest segment rather than the nearest vertex.
- [~] **Rename the feature away from "track viewer".** It's a general geodata
      viewer (GPX/KML/KMZ/TCX/GeoJSON, points/lines/polygons, multi-file), so
      the `trackViewer` name was misleading. Done: the directory
      (`src/features/dataViewer/`), the filenames and their namesakes
      (`DataViewer*` components, `dataViewer*Processor`, `DataViewerMessages` /
      `load…` / `use…`, `useLoadDataFiles`, `useDataMergeMode`,
      `parseDataFile(s)`), every action creator (`dataViewer*`) and its
      `DATA_VIEWER_*` type string, the reducers/state/schema types
      (`DataViewerState`, `dataViewerReducer`, `PersistedDataViewerSettingsSchema`,
      `DataViewerMapDataSchema`, …), the toast ids (`dataViewer.*`) and the
      `tools.dataViewer` message key.

      **What deliberately still says `trackViewer`, because the literal is
      serialized somewhere and renaming it would strand existing data:**
      - the redux slice keys `trackViewer` / `trackViewerSettings` — they double
        as the localStorage keys (`PersistEntry.key` is `keyof RootState`), and
        `fallbackKey: 'trackViewer'` reads the pre-settings-split blob;
      - the my-maps map-document fields `trackViewer: { trackGeojson, trackUID,
        gpxUrl }`, which are in every saved map on the server;
      - the idb database name `fm-trackViewer` in `trackStore.ts`;
      - the Matomo event label `TrackViewer` (`elevationChart/model/processor.ts`),
        splitting it would split the historical stats;
      - the URL tokens: `tool=import-file`, the legacy `track-viewer` /
        `#show=upload-track` / `gpx-url=` / `load=` aliases,
        `elevation-chart=track-viewer`, `track-uid=`, `import-url=`,
        `track-colorize-by=`, `track-style=`.

      Renaming the slices later needs a `storageKey` override on `PersistEntry`
      (so the saved blob keeps the old name) plus an explicit map-document
      mapping. Separately, the track-flavoured helpers inside the feature
      (`trackStore`, `trackSelection`, `trackEndpoints`, `trackInfoToast`,
      `useStartFinishPoints`, `trackWaypoints`, `TrackPoint`,
      `renderTrackGeojson`, `selectedTrackIndex`) still read as track-only and
      could be generalized — but that's a semantic rename, not this mechanical
      one.

## Live tracking

- [ ] **Convert-to-drawing for live tracking** (`src/features/tracking/`). The
      tracking feature has no "convert to drawing" yet; add one so a recorded
      live track can be turned into an editable drawing. Unlike the track viewer,
      tracking should **keep** the original (the live feed continues), so it's a
      lossy *copy* not a replace — no rich-data warning needed, just the
      simplify prompt for the dense recording. Likely a new `convertToDrawing`
      payload variant (e.g. `{ type: 'tracking'; id }`) handled in
      `convertToDrawingProcessor`, plus a menu action in the tracking UI.

## GPS recorder (`src/features/gpsRecorder/`, see [`doc/gps-recorder.md`](./doc/gps-recorder.md))

Works end to end on a real Android device, for everyone, marked experimental:
record/stop, derived segments, a live readout, save-to-track-viewer, the
recorder as the app's position source, localized failure and setup toasts, and a
settings modal. The recorder's `API.md` is the contract's source of truth. The
client is written against **one** recorder version — `MIN_RECORDER_VERSION_CODE`,
currently 11 — with no feature detection and no fallbacks, because the APK has
never been released beyond its developers. Raise that constant when the recorder
changes and delete whatever the new contract makes unnecessary.

There is deliberately no pause: for the track it is the same event as a stop, and
what it adds — a Resume action in the notification, a restart Android cannot
refuse — belongs to the recorder.

A second backend records from the browser's own Geolocation API, for iOS and for
the ride not worth an install — written, type-checking, and **not yet run in a
browser**. Its remaining work, including the elevation datum and the untested fix
filter, is listed in
[`src/features/gpsRecorder/browser/README.md`](./src/features/gpsRecorder/browser/README.md)
rather than here.

- [ ] **A landing page for the APK.** `RECORDER_DOWNLOAD_URL` points straight at
      the APK, so the install fallback drops the user into a bare download with
      no explanation of the "install unknown apps" permission they will need.
- [ ] **Verify the `intent://` fallback on non-Chromium Android.** The platform
      gate is Android-wide, but `intent://` with `S.browser_fallback_url` is a
      Chrome convention; a browser that ignores it leaves the "recorder not
      installed" path doing nothing at all.
- [ ] **Read the columns the recorder already sends.** `decodePoints` takes nine
      of the fifteen: `altAcc`, `spdAcc`, `brgAcc`, `sat` and `src` are all
      dropped. `sat` and the accuracies have GPX equivalents (`<sat>`,
      `<hdop>`-ish) that the export could carry.
- [ ] **A track that changes elevation datum mid-way steps by the geoid.**
      `altMsl ?? alt` is per point, so a recording whose opening fixes predate the
      first GNSS fix splices ellipsoidal metres onto MSL ones — a ~42 m cliff in
      the profile over Slovakia, read as ascent by anything that sums differences.
      Deriving the separation from the points that carry both and applying it to
      the rest would make the track continuous, at the cost of writing out an
      elevation the recorder never measured.
- [ ] **Decimate the drawn track by zoom.** The polyline re-maps every point into
      a fresh array per fix and Leaflet re-projects the whole line, which is the
      remaining per-fix cost over the whole track now that the statistics are
      folded incrementally. Only worth doing if a long recording actually feels
      slow — measure first.
- [ ] **Style the live track like a displayed GPX track** instead of the plain
      red polyline, and run it through the shared colorizers — the per-segment
      `Feature<LineString>[]` the save path builds is already the shape
      `colorize` takes, so the live view can reuse it.
- [ ] **Update prompt on a newer `versionCode`.** An APK *older* than
      `MIN_RECORDER_VERSION_CODE` is already reported as outdated with a download
      link (`getStatus` probes the body for a `version` when the full schema
      rejects it). Nothing tells the user about a *newer* one, though — the
      recorder's own in-app update check is the only thing that does.
- [ ] **Say that a stored track is only in this browser.** `DataViewerMenu`
      already warns on a track that is in no map and that the URL doesn't name,
      which now covers a finished recording too. Consider making the wording say
      what the copy actually is — one `persist()`-ed copy in one browser — since
      the reload it survives may read as "saved".
- [ ] **Drop the experimental flask** once the tool has been used in anger for a
      while: `experimental: true` on its `toolDefinitions` entry is all that marks
      it now, the role gate having gone.

## Offline maps (`src/features/cachedMaps/`)

- [ ] **Support caching WMS layers.** The "Cache map for offline use" form offers
      tile layers only. WMS needs a per-tile cache key both when downloading and
      when rendering: `buildTileUrl` in `cacheTilesProcessor.ts` substitutes only
      `{x}/{y}/{z}`, so a WMS layer collapses to a single cache entry, while
      `WmsTileLayer` requests `?…&BBOX=…` URLs that the service worker's exact-URL
      `cache.match` never finds. Requires computing each tile's `BBOX` GetMap URL
      at download time and deriving the identical key at render time (or normalizing
      the query in `serveCachedTile`). Re-enable the two `technology === 'tile'`
      filters in `CacheTilesForm.tsx` once done.

## Photo layer: gallery + Wikimedia Commons merge

Merge of the separate Wikimedia Commons layer (`M`) into the gallery photo layer
(`I`): the API server imports the monthly Commons `geo_tags` dump (filtered to
`gt_type='camera'`) into a `wikimediaPicture` table of just `(pageId, location)`,
exposed through the same `/gallery/pictures` bbox + detail endpoints with a
`source` discriminator. The client fetches everything else — title, image URL,
author, license, description — lazily from the Commons API by pageId on viewer
open (it must call the API for CC attribution anyway, and that response also
carries the title and image URL, so the 6.7 GB `page` dump is *not* imported).
The `M` layer is retired;
`source` becomes a filter + colorize dimension. Ratings/comments for wikimedia
photos live in standalone `wikimediaRating`/`wikimediaComment` tables (keyed on
the stable `pageId`, untouched by the monthly reimport).

**Client PR (freemap-v3-react) — DONE.** The gallery layer (`I`) now renders own
+ Wikimedia Commons photos in one canvas layer, tinted by source (and a `source`
colorize mode); the `M` layer and the whole `src/features/wikimediaCommons/`
feature are removed. Commons photos ride the shared id space as negative ids
(`-pageId`) via `pictureIdToPath`, open in the gallery viewer (image +
author/license/description fetched straight from Commons via `wikimediaMeta.ts`),
and support rating/comments but not edit/delete. Legacy `#show=wmc/<pageId>` and
`#wmc=<pageId>` links remap to the merged viewer. Filter gains `sources`
(gallery/wikimedia; Commons gated to zoom ≥ 11).

**Server PR (freemap-v3-api) — DONE.** `wikimediaPicture`/`wikimediaRating`/
`wikimediaComment` schema in `initDatabase()`; streaming dump importer
(`src/wikimedia/importWikimedia.ts` + `sqlDumpParser.ts`, tested; `pnpm
import:wikimedia` — geo_tags-only stream into a heap staging table, then a
sorted `INSERT IGNORE … SELECT` into the final table + spatial index, atomic
swap); bbox/radius gain `source`; detail/rating/comment accept `w<pageId>`;
comment mail extracted to `commentMail.ts`.

Importer perf notes (learned running it live): the load is disk-bound, not
network — insert via one connection with big transactions (commit every ~200k
rows, `unique_checks` off) and keep the staging table a **heap** (no PK) so the
tag-id-ordered rows don't thrash a random-order `pageId` clustered index; bump
`innodb_buffer_pool_size` (was 128 MiB default) for the join/index tail. There
are **>16.7M** camera pageIds, so an in-memory `Set` of ids overflows V8's Set
cap — another reason the page-dump join was dropped.

**Wire contract the client PR must match:**
- protobuf `Picture.source` (field 18): `0` = gallery (omitted), `1` = wikimedia;
  `id` carries the Commons `pageId` for wikimedia rows.
- `GET /gallery/pictures?by=bbox&sources=gallery,wikimedia` (default both); any
  gallery-only filter (`userId`/`tag`/rating/date/`pano`/`premium`/`license`)
  drops the wikimedia arm.
- `by=radius` now returns `[{ id, source }]` (was `[{ id }]`) — merged, sorted by
  distance; `sources` param honored the same way.
- Detail `GET /gallery/pictures/w<pageId>` returns `{ id:<pageId>, source:
  'wikimedia', title:null, lat, lon, tags:[], comments, rating, myStars }`;
  gallery detail now also carries `source:'gallery'`. Client fetches title, image
  URL, author, license and description from the Commons API by pageId.
- Rating/comment `POST /gallery/pictures/w<pageId>/{rating,comments}` supported
  (no premium gating); `PUT`/`DELETE`/`/image`/upload are gallery-only.

Remaining server niceties (not blocking the client PR): explicit
`w<pageId>` rejection in the `PUT`/`DELETE`/`/image` handlers (they already 404
via int coercion today), and mid-download resume in the importer.

Deferred sub-items:

- [ ] **Use `gt_type` as a filterable tag.** v1 only stores `gt_type` in a column
      (filtered to `camera` at import). Wiring it into the shared `tag` filter
      (so "mountain"/"church"/… filter uniformly across gallery user-tags and
      wikimedia types) needs the wikimedia side of the bbox `UNION ALL` to match
      its single `gt_type` against the tag-filter set + `tagMode`, plus surfacing
      the fixed enum as selectable tags client-side. Not simple — defer.
- [x] **Ingest the Commons `image` table for date + stable author.** The importer
      now streams the ~17 GB `image` dump (title-keyed, pre-filtered by a hashed
      title bitset to the kept subset, joined back on title) and stores
      `capturedAt` (EXIF `DateTimeOriginal` from the JSON `img_metadata`),
      `uploadedAt` (`img_timestamp`) and `authorId` (numeric `img_actor`) on
      `wikimediaPicture`. The bbox arm surfaces them under `takenAt`/`createdAt`/
      `userId`, so date/season/author **colorizing** works for wikimedia photos.
      Notes: the actor *name* isn't in any public dump (`actor` dump is empty), so
      it stays API-only in the viewer.
- [x] **Add the SDC (mediainfo) dump for capturedAt + license.** The `image` dump
      externalizes rich EXIF (`{"data":[],"blobs":{…}}`) out of reach, so
      `capturedAt`/`azimuth` from it are sparse (~36% / ~8%) — exactly the dated,
      directional photos. The importer now also streams the ~75 GB SDC
      `latest-mediainfo.json.gz` (JSON-lines; pageId cheap-matched at line start,
      only kept entities JSON-parsed) and stores `P571` (inception →
      `COALESCE(EXIF, SDC)` capturedAt) and `P275` (license → our buckets via
      `licenseQMap.ts`). `license` is a first-class column now, colorized like own
      photos; `WIKIMEDIA_NO_DATA_MODES` is empty. Azimuth has no SDC source (stays
      best-effort EXIF). License *filtering* for wikimedia is still gallery-only
      (the `wikimediaExcludedByFilter` set) — could be enabled now that the column
      exists.
- [x] **Include wikimedia in list *ordering* and *filtering*.** All three handlers
      (`byBbox`/`byRadius`/`byOrder`) now include wikimedia unless a filter it can't
      satisfy is set (tag/author/license, or pano=true/premium=true). The wikimedia
      arms apply the date-range (`capturedAt`/`uploadedAt`, indexed) and rating-range
      (effective Bayesian rating) filters and every ordering; the Filter modal shows
      an "excludes Wikimedia" note only under tag/author/license.

## SEO prerender (`sitemap-generator/`, see [`doc/seo-prerender.md`](./doc/seo-prerender.md))

- [ ] **Link `oz.freemap.sk` from the prerender footer.** The association site is
      currently only reachable to crawlers via the GitHub README and the
      `document=freemap` prerender; the in-app AboutModal link is SPA-only (bot
      invisible). Add a small `<footer>` to `renderHome`/`renderHub` in `seo.ts`
      linking `oz.freemap.sk` (and maybe GitHub) so every prerendered page carries
      the inbound link.
- [ ] **Hub landing pages in all 9 languages.** `HUB_LANGS` is still `sk + en`;
      expanding to every UI language needs the `Hub.title`/`description` records in
      `seo.ts` translated (~19 hubs × title+description per new language), phased by
      market priority (IT → PL → HU → DE → SL → FR → CS).
- [ ] **More countries for per-feature POI pages.** `objects.ts` `COUNTRIES` covers
      SK (full) + CZ/HU/PL/IT (outdoor-only); add AT/DE/SI next (each = area id +
      `COPY` entry), one at a time, watching GSC indexing before scaling.
- [ ] **Native review of the generated foreign copy** — the CZ/HU/PL/IT `COPY`
      strings in `objects.ts` and the `sl`/`fr` `openMapLabel`/`featuresLabel` in
      `seo.ts` are machine-drafted.


## Weather radar (`src/features/weatherRadar/`, see [`doc/weather-radar.md`](./doc/weather-radar.md))

- [x] **Longer history.** `LIBREWXR_MAX_FRAMES=36` on fm5 — six hours, up from
      two, with the cache bind-mounted onto `/fm/data4`. Watch whether the
      slider wants coarser stepping now that a step is a smaller fraction of
      its travel.
- [ ] **Weather warnings layer.** `GET /v2/alerts?bbox=…` already returns CAP
      warnings as GeoJSON — over central Europe roughly 190 features from
      `sk-shmu-sk`, `cz-chmi-cs`, `at-zamg-en`, `pl-imgw-xx` — with `title`,
      `description`, `severity`, `time`, `expires`, `regions`, `uri` and
      Polygon/MultiPolygon geometry. Each issuing service writes in its own
      language, so the text needs no translation from us. The vhost already
      serves and caches the endpoint. Note the payload is ~270 KB at the default
      `simplify=1000`, so it wants a tight bbox and a coarser `simplify`.
- [ ] **Coverage mask.** `/v2/coverage/0/{size}/{z}/{x}/{y}/0/0_0.png` is a
      static translucent overlay of where radar data exists at all (~3 KB/tile).
      Cheap, and it removes a real misreading: without it "no echoes" and "no
      radar here" look identical.
- [ ] **Motion arrows / storm cells.** Radar tiles accept `?arrows=light|dark`
      and `?cells=light|dark`. Two more checkboxes in the settings dropdown.
- [ ] **Satellite layer.** `/v2/satellite/…` (NOAA GMGSI IR, hourly, 12 h) has
      the same tile shape, so it would reuse `RadarLayer` almost verbatim —
      currently disabled on our instance (`LIBREWXR_SATELLITE_ENABLED=false`)
      because hourly IR is of little use for outdoor planning.
- [ ] **A frame is not immutable for its timestamp.** Forecast frames are
      re-computed each cycle under the same URL, which is why tiles are cached
      for only five minutes and why a frame can still mix two versions at that
      boundary. Fixing it properly needs a version in the URL, which the
      RainViewer-compatible API has no room for — worth raising upstream if it
      ever becomes visible again.
