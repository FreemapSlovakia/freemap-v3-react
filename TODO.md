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
these one at a time (counts measured 2026-09-02):

- [ ] `suspicious/noImplicitAnyLet` (25) — annotate bare `let x;` with a real type.
- [ ] `a11y/noSvgWithoutTitle` (12) — `<title>`/`aria-label` for meaningful, `aria-hidden` for decorative.
- [ ] `a11y/noStaticElementInteractions` (4), `suspicious/noConfusingLabels` (1).

Permanently off by decision (convention / tsconfig clash, **not** backlog):
`style/noNonNullAssertion`, `suspicious/noArrayIndexKey`,
`complexity/noImportantStyles`, `security/noDangerouslySetInnerHtml`,
`complexity/useLiteralKeys` (fights `noPropertyAccessFromIndexSignature`),
`a11y/useValidAnchor` (flags any `<a>` with an `onClick`, which is the SPA-link
pattern: a real `href` plus `preventDefault` to route in-page — a `<button>`
would lose new-tab, copy-link and the status-bar preview).

Still emitting at info level (non-blocking, optional cleanup):
`style/useTemplate` (145), `complexity/useIndexOf` (4), `correctness/useParseIntRadix` (1).

## Cleanups

- [ ] **Remove redundant `useMemo` now the React Compiler memoizes.** The
      `useCallback` pass is done (108 removed across 52 files, `b8b74f36`);
      `useMemo` is left. Same method — see
      [`doc/react-compiler.md`](./doc/react-compiler.md): take only files whose
      emitted output contains `react/compiler-runtime`, skip anything named in a
      dependency array, returned as a value from a hook, or reaching
      react-leaflet, then prove the result with
      `node scripts/react-compiler-check.mjs unchanged`. `useMemo` needs more
      judgement than `useCallback` did: some instances exist to hold an identity
      for a consumer rather than to save work, and a few key deliberately on a
      content hash instead of the value (`useNumberFormat`, `useZoomColorize`) —
      those must stay.
- [ ] **Optional: inline single-use one-line handlers.** After the `useCallback`
      removal, ~85 handlers across those files are a single expression used
      exactly once, so the named const buys nothing. Purely cosmetic: named and
      inline forms are memoized identically. Unlike the `useCallback` removal
      this is _not_ provably a no-op — inlining shifts where the arrow is
      created, so the cache layout changes (equivalently, but not
      byte-identically). Prefer doing it opportunistically while editing a file
      rather than as a sweep; the 26 handlers used more than once stay named.

- [ ] **Make `pickingModeSelector` answer _which_ mode, not just whether.**
      It returns a boolean, so `mouseCursorSelector` re-enumerates four of the
      six modes, `keyboardHandler` handles them at three different priorities
      (with nothing saying that ordering was intended), and `Main` mounts each
      mode's component and menu behind its own flag. A `PickingMode | null`
      string union turns the cursor into one `Record` lookup and the Escape
      chain into one block at one priority. A `toolDefinitions`-style registry
      that also owns the lazy factories would be too far: the modes aren't
      uniform (map-area is a drag, gallery-show-position picks nothing,
      home-location has a Save).
- [ ] **The crosshair list and `pickingModeSelector` have drifted.**
      `mouseCursorSelector` gives a crosshair for four picking modes but not for
      gallery position picking or map-area selection. Collapsing it to
      `showGalleryPicker || picking` is a behaviour change for those two —
      decide it deliberately rather than letting the two lists keep diverging.
      Folds into the item above.
- [ ] **`Attribution`'s document-link branch is unreachable.** `PREFIX =
'?document='` (`src/shared/components/Attribution.tsx`) matches no
      `AttributionDef.url` anywhere, so the `documentShow` interception has
      never fired. Either something should produce such a URL — and then it
      wants the hash form the rest of the app uses, not a query — or the branch
      and the prefix should go.
- [ ] **`MyMapsMenu` hand-builds the split button** `SplitButton` now
      abstracts (`Dropdown as={ButtonGroup}` + `Button` + `Dropdown.Toggle
split` + `FmDropdownMenu`). It needs a `breakpoint` label on the primary
      button first, which `SplitButton` doesn't expose yet.
- [ ] **`SplitButton`'s menu can't do what `SelectDropdown`'s can** — no `kbd`,
      `extra` (premium badge), `active` or `divider`, because it writes its own
      item loop instead of sharing `SelectDropdown`'s. Factor the item builder
      out of `SelectDropdown` when a split button first needs one of those.
- [ ] **`location.fixRequest` holds one consumer**, so asking for a fix from the
      second panel supersedes the first — its spinner stops and nothing is
      placed, silently. Both panels open _and_ both awaiting is a corner; make
      it a set if it ever bites.
- [ ] **A panorama label with no dominance ranks below every summit.** The
      dominance _filter_ passes it (`?? Infinity` — a cut it cannot judge should
      not remove it), while `labelRank` scores it as a 1 m bump (`?? 1`), so the
      thinning drops it first. Harmless today, since `labelsFromPeaks` is the
      only source and every peak carries a figure. Whoever adds the second one
      (map selection, drawn points, POIs — see `labels/types.ts`) has to decide
      what its labels are worth against summits; no constant here can guess it.
      Now two-sided: a source supplying `prominence` without a `dominance`
      lands on that same `?? 1` and the prominence term then lifts it _above_
      real summits — 1 + 0.3 × 800 for a big one — so the fallback is wrong in
      both directions and the next source has to set both or neither.
- [ ] **Mount a mark's tooltip `Overlay` only once it has been shown.** With no
      `breakpoint`, `LongPressTooltip` sets `labelHidden` and mounts its
      `Overlay` for the life of every mark. Hidden it draws no DOM, no popper
      and no listeners, but it still costs ~26 of the ~38 hooks a mark carries,
      and a layer menu or the layer-settings table holds dozens at once. Gate it
      on `show || wasShown` instead of `labelHidden`. Measure before and after —
      it is milliseconds on mount-once UI, so this is only worth doing if it
      stays a small change.
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
      In the route planner only the halo carries `interactive` in its key; it
      and the foreground lines sit in separate panes, so a remounted halo can no
      longer cover the line.
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

- **Element lookup answers for tagged features in Europe, and that is the whole
  intent.** `/v1/features/by-id` on our own API replaced Overpass. So an
  untagged way, a plain geometry node, or anything outside the extract is
  reported as not found, and a relation is drawn as its line geometry rather
  than as a collection including its member nodes. Deliberate: this is an
  outdoor map, not an OSM element inspector, and every producer of an element id
  in the app — the objects layer, map details, Photon search — has exactly the
  same coverage, so nothing internal can ask for what is missing.

  **Do NOT add the public OSM API back as a fallback.** Its usage policy is
  explicit — "the editing API is provided in order to edit the map data, not for
  read-only purposes or projects" — and points read-only use at Overpass or
  planet files, with blocking "without notice" for clients affecting service.
  Reading elements from it for display was a mistake this change corrected.
  If coverage ever does need widening, widen the import instead: storing
  untagged nodes and ways in `freemap-osm-api` is an afternoon's work in the Lua
  and costs only disk.

- [ ] **The changesets tool still reads the OSM editing API.**
      `src/features/changesets/model/processor.ts:110` lists changesets from
      `/api/0.6/changesets`, which the policy above covers too. Much milder than
      element lookup was — it fires only on opening the tool or changing its
      parameters, never per pan — but it is the last read-only use left. Moving
      it means either a third-party service (OSMCha) or importing the changeset
      replication stream ourselves; neither is worth it until the feature grows.

- **Don't rename the `overpass-*` / `nominatim-*` source ids.** They name the
  kind of lookup, not the backend — the data comes from freemap-osm-api and
  Photon, and Overpass is gone from the code entirely (`4f7deff3`). Renaming is
  tempting and wrong: the ids are part of the saved-map document format, and
  `mapDocumentSchema.ts` silently drops a search result whose `source` it does
  not recognise. A compat mapping covers old documents, but not the other
  direction — a map saved by a new client loses those results when an older
  cached bundle opens it. They are also persisted in `excludeSources`, where one
  unknown entry resets the whole slice. Treat them as wire-format identifiers.

- **`RichMarker` stays uncompiled — do NOT "fix" its ref access.** It reads and
  writes `faIconRef.current` during render, which bails it out of the React
  Compiler, and that is fine. The cache is load-bearing: `faIcon` is written
  inline at the call site, so it is a fresh object every render, and rebuilding
  the icon reaches Leaflet's `setIcon`, which replaces the marker's drag handler
  — a marker that re-renders often becomes undraggable mid-gesture. The
  slow-marker problem it was suspected of causing was really `Results` failing to
  compile (inline `import()`, fixed in `6b5a90a2`); marker selection was
  acceptable afterwards without touching this. See
  [`doc/react-compiler.md`](./doc/react-compiler.md).

- **Compiler warnings from `lint:react` are mostly not defects.** An audit of the
  `memo-dependencies` and `no-deriving-state-in-effects` findings found six of
  eight to be false positives — the "missing dependency" is a ref
  (`useModelChangeHandlers`, `GalleryViewerModal`), a loop-carried local
  (`useChartColorize`), or a `const` declared later and used in a
  callback that runs after it (`usePictureDropHandler`) — and the remaining two
  deliberately seed user-overridable state from a derived value. Read a finding
  before acting on it; the bail-out it causes is usually the correct outcome.

- **Toast auto-dismiss policy — do NOT centralize on `style`.** The
  convention is "errors (`danger`) persist + dedupe by `id`; transient
  notices auto-hide via `timeout`", enforced per call site. It's tempting to
  move this into `toastsAdd`'s `prepare` (`src/features/toasts/model/actions.ts`)
  as a style-keyed default (danger → no timeout, else 5000), but an audit of
  all ~100 `toastsAdd` calls shows `style` does **not** map to timeout policy:
  `info` is used for _persistent panels_ (measurement results in
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

Tracked as GitHub issues (label `area: premium`). The framing constraints still hold and gate what's
acceptable there: payment provider (Polar) acceptable-use rules and content
licensing mean safe premium = our own compute/infra or power-user limits; avoid
third-party data (license risk — see Strava) and community content (CC-BY-SA
can't be made exclusive + optics). Keep the free/open core intact.

## Drawing (`src/features/drawing/`, see [`doc/drawing-export-mapping.md`](./doc/drawing-export-mapping.md))

Bugs and feature requests are issues under `area: drawing`.

- [ ] **No coverage for the hole wire formats.** The reducer's linking, cascade
      delete and stale-index tolerance are tested, but nothing exercises the
      round-trips the design leans on: URL `H` field ↔ store, document
      `holeOf` ↔ `holeOfId` (and the my-maps fingerprint agreeing across both),
      the GeoJSON interior rings, the GPX `fm:polygonId` / `fm:holeOf` pairing,
      and KML `innerBoundaryIs`. These are pure functions over small fixtures —
      cheap to pin, and the place a regression would go unnoticed longest.

## Track viewer: generic geodata vs. recorded tracks

The track viewer began as a GPX recording viewer and grew into a general geodata
viewer (GPX/KML/KMZ/TCX/GeoJSON, later maybe GPKG). Affordances written for a
single recorded GPS log misfire on arbitrary imported geometry. The through-line
of the fixes is **provenance, not heuristics**: tag each feature at parse time
with what it actually was in the source and key behavior off that — never
re-derive "is this a track?" from density/timestamps. Remaining user-facing
gaps are issues under `area: data-viewer`.

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
      `renderTrackGeojson`, `activeTrackIndex` still read as track-only. A
      semantic rename, not the mechanical one that's done.
- [ ] **One field for the armed map-click mode.** `splitting` / `splitPoint` /
      `joinWith` model one thing — which mode the next map click is in — as
      three fields, so the "at most one armed" invariant is re-asserted by hand
      in `clearModes` and in each set-case, and every consumer ORs them
      together (`keyboardHandler`'s Escape and Delete, `DataViewerResult`'s
      `join.handleClick(…) || split.handleClick(…) || select(…)`). A
      discriminated `mode: { type: 'split'; … } | { type: 'join'; … } | null`
      makes it structural, and a `useTrackModes` hook then gives the map one
      `{ armed, handleClick, handleMove, handleOut, halos }` instead of a
      per-mode fan-out. Do it when a third mode lands, or sooner. Two details
      to fold in: `joinWith.featureIndex` duplicates `main.selection.id` (pass
      `selectedIndex` in, as `useTrackSplit` already does — but note the
      selection is cleared by paths that don't dispatch `selectFeature`), and
      the drawing/dataViewer slices spell "not armed" as `undefined` vs `null`,
      which is why the Delete guard reads as two conditions.

## Drawing vs. data viewer: one model, two storage budgets

The two features hold the same kind of thing — a named, styled point, line or
polygon with a property table — and keep converging: the style modal, the
simplify dialog and now the properties editor are literally the same component.
The only real difference is where the features live: drawing rides in the URL,
so it cannot carry per-point data (elevation, heart rate, cadence, times);
loaded data lives in IndexedDB, so it cannot be shared by link. Both differences
disappear once the user saves a map, which is why "why are there two of these?"
is a fair question from anyone who hasn't hit either limit.

Not a merge — the URL budget is real and doesn't go away. The aim is to stop
presenting one model as two kinds of object. Open items are issues under
`area: drawing` and `area: data-viewer`.

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

## Map layers and presets (`src/features/map/`, see [`doc/map-library.md`](./doc/map-library.md))

Bugs and feature requests are issues under `area: maps-layers`.

- [ ] **Decide a map's kind once, per drawing.** It is worked out in about eight
      places: `withKind` in `allLayerEntries`, `libraryIndexSelector` and
      `resolvedCustomLayersSelector` hand out defs already switched by the map's
      own setup, so a preset's copy has to switch back (`withMemberKind` in
      `Layers`, `capturePreset`, `useTargetDef`); the reducer's `itemKindsOf`
      and the panel's `Stack.kindOf` each build their own item → kind lookup,
      and the reducer's `kindsOf`/`nativeKindsOf` rebuild what
      `layerKindsSelector`/`nativeKindsSelector` hold, since it sees only
      `MapState`. Instead: def selectors stay native, `layerInstancesSelector`
      sets every instance's kind (a map on its own from its setup, a preset's
      copy from the copy's), and `withKind` runs where `Layers` draws. Lists of
      maps not on the map — the switcher, `overlayStackSelector`, the library —
      have no instance, so they read `layerKindsSelector` instead of
      `def.layer`. One exported item-kind function over `MapState`-level
      inputs, for the reducer and the stack alike. Clarity only, no known bug:
      the `defaultOpacity` a switch-back leaves on a base copy is ignored by
      `resolveLayerOpacity`. Medium to large — many readers expect `def.layer`
      switched.
- [ ] **Take `i` out of `map.layers`.** It is a per-device "hide the tools'
      features" flag stored as an inverted layer, special-cased in the switcher,
      `Main`, the panel's `makesNew`, `canPreview`, the link writer (dropped) and
      `getMapStateDiffFromUrl` (re-added). A boolean in the map slice, migrated
      in `persistence.ts` from `layers.includes('i')`, with the menu row and the
      shortcut toggling it, removes those cases.
- [ ] **Helpers for a map's effective settings.** The shortcut
      (`settings.shortcut === undefined ? def.shortcut : …`) and the
      menu/toolbar defaults are recomputed inline in `YourMapsList`,
      `CustomMapEditor`, `MapSwitchButton`, `commandDefinitions`,
      `keyboardHandler` and `CacheTilesForm`: put them beside
      `isLayerInstalled` in `installed.ts`, the default passed in. Likewise
      `layerName(def, m) ?? def.type`, hand-written at six sites.

## Search / Photon geocoder (see [`doc/photon-geocoder.md`](./doc/photon-geocoder.md))

- [ ] **Report the duplicate hits upstream.** Photon answers with one OSM element
      more than once, and with a settlement twice over. Both come from Nominatim's
      model rather than from our index — komoot's own instance shows the same — so
      the fix belongs upstream, not in a filter of ours over the dump: - **A relation with two classifying tags is indexed twice.** Every Slovak
      cadastral community is `boundary=cadastral` **+**
      `place=cadastral_community`, and Nominatim keeps a row for each
      (`R2386490` → `place/cadastral_community` and `boundary/cadastral`,
      confirmed via `details.php?…&class=`). A `place` tag on
      `boundary=administrative` is absorbed instead, which is why towns come
      back once. - **A place node and its boundary relation both answer.** `N530544488` is
      the `label` member of `R1690324` (Košice); Nominatim links the two and
      returns only the relation, but the JSONL dump carries no
      `linked_place_id`, so Photon indexes both. Not the same as the closed
      [#95](https://github.com/komoot/photon/issues/95) (three Kraków
      relations differing only in `admin_level`, closed as a mapping issue):
      here the link exists upstream and is merely lost in export. - **A city's address names one of the districts it contains.** Photon
      addresses `R1690324` as _District of Košice IV_; Nominatim's own
      `lookup` answers _Košice, Košický kraj, Slovensko_ for the same object.
      So the address is taken from the feature's point somewhere in Photon's
      pipeline, and Košice contains four okresy — any single one is wrong. - **Every piece of a station answers separately.** `q=kosice&limit=30`
      returns 8 × `railway=stop`, 6 × `railway=platform` and 6 ×
      `railway=platform_edge`, all named Košice at postcode 040 22 —
      indistinguishable rows for one station. **`dedupe` does not cover this
      and is not meant to**: it works (`q=hlavna` collapses 25 rows to 14) but
      only for `osm_key=highway`, deliberately narrowed after
      [#367](https://github.com/komoot/photon/issues/367), where a greedier
      rule swallowed bus stops. Widening it is the open
      [#588](https://github.com/komoot/photon/issues/588), not a bug.
      `searchProcessorHandler` dedupes exact repeats by element id, which is the
      client's share of this; the rest wants reporting at
      `github.com/komoot/photon`. Every case above reproduces on
      `photon.komoot.io`, which runs the same 1.3.0 and the same 2026-08-08
      import, so none of it is our index.

## Branding assets (`src/images/freemap-*.svg`)

The logo became vector in `f0cf4885` (2026-09-01): `freemap-logo-sk.svg`,
`freemap-logo-eu.svg` and the site-neutral `freemap-flower.svg`, with gloss from
gradients rather than SVG filters, and text converted to paths. The entry
document stamps `data-site` on `<html>`, so CSS, the pre-JS bootstrap and the
print logo all pick the same wordmark. The editable sources, which still carry
live Sriracha text, are in [`design/`](./design/README.md) alongside the export
procedure and the two traps it has to avoid.

`RspackIconsPlugin` renders every raster from those SVGs at build time, so no
generated bitmap is committed: the favicons, apple-touch and mstile icons and the
manifest icons are the flower alone (site-neutral, all sizes), the iOS splash
screens carry the wordmark per domain, and the `og:image` is 1200×630 with the
tagline under it, per domain and language. The header logo is a raster too, at
1×–4× behind `image-set()` — Firefox draws these SVGs blurred at that fixed small
size, and a vector buys nothing where the box never changes. The tagline lives in
`entryDocs` in `rspack.config.ts` beside the other build-time copy, set in the
bundled `src/fonts/LiberationSans-Bold.ttf` so CI and local renders match.

Four rasters under `src/static` are referenced by nothing and stay anyway:
`logo.jpg`, `freemap-logo.{png,jpg}` and `freemap-logo-for-garmin.jpg` drew 114,
39, 32 and 35 requests on 2026-09-06. `logo.jpg` was the `og:image` until
`d7fbc64c`, so WhatsApp and iMessage keep unfurling links shared before then
against it; the rest are fetched by real browsers, so something outside this repo
embeds them. Deleting any of them only looks safe because the deploy rsync has no
`--delete`.

Open items are issues under `area: ui-ux`.

## Drawing properties (`props` on points and lines)

- [ ] **Reconsider the carried-tag allowlist** (`CARRIED_TAGS` in
      `drawingPointActions.ts`). Ten keys is a guess at what's useful without
      making a bulk conversion produce an unsendable link; revisit once there's
      a sense of what people actually reference in labels.

## Panorama (`src/features/panorama/`, see [`doc/panorama.md`](./doc/panorama.md))

Shipped as an MVP: pick a viewpoint, 360° render, pan/zoom, peak labels, the
distance probe, a premium quality tier. What it does not do yet is issues under
`area: panorama`; the cleanups it left behind stay here:

- [ ] **The dev server's own freeze makes the panorama hard to work on.** A
      render landing blocks the main thread for ~5 s under `pnpm start` — the
      JS heap goes 367 MB → 1534 MB across one React commit — while the same
      render in a production build costs 10 ms of React work at a 36 MB heap.
      Unminified React and Redux DevTools retaining a state snapshot per action
      are between them the whole of it. Worth knowing before chasing a panorama
      performance report: **measure a built bundle**, or the numbers are the
      tooling's, not the app's. `devTools: true` in `store.ts` is unconditional,
      so a user with the extension installed pays the same on the live site;
      gating it on the dev build would take that away, at the cost of not being
      able to inspect a production session.
- [ ] **Extract a `ColorPickerPopover` shell.** `PanoramaGroundPicker` and
      `RgbaColorPicker` now carry the same ~60 lines: the `OverlayTrigger` /
      `Popover` / body-portal, the swatch button, and the `setUrlUpdatingEnabled`
      drag suspension that keeps Safari's 100-writes-per-10s pushState cap out
      of a colour drag. That workaround exists in three places counting
      `ShadingColorPicker`, and will be fixed in one of them. Do _not_ bolt a
      gradient mode onto `RgbaColorPicker` — its value is a string and this
      one's is `{color, gradient}`; the shell is the shared part.
- [ ] **Share the `linear-gradient` codec with `ShadingColorPicker`.** Both
      hand-roll `@zdila/react-gradient-color-picker`'s wire format, including
      the upper-cased `RGBA(` that marks the selected stop, and their regexes
      have already drifted (`\s+` vs a literal space). The stop _models_ differ
      legitimately; only the CSS format is shared. `gradient.test.ts` covers
      this side, the shading side has no tests at all.
- [ ] **`fadeToSky` could live on the stop.** The wire takes `'sky'` as any
      stop's colour; the client models it as a gradient-level boolean meaning
      "and the last one", which `previewStops`, `storedStops` and
      `gradientRequest` each re-derive. A `{ pos, color, sky? }` stop keeps the
      UX exactly as it is — the retained colour is what unticking restores — and
      makes a mid-ramp sky representable. It does not remove the picker
      round-trip: `SKY_COLOR` still goes out and comes back as a real colour.

## Weather radar (`src/features/weatherRadar/`, see [`doc/weather-radar.md`](./doc/weather-radar.md))

[`doc/weather.md`](./doc/weather.md) records what was asked of the upstream feed
and what landed. Nothing is outstanding there.

- [ ] **Leftovers of the old LibreWXR instance on fm5.** The container is gone,
      but the `weather.freemap.sk` vhost and its cert still point at the dead
      upstream, and `/fm/data4/librewxr` still holds ~3 GB of its tiles.

## Route path details (see [`doc/elevation-and-colorizers.md`](./doc/elevation-and-colorizers.md))

Colorize, path details and track matching are issues under `area: routing` and
`area: data-viewer`.

## Terrain shading (`terrain.tiles.freemap.sk`)

- [ ] **Delete the tilesets the shading layers no longer read**, once this all is
      deployed: `dem-sk.mbtiles` and `dem-cz.mbtiles` (the old `y`/`z` sources,
      ~1.2 TB), `dmr5-shading.mbtiles` (`5`) and `cz-shading.mbtiles` (`8`) in
      `/fm/storage1/tilesets` on fm6, plus the `parametric-shading`,
      `dmr5-shading` and `cz-hires-shading` vhosts and their
      `/fm/storage-offsite/tilesets` copies. `sk-dmr-hires.mbtiles` (`7`)
      stays until the lidar-rendered Slovak source replaces it.
- [ ] **Rebuild `at.tif` at z17 if fm6 runs short of space.** It is 1 m data
      at z18 (~600 GB); z17 is about a quarter of that and only slightly less
      sharp. `pl.tif` is z17 for space alone and could go to z18 once there is
      room (~2.5 TB).
- [ ] **Finer Austrian Länder as their own sources.** `at` is the nationwide
      1 m ALS DTM; Tirol (statewide 0.5 m GeoTIFF mosaic, tiris) and
      Oberösterreich (0.5 m) publish finer ones, Vorarlberg a laserscan model
      of unconfirmed resolution. Each would go in at z18 ranked above `at`, as
      `ch` is, with its credit added to elevation-sources.
- [ ] **Italian regional DTMs as their own sources, ranked above `it`.** `it` is
      the IRPI-CNR HR-DTM at z15, de-blocked and de-rippled. Its Alps are
      pixel-doubled TINITALY 10 m, because the full-coverage regional sets
      were never used (inputs: Table 1 of EarthArXiv preprint 12152). By gain
      for effort: 1. Trentino: 0.5 m lidar, CC BY 4.0, a plain directory listing
      (`siatservices.provincia.tn.it/stemdata/2014_lidar_dtm_asc/`, ~194 GB ASCII). 2. South Tyrol: 2.5 m province-wide, CC0, WCS (`geoservices9.civis.bz.it`). 3. Piedmont: ICE 2009–11 5 m lidar, CC BY 4.0, WCS on `geomap.reteunitaria.piemonte.it`. 4. Friuli-VG: RAFVG 2017–20 0.5 m, CC BY 4.0, Eagle.fvg downloads. 5. Emilia-Romagna: RER 0.5 m, WCS, ~64% of the region so far. 6. Aosta (lidar, per-tile app) and Veneto (5 m lidar, per municipality).

      Also watch the MASE PNRR 0.25 m national reflight: it would cover
                      Lombardy, the Apennines, Sardinia and the South, which have no usable
                      regional lidar. Unverified: Aosta's resolution, Veneto's CRS, which
                      parts of E-R are covered, and some licences.

- [ ] **Slovakia from lidar points at z18**, replacing `sk.tif` and then `7`:
      `laz2geotiff xyz` (ground only, relative gap rule), the two-pass membrane
      `fill` with `--reach`, clipped by an official ÚGKK border (not OSM), the
      way Czechia was built.
- [ ] **The other 13 German states**, one source each (`de_<state>`, keyed by
      their elevation-sources directory) at z17, ~650 GB. Their 1 m DGM1 is
      already in `/fm/storage2/dtm` on fm6; Bavaria, Baden-Württemberg and
      Hessen went first by Matomo visits.
- [ ] **Hungary**: the most engaged audience without terrain (Matomo), but no
      open national DTM is known. Look for one.
- [ ] **France from IGN LiDAR HD**, mountains first. RGE ALTI (on fm6) is
      only ~5 m in the mountains; the 0.5 m LiDAR HD MNT is published for all
      of the Alps, Pyrenees, Corsica and the Vosges (Etalab 2.0). No bulk
      download: the WFS index `IGNF_LIDAR-HD_METADONNEE:metadata` on
      `data.geopf.fr` gives each 1 km tile's `url_mnt` (2000×2000 Float32
      GeoTIFF, EPSG:2154), ~40 req/s. Alps + Pyrenees ≈ 76k tiles, ~1.2 TB raw;
      recompress as they arrive. Corsica is IGN78, lakes and military zones
      are nodata. Sample z17 vs z18 first. The rest of France can come from
      RGE ALTI at z15 below it, re-interpolated with a cubic spline where its
      5 m lattice shows (bilinear facets otherwise shade as squares).
