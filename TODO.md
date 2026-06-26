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

## Idea for later — multi-property track chart

Generalize the elevation chart into a multi-property chart: X axis = time **or**
distance; Y axis selectable among elevation, speed, orientation/heading, GSM
signal, battery level, distance, time, … Applies to trackViewer and tracking
(and, where data exists, the planned route). The colorizer data adapters already
expose most of these series, so the chart and the colorizers could share one
per-track "series" extraction layer.

## Track viewer: generic geodata vs. recorded tracks

The track viewer began as a GPX recording viewer and grew into a general geodata
viewer (GPX/KML/KMZ/TCX/GeoJSON, later maybe GPKG). Affordances written for a
single recorded GPS log now misfire on arbitrary imported geometry. The
through-line of the fixes below is **provenance, not heuristics**: tag each
feature at parse time with what it actually was in the source and key behavior
off that — never re-derive "is this a track?" from density/timestamps.

- [x] **Tag feature provenance at parse time.** `parseTrackFile` stamps
      `fm:kind: 'track' | 'route' | 'waypoint' | 'feature'` (see `provenance.ts`)
      from togeojson's `_gpxType` (`trk`/`rte`), Point waypoints, TCX (always
      `track`), and KML/GeoJSON (`feature`); an already-stamped kind is respected
      so an exported-then-reimported GeoJSON round-trips. Foundation for the
      convert/selection items.
- [~] **Start/finish markers + distance labels only for tracks/routes.**
      `useStartFinishPoints` now emits a pair only for `fm:kind` track or route
      (`isTrackOrRoute`), so a KML/GeoJSON full of generic lines/polygons gets no
      flags — the original clutter complaint. (Route included too: GPX `<rte>` is
      a deliberate line where start/finish + distance helps; only generic
      `feature` geometry caused the clutter.) **Still TODO:** with several tracks
      the permanent distance tooltips can still stack — show them on
      hover/selection when there's more than one.
- [x] **One track = one unit (single- or multi-segment).** `useStartFinishPoints`
      treats a `MultiLineString` (interrupted recording) as one track: one start
      (first vertex of first segment), one finish + total distance (turf length,
      gaps excluded), endpoint times read from the nested
      `coordinateProperties.times`. No more N marker pairs, and a multi-segment
      track that previously showed none now shows one. (`TrackViewerResult` still
      flattens only for rendering the polylines.) The "more info" toast stats
      being multi-segment-aware is tracked under the stats item below.
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
      goes stale until re-opened). **Still TODO:** the "more info" toast stats and
      start/finish markers treating a multi-segment recording as one unit
      (overlaps the marker item above).
- [ ] **Operate on a chosen track, not `features[0]`.** Elevation chart / "more
      info" / colorize currently silently pick the first line; `trackGeojsonIs
      SuitableForElevationChart` even checks `features[0]` (wrongly disables the
      chart when the first feature is a waypoint/polygon). With multiple tracks,
      clicking a line selects it and the actions operate on the selection (or an
      explicit "All"); single track behaves as today.
- [ ] **Waypoints on the elevation profile.** Pair `<wpt>` points onto the
      profile by time when both the waypoint and track have timestamps (handles
      self-crossing tracks); else by spatial projection onto the polyline within a
      max-snap-distance; else omit.
- [ ] **Honest, non-destructive convert-to-drawing.** Drawing state lives in the
      URL hash, so per-vertex HR/cadence/elevation genuinely can't be carried —
      accept the loss instead of fighting it. (a) Keep the source track loaded
      after converting (or convert into a new drawing rather than consuming the
      track) so the rich data isn't gone. (b) Warn before converting only when
      there's data to lose (`fm:kind === 'track'` with sensor/elevation series).
      (c) Offer the simplify prompt only for `fm:kind === 'track'`; routes and
      generic geometry convert at full fidelity with no prompt.
- [x] **Open/add multiple files into one view.** The import modal and the
      app-wide file drop accept several files at once (`parseTrackFiles` merges
      them in file order); when geodata is already shown the user is asked (via
      the confirm dialog, extended with a third button) whether to append or
      replace. No per-source legend/list — to change what's shown, re-import.
      Multiple *tracks* aren't auto-concatenated for stats; the "operate on a
      chosen track" item below covers picking which one the chart/info acts on.

