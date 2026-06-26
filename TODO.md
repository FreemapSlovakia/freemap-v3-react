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
- [ ] **Waypoint distance ticks on the x axis.** Option to show each waypoint's
      distance value along the x axis.
- [ ] **Waypoint elevation readout.** Option to show a waypoint's elevation —
      either on the y axis or appended to the waypoint label (design undecided).
- [ ] **Save chart image.** A button to export the chart as an image (SVG).
- [ ] **Further chart enrichments.** Axis units, and think about what else is
      useful (grid/legend, hover crosshair readout, gradient/steepness shading,
      min/max/avg markers, …).

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
      goes stale until re-opened). The "more info" stats are now multi-segment
      aware (climb/descent measured per segment; see the selection item below).
      **Still TODO:** start/finish markers' permanent distance tooltips can stack
      when several tracks are shown (hover-only when >1).
- [x] **Operate on a chosen track, not `features[0]`.** A `selectedTrackIndex`
      in the slice picks the active line among the loaded line-like features
      (`trackSelection.ts`); the chart, "more info" and the map highlight act on
      it, defaulting to the first line. Two synced ways to choose it: a `Track`
      dropdown in the toolbar (shown when ≥2 lines) and clicking a line on the
      map; the active line gets a blue halo under it (a pane below the
      foreground, RoutePlanner-style — the line's own style is untouched).
      Switching the active track refreshes an open chart. Selection resets on
      load. `trackGeojsonIsSuitableForElevationChart` now checks "any line
      exists" instead of `features[0]` (fixing the waypoint/polygon-first bug).
      No "All tracks" aggregate — separate activities aren't auto-concatenated.
- [~] **Waypoints on the elevation profile.** Standalone points (GPX `<wpt>`)
      are pinned onto the chart with a stem, a dot on the line, and the name as
      a label. `elevationChartSetTrackGeojson` takes a `waypoints` arg (the
      trackViewer passes its Point features via `trackWaypoints`); the chart
      handler pins each to the nearest profile point on the same distance axis,
      dropping any farther than `WAYPOINT_SNAP_METERS` (100 m). **Refinement:**
      pairing is spatial nearest-*profile-point* (good for dense recordings; a
      self-crossing track can mis-snap, and a very sparse line could miss a
      mid-segment waypoint) — could upgrade to time-based when both sides have
      timestamps, and to nearest-point-on-segment for sparse lines.
- [x] **Honest convert-to-drawing.** Drawing state lives in the URL hash, so
      per-vertex HR/cadence/elevation can't be carried. Keeping the source track
      visible (tried first) duplicated the geometry and its click hit-area, so
      the convert still **replaces** the track — but only after an informed
      single prompt. For a dense recording (`fm:kind === 'track'`, the only
      convert source that deletes rich per-vertex data — routes/search/objects
      have none, live tracking has no convert) one `window.prompt` both warns
      that the recorded data is dropped and asks for a simplification factor
      (Cancel aborts). Routes and generic geometry have nothing rich to lose and
      aren't worth simplifying, so they convert straight away with no prompt.
- [x] **Open/add multiple files into one view.** The import modal and the
      app-wide file drop accept several files at once (`parseTrackFiles` merges
      them in file order); when geodata is already shown the user is asked (via
      the confirm dialog, extended with a third button) whether to append or
      replace. No per-source legend/list — to change what's shown, re-import.
      Multiple *tracks* aren't auto-concatenated for stats; the "operate on a
      chosen track" item below covers picking which one the chart/info acts on.

## Live tracking

- [ ] **Convert-to-drawing for live tracking** (`src/features/tracking/`). The
      tracking feature has no "convert to drawing" yet; add one so a recorded
      live track can be turned into an editable drawing. Unlike the track viewer,
      tracking should **keep** the original (the live feed continues), so it's a
      lossy *copy* not a replace — no rich-data warning needed, just the
      simplify prompt for the dense recording. Likely a new `convertToDrawing`
      payload variant (e.g. `{ type: 'tracking'; id }`) handled in
      `convertToDrawingProcessor`, plus a menu action in the tracking UI.

