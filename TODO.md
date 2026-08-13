# TODO / improvement backlog

Technical debt and internal cleanups. Anything user-facing — features, UX,
product decisions — is tracked as a GitHub issue instead; the sections below say
which label to look under. See [`doc/architecture.md`](./doc/architecture.md) for
the surrounding context.

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

## Cleanups

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
- [ ] **Delete dead `src/features/documents/model/reducer.ts`.** Its `documentKey`
      slice is not wired into `rootReducer`; the document overlay now lives in
      `activeModal`.
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
- [ ] **Decimate the drawn GPS-recorder track by zoom.** The polyline re-maps
      every point into a fresh array per fix and Leaflet re-projects the whole
      line, which is the remaining per-fix cost over the whole track now that the
      statistics are folded incrementally. Only worth doing if a long recording
      actually feels slow — measure first.
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

## Decisions worth not relitigating

- **Toast auto-dismiss policy — do NOT centralize on `style`.** The
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
- **No pause in the GPS recorder.** For the track it is the same event as a
  stop, and what it adds — a Resume action in the notification, a restart
  Android cannot refuse — belongs to the recorder, not to us.

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

## Premium / monetization

Tracked as GitHub issues (label `area: premium`), including the dated 2026-09-01
price-rise checklist. The framing constraints still hold and gate what's
acceptable there: payment provider (Polar) acceptable-use rules and content
licensing mean safe premium = our own compute/infra or power-user limits; avoid
third-party data (license risk — see Strava) and community content (CC-BY-SA
can't be made exclusive + optics). Keep the free/open core intact.

## Drawing (`src/features/drawing/`, see [`doc/drawing-export-mapping.md`](./doc/drawing-export-mapping.md))

- [x] **Holes in polygons.** A hole is its own `DrawnLine` pointing at its parent
      by `holeOfId`, not a nested ring inside `points` — so every existing edit
      (vertex drag, midpoint insert, simplify, reverse) works on it unchanged,
      and the URL, the elevation chart and the `{lineIndex, pointId}` selection
      needed no ring index. The parent renders `[outer, ...holes]` as one
      `<Polygon>`, whose default `evenodd` fill rule punches the holes out and
      takes clicks through them. Holes are fully subordinate: no label or style
      of their own, measured as part of the parent, deleted with it. Rings stay
      flat — an island in a lake is a further hole of the same parent — so there
      is no chain to walk and no cycle to guard. Out on the wire a hole names
      its parent by *position* (`holeOf`), since neither the URL (`\x1eH<i>`)
      nor a saved document carries line ids; both must keep agreeing, or a map
      restored from its URL reads as having unsaved changes.
- [ ] **A hole isn't required to lie inside its parent.** Nothing stops a ring
      being drawn outside the polygon, or dragged across its boundary
      afterwards — deliberately, since editing has to pass through invalid
      states, and the tool already permits self-intersecting rings. But the
      consequences are silent: turf's `area` subtracts a stray ring's *whole*
      area from the parent (a large enough one drives the readout negative), and
      RFC 7946 / KML both require interior rings to be inside the exterior one,
      so the export is invalid. Cheapest honest fix: keep the geometry
      permissive but stop trusting it — `booleanContains` each hole when
      measuring, subtract only the contained ones, and say so in the readout.
      The *Make a hole of the enclosing polygon* command is already guarded;
      only the draw-a-hole path and later vertex drags can produce one.
- [ ] **No coverage for the hole wire formats.** The reducer's linking, cascade
      delete and stale-index tolerance are tested, but nothing exercises the
      round-trips the design leans on: URL `H` field ↔ store, document
      `holeOf` ↔ `holeOfId` (and the my-maps fingerprint agreeing across both),
      the GeoJSON interior rings, the GPX `fm:polygonId` / `fm:holeOf` pairing,
      and KML `innerBoundaryIs`. These are pure functions over small fixtures —
      cheap to pin, and the place a regression would go unnoticed longest.
- [ ] **A GPX-imported polygon shows no hole in the track viewer.** The linkage
      survives the round-trip — *Convert to drawing* rebuilds the hole — but
      `fm:polygonId` / `fm:holeOf` are read in exactly one place,
      `featuresToLines`, on the convert path. `DataViewerResult` renders each
      `<trk>` as its own single-ring polygon, so the parent's fill shows through
      where the hole should be (the hole itself outlines correctly, thanks to
      the transparent fill written for foreign consumers). The same shape
      imported as `.geojson` does render its hole, through the native `Polygon`
      branch that already takes `[outer, ...holes]`. Fix by merging at parse
      time — fold `fm:holeOf` tracks into their parent as a real `Polygon`
      beside `enrichGpxExtensions`, so the viewer uses the branch that works and
      the GPX grouping in `featuresToLines` becomes redundant. Matches this
      file's track-viewer principle: tag at parse time, don't re-derive
      downstream. Watch what else keys off `LineString`/`MultiLineString` —
      elevation-chart suitability, start/finish markers, distance labels,
      `mergeLines` — which an area would drop out of (arguably correct; the GPX
      exporter already skips elevation on polygon tracks).
- [ ] **Isochrone bands as donuts.** *Convert to drawing* keeps whatever inner
      rings a band has, but GraphHopper's `buckets` response is nested *filled*
      polygons — each bucket is the complete area up to its limit, one exterior
      ring each — so in practice no holes appear, and only the outermost band
      can be filled without the fills stacking. Subtracting bucket *k-1* from
      bucket *k* would make each band a real donut, letting every one carry its
      own fill. Wanted in the map rendering too, though, or the drawing would
      stop mirroring what it was converted from.

- [ ] **A stored route is invisible to the unsaved-changes comparison.** A saved
      map carries its computed route (`savedRoute.ts`), but `fingerprintState`
      deliberately ignores it: the digest has to match what a *restore* produces,
      and a restore rebuilds the route from the URL, where a stored one has
      nowhere to come from — so digesting it would report every restored map as
      changed forever. Consequences: **Recompute route** has to say so outright
      (`myMaps.routeRecomputed`, the one tracked flag in a slice that otherwise
      derives everything), and switching to another alternative changes what a
      save would store without the map reading as changed. Fixing it properly
      means the restore knowing the stored result — e.g. keeping it in the
      working copy beside the track, which would also close the entry below.

- [ ] **A map with unsaved changes has no route offline.** The browser's working
      copy (`mapStore.ts`) holds the track and the digest but not the route, so
      reloading a *dirty* saved map takes `mapsRestoreProcessor`'s
      record-exists-and-differs path: no document is read, nothing supplies
      `savedRoute`, and the route is asked for from the URL — which offline
      fails to a straight dotted line. A clean map reloads through `mapsLoad`
      and gets its stored route from the cached document, so only unsaved work
      is affected. Fix by putting `savedRoute` in the working-copy record beside
      the track (needs a record-schema bump).

## Track viewer: generic geodata vs. recorded tracks

The track viewer began as a GPX recording viewer and grew into a general geodata
viewer (GPX/KML/KMZ/TCX/GeoJSON, later maybe GPKG). Affordances written for a
single recorded GPS log misfire on arbitrary imported geometry. The through-line
of the fixes is **provenance, not heuristics**: tag each feature at parse time
with what it actually was in the source and key behavior off that — never
re-derive "is this a track?" from density/timestamps. Remaining user-facing
gaps are issues under `area: track-viewer`.

The rename to `dataViewer` is done — the directory, filenames, components,
processors, actions and their type strings, reducers/state/schema types, toast
ids and the `tools.dataViewer` message key.

**What deliberately still says `trackViewer`, because the literal is serialized
somewhere and renaming it would strand existing data:**

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

- [ ] **Rename the slices.** Needs a `storageKey` override on `PersistEntry` (so
      the saved blob keeps the old name) plus an explicit map-document mapping.
- [ ] **Generalize the track-flavoured helpers inside the feature** —
      `trackStore`, `trackSelection`, `trackEndpoints`, `trackInfoToast`,
      `useStartFinishPoints`, `trackWaypoints`, `TrackPoint`,
      `renderTrackGeojson`, `selectedTrackIndex` still read as track-only. A
      semantic rename, not the mechanical one that's done.

## GPS recorder (`src/features/gpsRecorder/`, see [`doc/gps-recorder.md`](./doc/gps-recorder.md))

Works end to end on a real Android device, for everyone, marked experimental:
record/stop, derived segments, a live readout, save-to-track-viewer, the
recorder as the app's position source, localized failure and setup toasts, and a
settings modal. The recorder's `API.md` is the contract's source of truth. The
client is written against **one** recorder version — `MIN_RECORDER_VERSION_CODE`,
currently 11 — with no feature detection and no fallbacks, because the APK has
never been released beyond its developers. Raise that constant when the recorder
changes and delete whatever the new contract makes unnecessary.

Open items are issues under `area: gps-recorder`.

- [ ] **Delete `perfProbe.ts` once the recording freeze is confirmed gone.** It
      is field instrumentation, not a feature: it times the recorder's four
      candidate passes (catch-up page, parse, dispatch, frame) so a stall report
      says which one was underneath. The batching that should fix the freeze and
      the probe that measures it shipped together and have not met a real ride
      yet, which is why it is still here. It costs a static import from
      `perfWatchdog.ts` (so it is in the main bundle) and a `console.warn` per
      slow pass. `perfWatchdog.ts` itself stays — that one is app-wide and not
      about the recorder.

## Photo layer: gallery + Wikimedia Commons merge

Shipped on both sides. The gallery layer (`I`) renders own + Wikimedia Commons
photos in one canvas layer, tinted by source (and a `source` colorize mode); the
`M` layer and the whole `src/features/wikimediaCommons/` feature are gone.
Commons photos ride the shared id space as negative ids (`-pageId`) via
`pictureIdToPath`, open in the gallery viewer (image + author/license/description
fetched straight from Commons via `wikimediaMeta.ts`), and support
rating/comments but not edit/delete. Legacy `#show=wmc/<pageId>` and
`#wmc=<pageId>` links remap to the merged viewer.

Server side: `wikimediaPicture`/`wikimediaRating`/`wikimediaComment` schema in
`initDatabase()`; a streaming dump importer (`src/wikimedia/importWikimedia.ts` +
`sqlDumpParser.ts`, `pnpm import:wikimedia`) that ingests `geo_tags`, the ~17 GB
`image` dump (EXIF `capturedAt`, `uploadedAt`, `authorId`) and the ~75 GB SDC
`latest-mediainfo.json.gz` (`P571` inception, `P275` license). All three list
handlers include wikimedia unless a filter it can't satisfy is set.

**Wire contract:**

- protobuf `Picture.source` (field 18): `0` = gallery (omitted), `1` = wikimedia;
  `id` carries the Commons `pageId` for wikimedia rows.
- `GET /gallery/pictures?by=bbox&sources=gallery,wikimedia` (default both); a
  gallery-only filter (tag/author/license, `pano=true`, `premium=true`) drops the
  wikimedia arm.
- `by=radius` returns `[{ id, source }]`, merged and sorted by distance;
  `sources` honored the same way.
- Detail `GET /gallery/pictures/w<pageId>` returns `{ id:<pageId>, source:
  'wikimedia', title:null, lat, lon, tags:[], comments, rating, myStars }`;
  gallery detail also carries `source:'gallery'`. Client fetches title, image
  URL, author, license and description from the Commons API by pageId.
- Rating/comment `POST /gallery/pictures/w<pageId>/{rating,comments}` supported
  (no premium gating); `PUT`/`DELETE`/`/image`/upload are gallery-only.

**Importer perf notes** (learned running it live): the load is disk-bound, not
network — insert via one connection with big transactions (commit every ~200k
rows, `unique_checks` off) and keep the staging table a **heap** (no PK) so the
tag-id-ordered rows don't thrash a random-order `pageId` clustered index; bump
`innodb_buffer_pool_size` (was 128 MiB default) for the join/index tail. There
are **>16.7M** camera pageIds, so an in-memory `Set` of ids overflows V8's Set
cap — another reason the page-dump join was dropped. The `image` dump
externalizes rich EXIF out of reach, which is why `capturedAt`/`azimuth` from it
are sparse (~36% / ~8%) and SDC `P571` backfills the date; azimuth has no SDC
source and stays best-effort EXIF.

Remaining work is issues under `area: gallery`, plus two backend-repo items:

- [ ] **Reject `w<pageId>` explicitly** in the `PUT`/`DELETE`/`/image` handlers.
      They route on `/pictures/:id` and interpolate `ctx.params.id` straight into
      SQL, so `w123` coerces to `0` in MySQL and 404s — the right answer for the
      wrong reason. `parsePictureId` (`src/routers/gallery/pictureId.ts`) already
      parses the ref; use it.
- [ ] **Mid-download resume in the importer.** `got` won't resume a stream once
      bytes have started, so `loadPass` retries a transient drop by restarting the
      whole pass — up to 75 GB re-downloaded because a connection blinked.

## Offline maps (`src/features/cachedMaps/`)

- [ ] **Make the shrink prune resumable.** Narrowing a cached map's area or zoom
      range deletes the tiles that fall outside, walking the previous coverage
      once. That walk is neither resumable nor recorded, so interrupting it —
      Stop, or closing the tab — leaves the dropped tiles in Cache Storage with
      nothing that will ever collect them, and the map's `sizeBytes` describing
      storage the coverage no longer accounts for. Nothing re-walks the old
      coverage afterwards, and only deleting the whole map frees them.
      Fix by recording the coverage still to prune in `CachedTileMapDef` (set
      before the walk, cleared after) and having `cacheTilesRestart` finish it
      before downloading. Needs a big shrink interrupted mid-flight to matter,
      hence deferred.

## SEO prerender (`sitemap-generator/`, see [`doc/seo-prerender.md`](./doc/seo-prerender.md))

Open items are issues under `area: infra`.

## Weather radar (`src/features/weatherRadar/`, see [`doc/weather-radar.md`](./doc/weather-radar.md))

[`doc/weather.md`](./doc/weather.md) records what was asked of the upstream feed
and what landed. Nothing is outstanding there.

- [ ] **Leftovers of the old LibreWXR instance on fm5.** The container is gone,
      but the `weather.freemap.sk` vhost and its cert still point at the dead
      upstream, and `/fm/data4/librewxr` still holds ~3 GB of its tiles.
