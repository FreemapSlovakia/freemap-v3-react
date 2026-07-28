# Track data: import, elevation, colorize, export

How imported/recorded/planned tracks acquire elevation, get colorized, and round-trip
through file formats. One shared elevation-acquisition layer and one shared colorizer
layer feed every consumer — **routePlanner**, **trackViewer**, **tracking**, and
**export** — so changes belong in the shared modules below, not per-feature.

Guiding principle: **gaps are the honest default; enrichment is opt-in.** Elevation is
filled automatically only where intent is unambiguous (a planned route, where the
router's DEM ≈ ours); imported tracks of unknown provenance are prompted before their
recorded elevation is touched. A missing value renders as a gap (split polyline, grey
`NO_DATA_COLOR`), never as a guessed `0`.

## Shared elevation acquisition — `src/shared/elevation.ts`

All elevation reads go through the batched `/geotools/elevation` endpoint via three
functions (each has authoritative JSDoc — read it before changing behavior):

- **`fetchElevations(latLons, getState, cancelActions?)`** — one POST for a batch of
  `[lat, lon]` pairs; returns one `number | null` per pair (`null` = API has no data),
  in input order. Empty input → no request.
- **`enrichElevations(features, 'missing' | 'all', …)`** — returns *copies* of
  `LineString` features with `z` filled. `'missing'` fills only coords lacking a `z`
  ordinate; `'all'` overwrites every `z`. Never mutates input; `'missing'` with nothing
  to fill returns the input array as-is (no request). This is the LineString-feature
  path used by routePlanner/trackViewer.
- **`densifyAlong(feature, …)`** — inserts intermediate points (≈2 px, between 1 m and
  100 m spacing, via `@turf/along`) into segments long enough to draw as a coarse
  straight line, then
  DEM-samples *only* the inserted points (existing vertices keep their elevation). A
  dense line is a reference-equal no-op. **Drops `coordTimes`/`coordinateProperties`**
  (can't be interpolated) — so its output is render-only, never exported. The 1 m floor
  (`FINEST_DEM_METERS`, the grid of the finest model the API serves) matters on short
  routes, where 2 px/sample would otherwise ask for sub-metre spacing: that buys no
  detail, only the model's own quantization drawn as steps and hundreds of points for a
  couple of hundred metres.

GraphHopper returns per-point elevation inline using `0` as its no-data sentinel,
normalized to 2D per-coordinate on the way in.

### Render-only densified geometry (never exported)

Densification exists purely so charts/colorize don't draw straight DEM-ignorant
segments. The densified line is cached as a *derived* slice field, distinct from the
real geometry, and is never serialized:

- **trackViewer**: `renderTrackGeojson` (vs. `trackGeojson`), built lazily by
  `ensureRenderGeojson` (`src/features/trackViewer/model/`) **only after a server
  elevation override** — the one state where every point is known DEM-derived, so
  inserted DEM points add no seam. A track's own recorded elevation is left alone (no
  DEM injected between measured points). `trackViewerDensifyProcessor` keeps it fresh.
- **routePlanner**: `renderGeojson` via `ensureRouteRenderGeojson`. A planned route has
  no recorded measurement, so for **premium** the router's own (different-DEM,
  shape-point-density) elevation is ignored for rendering: `enrichElevations('all')`
  overrides every vertex from our DEM, then `densifyAlong` adds DEM points. Everyone else
  keeps GraphHopper's elevation, fills only what lacks it, and isn't densified — so the
  free tier never loads the elevation service. `alternatives` keep GraphHopper's
  elevation so export and the drawn route/distances are untouched.

Consumers read `renderTrackGeojson ?? trackGeojson` (`Results.tsx`,
`TrackViewerDetails.tsx`). Chart paths `await ensureRenderGeojson` first.

### Bridges and tunnels — `src/features/routePlanner/model/structureElevation.ts`

A DTM has bridges removed and mountains intact, so the profile of a routed line dives to
the stream bed under every bridge and climbs over every tunnel. The fix uses the router's
tagging rather than spike detection, so genuine narrow terrain detail is never at risk:
the GraphHopper request asks for `details: ['road_environment']`, and `fromGraphhopper`
clips its `bridge`/`tunnel` intervals onto each `Step` as `structures` (indices into the
step's own coordinates).

`ensureRouteRenderGeojson` then:

1. `flattenWithStructures` merges legs/steps into one coordinate list (dropping the vertex
   consecutive steps share) and converts the structure ranges into **spans in metres along
   the line** — a structure split across a step boundary is rejoined here;
2. `straightenStructures` runs **after** `densifyAlong` and replaces the elevation of every
   point strictly inside a span with a straight line between the road either side of it.

Each end of that line is the **median** of the samples within 10 m outside the span
(`anchorElevation`), not the single sample at the span's edge. A tunnel portal is one of the likeliest
places for a single sample to sit metres above the road, and anchoring a 400 m bore on it
tilts the whole thing. The median costs only the road's grade over a few metres.

Metres, not indices, because densification renumbers every point but leaves distances
along the line alone — and it must run last, since the inserted points are DEM-sampled too
and would otherwise put the notch straight back inside a long bridge. It applies on the
free tier as well (GraphHopper's own DEM has the same holes) at no request cost. Only
`renderGeojson` is affected; exports keep the router's raw elevation.

**OSRM routes** (`car-osrm`/`bike-osrm`/`foot-osrm`) keep the artifacts: the OSRM route
response carries no bridge or tunnel data at all (only name/ref/mode/intersections), and
this correction is deliberately limited to what a router states outright.

### Spikes and culvert ditches — `src/shared/elevationSmoothing.ts`

`smoothElevation` runs two passes over what no router can flag, despiking first so the
fill's depth test reads clean values:

**`despike`** — a running median over `elevationSettings.despikeWindow` metres. Where a
way is digitised a few metres off the road it describes, the terrain model answers with
the bank or rock face beside it, and those excursions go *up* as often as down — the
fill-only pass below can't see them. A median drops an excursion narrower than half the
window outright and leaves a slope exactly alone, where averaging (what the colorizers do
to their own values) would only spread a 13 m spike into a 13 m bump; a road profile has
no genuine one-sample summit to lose. The window shrinks symmetrically near the ends, or
the first and last points slide off a plain slope. A `smoothValues` average over *half*
that window follows: a median outputs one of its own input samples, so it can only jump
between them and leaves the profile in flat steps — the shorter average rounds those off
without letting the spikes back in.

**`closeNarrowDips`** — the ditches a terrain model adjusted for hydrology digs through
the road at every culvert, filled by **grayscale morphological closing** (a running maximum then a running minimum, `closeNarrowDips`), which is the
identity on everything wider than its window — slopes, ridges and broad valleys come back
bit-for-bit — so unlike an averaging filter it can't erode genuine terrain detail. It also
only fills *downwards*, so a narrow summit is never clipped. Only a run whose deepest
point clears 1 m is taken, and a run's ends sit at zero residual, so the result stays
continuous. The closing detects the dip; the fill itself is a straight line between the
points either side of it, since that's the road surface. (Substituting the closing's own
values instead fills only to the *lower* of the two rims, which reads as a flat shelf
ending in a step wherever the rims differ.) The closing still bounds the fill from below,
so no point is ever pulled down.

Both compose with the colorizers' own smoothing rather than fighting it: `smoothSeries`
(`colorize.ts`) low-passes the *values* along the path, and it reads the same render
geometry — so the order is impulse removal first, generalization second, which is the
right way round. The **elevation** colorizer therefore has no fixed baseline span of its
own (`featureSmoothingSpan(0, …)`); it smooths only by zoom, to stop detail finer than a
few pixels reading as color noise. A second fixed window there would paint less terrain
on the line than the chart beside it draws. **Steepness** keeps its
`DEM_RESOLUTION_METERS` baseline — that one is the distance slope is measured over, not
smoothing.

Its window is `elevationSettings.ditchFillWindow` (metres, `0` = off; see below). It can
stay small — 25 m by default — precisely because the wide structures are already handled
exactly by the router's data; that is what keeps the heuristic's false-positive risk low
in difficult terrain.

Neither pass rescues a way digitised into a riverbank next to a 1 m terrain model: those
excursions are tens of metres wide *and* tens of metres tall, and a window that big
flattens real terrain. The honest fixes there are to move the way in OSM, or to turn the
high-resolution model off.

`smoothElevationSeries` is the single entry point for both passes, so every consumer of
terrain-model elevation applies them in the same order: `ensureRouteRenderGeojson` (after
`straightenStructures`), trackViewer's `ensureRenderGeojson` (which already runs only
after a server elevation override), and the elevation chart's own
`processorHandler.ts`, which samples a drawn line or a measurement straight from the API.
Never on recorded altitude — these correct a terrain model, not a barometer — and never on
anything exported.
`runningExtreme` pads the series with its end values over a window's worth of distance —
a truncated window at either end would otherwise raise the first and last points of a
plain slope.

### Elevation settings — `src/features/elevationChart/model/settingsReducer.ts`

One persisted `elevationSettings` slice governs every elevation read and the profiles
derived from it, rather than a pref per consumer:

- **`despikeWindow`** — the median window above, in metres; `0` disables it.
- **`ditchFillWindow`** — the closing window above, in metres; `0` disables it.
- **`highResolution`** — premium-only. Switching it off makes `fetchElevations` send the
  request **without the `Authorization` header** (`httpRequest`'s `anonymous` flag): the
  API picks the model from the account, so opting out means not presenting it. This is
  the one lever that removes the artifacts at the source rather than patching them. It
  governs what a profile *shows*; the export fills pass `bestAvailable`, so a file the
  user keeps always carries the finest elevation the account can read.

All of them invalidate the derived caches (`routePlanner.renderGeojson`,
`trackViewer.renderTrackGeojson` clear on `elevationSetSettings`). `routePlannerColorizeProcessor`
and `trackViewerDensifyProcessor` rebuild them, which has to happen whether or not the
chart is open — an active elevation/steepness colorize reads the same cache. An open chart
additionally refreshes through each feature's existing refresh processor, each gated on
its own tool being open, since the chart doesn't record which feature owns it (see
`TODO.md`).

The UI is an *Elevation profile* group in `MapPreferencesModal`, reachable from a gear in
the elevation chart's own toolbar.

### Per-consumer elevation policy

- **trackViewer** prompts once per track when elevation is missing/partial — **Fill
  missing / Override all / Keep recorded** — and the answer drives `enrichElevations`
  writing `z` into `trackGeojson` (cached; static data). Full-elevation tracks skip the
  prompt; an explicit "update elevation" button overrides from the server. The prompt
  notes that "Override all" avoids the recorded-vs-DEM seam (steepness spikes at gap
  edges).
- **routePlanner** auto-fills (`'missing'`, lazy, cached per result) — no prompt.
- **tracking** uses recorded altitude as-is (`keepRecorded`); no fetch/cache, so it
  stays ephemeral for live data.
- **export** offers an opt-in **Elevation** control (Keep recorded / Fill missing /
  Override all; hidden for Garmin) — see below.

## Shared colorizers — `src/shared/colorizers/`

Imported via `@shared/colorizers/…`. One colorizer per visual variable lives in
`modes/` (`elevation`, `steepness`, `speed`, `heading`, `time`, `heartRate`, `cadence`,
`power`, `temperature`, `battery`, `gsmSignal`); `index.ts` aggregates them
(`colorizers`, `colorizingModes`, `ColorizingModeSchema`).

- Each `Colorizer` exposes **`isAvailable`**, which gates whether a mode is offered for a
  given feature — routes expose Elevation/Steepness/Time/Heading; a track exposes a mode
  only when it carries that channel's data. This is why the "Colorize by" dropdown
  differs per consumer.
- `colorizeByValues` (`colorize.ts`) maps values to a Hotline palette and flags missing
  values as gaps on `ColorizedPoint`; `splitOnGaps`/`noDataRuns` split a feature's points
  into gap-free runs so the Hotline render loop can break the line at gaps.
- Sensor colorizers read recorded `coordinateProperties` channels and fall back to
  computed values; absolute-scale ones (battery, GSM, temperature, power, cadence, HR)
  use `coordPropColorizerAbsolute` (`coordPropColorizer.ts`) so a given color means the
  same thing across tracks. Battery/GSM use a fixed 0–100 % scale.
- Colorize-mode labels live in `src/shared/colorizers/translations/`
  (`useColorizerMessages`), not the global message blob.

## Track file formats — import/export

togeojson bundles the `gpx`/`kml`/`tcx` parsers, so only KMZ needs an extra step
(unzip). The format layer lives under `src/features/trackViewer/`:

- **`parseTrackFile(text, filename)`** — the single import boundary. Resolves format by
  extension (falling back to the XML root element) to togeojson `gpx`/`kml`/`tcx` or
  `parseGeojsonFile`. Wired into both drop paths (`Main.tsx` `onDrop`,
  `TrackViewerUploadModal`). GPX stays raw text for the set-data processor; everything
  else becomes a `FeatureCollection`.
- **TCX normalization** relocates togeojson's top-level
  `cadences`/`speeds`/`watts`/`heartRates` onto
  `coordinateProperties.{cads,speeds,powers,heart}` so they colorize like an imported GPX.
- **`normalizePowerExtension`** aliases Garmin's
  `coordinateProperties['gpxpx:PowerExtensions']` to `powers` so the power colorizer and
  re-export pick it up like a plain `<power>` extension.
- **`kmz.ts` `extractKmlFromKmz`** (lazy `fflate`) unzips the root `.kml` (prefers
  `doc.kml`); bundled icons/overlays are ignored. The extracted KML flows through the
  normal KML path.

### Provenance, not heuristics — the geodata-viewer model

trackViewer began as a GPX recording viewer and grew into a general geodata viewer
(GPX/KML/KMZ/TCX/GeoJSON, points/lines/polygons, multi-file). Affordances written for a
single recorded GPS log misfire on arbitrary imported geometry, so behavior keys off
provenance tagged at parse time — never re-derived from density/timestamps:

- **`fm:kind: 'track' | 'route' | 'waypoint' | 'feature'`** (`provenance.ts`) is stamped
  by `parseTrackFile` from togeojson's `_gpxType` (`trk`/`rte`), Point waypoints, TCX
  (always `track`), and KML/GeoJSON (`feature`). An already-stamped kind is respected, so
  an exported-then-reimported GeoJSON round-trips. Start/finish markers + distance labels
  are emitted only for `isTrackOrRoute` (`useStartFinishPoints`) — generic `feature`
  geometry gets none, avoiding clutter.
- **One track = one unit.** A `MultiLineString` (interrupted recording) is one track: one
  start, one finish, total distance with inter-segment gaps excluded (no phantom
  straight-line distance across a pause). Stats, the elevation chart (gap break +
  climb-baseline reset between segments), `containsElevations`/`elevationCoverage`/
  `enrichElevations`, and `densifyAlong` (densifies per segment, no inserts across the
  gap) are all segment-aware.
- **Operate on a chosen track, not `features[0]`.** `selectedTrackIndex`
  (`trackSelection.ts`) picks the active line among loaded line-like features; the chart,
  "more info", and map highlight act on it. Chosen via a toolbar `Track` dropdown (≥2
  lines) or clicking a line (blue halo pane below the foreground); resets on load. No
  "All tracks" aggregate — separate activities aren't auto-concatenated.
- **Waypoints on the profile.** Standalone Points are pinned where the profile passes
  within `WAYPOINT_SNAP_METERS` (100 m); among candidates, the one closest in **time**
  when both waypoint and track carry timestamps (disambiguates a self-crossing track),
  else nearest in space.
- **Convert-to-drawing replaces.** Drawing state lives in the URL hash, so per-vertex
  HR/cadence/elevation can't be carried. Only a dense `fm:kind === 'track'` has rich
  per-vertex data to lose, so it shows one `window.prompt` that both warns and asks for a
  simplification factor (Cancel aborts); routes/generic geometry convert straight away.

### Lossless GeoJSON↔GPX transfer

trackViewer keeps **no retained raw source string** — a loaded track is GeoJSON in state,
and round-trips are lossless through `gpxFromGeojson.ts` (`geojsonToGpxDoc`, in
`src/features/mapFeaturesExport/`): it preserves per-point elevation/time and the
`gpxtpx` sensor channels (hr, cad, atemp, speed, course, bearing) plus `<power>`, and
re-emits routes as `<rte>` via togeojson's `_gpxType`. share-upload and My Maps save
serialize the loaded GeoJSON back to GPX this way. (Exotic third-party GPX extensions are
not preserved — accepted trade-off; freemap.sk is not a file host.)

### Map-data export elevation fill — `src/features/mapFeaturesExport/`

The export modal's **Elevation** control (`ExportElevationSchema`, persisted) fills both
points and lines in one batched `fetchElevations` request, so it builds on the shared
fetch directly rather than the per-feature `enrichElevations` wrapper:

- GeoJSON: `buildFilledFeatureCollection.ts` on a cloned `FeatureCollection`.
- GPX: `fillElevations.ts` filling/replacing `<ele>` on wpt/trkpt/rtept.
- Polygons (and `fm:type=polygon` GPX tracks) are always skipped.

## Where features surface in the UI

`tracking` is a real **tool** (`ToolSchema`/`toolDefinitions`, <kbd>g</kbd> <kbd>t</kbd>);
its toolbar (`TrackingMenu`) holds the watched/my-device managers, the visual selector,
the colorize dropdown, and the elevation-chart toggle. Tracking's colorize mode is
persisted (`PersistedTrackingSchema`). For the user-facing
catalog of colorize modes and the export Elevation control, keep
[`src/static/llms.txt`](../src/static/llms.txt) in sync.
