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
viewer, Wikimedia Commons (`show=wmc/<pageId>`) and Wikipedia
(`show=wiki/<lang>:<title>`) previews all route through the same `show=` param.

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

## Elevation / track chart

- [ ] **Multi-property track chart.** Generalize the elevation chart into a
      multi-property chart: X axis = time **or** distance; Y axis selectable among
      elevation, speed, orientation/heading, GSM signal, battery level, distance,
      time, … Applies to trackViewer and tracking (and, where data exists, the
      planned route). The colorizer data adapters already expose most of these
      series, so the chart and the colorizers could share one per-track "series"
      extraction layer.
- [ ] **Toggle waypoints in the chart.** An option to show/hide the waypoint
      markers + labels on the chart.
- [ ] **Label route midpoints.** The route-planner midpoints now show as
      unlabeled markers on the elevation chart; let the user assign a name to
      each midpoint so it renders as a waypoint label.
- [ ] **Waypoint distance ticks on the x axis.** Option to show each waypoint's
      distance value along the x axis.
- [ ] **Waypoint elevation readout.** Option to show a waypoint's elevation —
      either on the y axis or appended to the waypoint label (design undecided).
- [ ] **Save chart image.** A button to export the chart as an image (SVG).
- [ ] **Further chart enrichments.** Axis units, and think about what else is
      useful (grid/legend, hover crosshair readout, gradient/steepness shading,
      min/max/avg markers, …).
- [ ] **Attribute the elevation data source where it's used.** The elevation API
      now serves per-country high-res DTMs (SK/CZ/AT/CH/IT/SI/ES/SE) with a global
      GEDTM30 fallback, but the only place we credit them is the hand-maintained
      `llms.txt` and the outdoor-map layer attribution in `mapDefinitions.tsx`.
      Show the source next to where the value is consumed: the elevation chart,
      the point readout (`ElevationInfo.tsx`), and probably track colorization.
      Prefer having the **backend return the source** per point/response (which
      DTM answered) so we don't hand-sync the country→provider table on both
      sides — the mapping is currently inferred from `ELEVATION_SOURCES` and
      duplicated by hand.

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
      as a single-segment track. A new `trackViewerSetElevation` processor
      refreshes an already-open chart when elevation is refilled (it no longer
      goes stale until re-opened). The "more info" stats are now multi-segment
      aware (climb/descent measured per segment).
      **Still TODO:** start/finish markers' permanent distance tooltips can stack
      when several tracks are shown (hover-only when >1).
- [~] **Waypoints on the elevation profile.** Standalone points (GPX `<wpt>`)
      are pinned onto the chart with a stem, a dot on the line, and the name as
      a label. `elevationChartSetTrackGeojson` takes a `waypoints` arg (the
      trackViewer passes its Point features via `trackWaypoints`, including each
      `<wpt>`'s optional time). A waypoint is pinned only where the profile
      passes within `WAYPOINT_SNAP_METERS` (100 m); among those candidates it
      picks the one closest in **time** when both the waypoint and the track
      carry timestamps (disambiguating a self-crossing track), else the nearest
      in space. The local resolver carries each profile point's recorded time;
      the API-sampled path has none and uses spatial pairing. **Refinement:** a
      very sparse line could still miss a mid-segment waypoint — could project
      onto the nearest segment rather than the nearest vertex.
- [ ] **Rename the feature away from "track viewer".** It's now a general geodata
      viewer (GPX/KML/KMZ/TCX/GeoJSON, points/lines/polygons, multi-file), so the
      `trackViewer` name is misleading. Rename the directory
      (`src/features/trackViewer/`) and all its symbols — components
      (`TrackViewer*`), the redux slice + state/actions/processors
      (`trackViewer*`, `trackGeojson`, `TRACK_VIEWER_*`), hooks/utils
      (`useStartFinishPoints`, `trackSelection`, `trackEndpoints`,
      `parseTrackFile(s)`, `trackWaypoints`, …), the per-feature `translations/`
      bundle and its message keys, and the doc references (`doc/architecture.md`,
      `doc/elevation-and-colorizers.md`, `CLAUDE.md`, `llms.txt`). Candidate
      names: `geodataViewer` / `fileViewer` / `mapDataViewer` (decide first).
      **Keep serialized identifiers stable for back-compat** — the persisted
      slice key (`trackViewer` in the saved state / `Persisted*Schema`) and the
      URL tokens (`tools=import-file`, the legacy `track-viewer` /
      `#show=upload-track` / `gpx-url=` / `load=` aliases) must keep working, so
      either keep those literal strings or add migrations/aliases. Mostly a
      mechanical symbol rename; do it in its own PR to keep the diff reviewable.

## Live tracking

- [ ] **Convert-to-drawing for live tracking** (`src/features/tracking/`). The
      tracking feature has no "convert to drawing" yet; add one so a recorded
      live track can be turned into an editable drawing. Unlike the track viewer,
      tracking should **keep** the original (the live feed continues), so it's a
      lossy *copy* not a replace — no rich-data warning needed, just the
      simplify prompt for the dense recording. Likely a new `convertToDrawing`
      payload variant (e.g. `{ type: 'tracking'; id }`) handled in
      `convertToDrawingProcessor`, plus a menu action in the tracking UI.

