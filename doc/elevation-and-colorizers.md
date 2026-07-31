# Track data: import, elevation, colorize, export

How imported/recorded/planned tracks acquire elevation, get colorized, and round-trip
through file formats. One shared elevation-acquisition layer and one shared colorizer
layer feed every consumer — **routePlanner**, **dataViewer**, **tracking**, and
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
  path used by routePlanner/dataViewer.
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

- **dataViewer**: `renderTrackGeojson` (vs. `trackGeojson`), built lazily by
  `ensureRenderGeojson` (`src/features/dataViewer/model/`) **only after a server
  elevation override** — the one state where every point is known DEM-derived, so
  inserted DEM points add no seam. A track's own recorded elevation is left alone (no
  DEM injected between measured points). `dataViewerDensifyProcessor` keeps it fresh.
- **routePlanner**: `renderGeojson` via `ensureRouteRenderGeojson`. A planned route has
  no recorded measurement, so for **premium** the router's own (different-DEM,
  shape-point-density) elevation is ignored for rendering: `enrichElevations('all')`
  overrides every vertex from our DEM, then `densifyAlong` adds DEM points. Everyone else
  keeps GraphHopper's elevation, fills only what lacks it, and isn't densified — so the
  free tier never loads the elevation service. `alternatives` keep GraphHopper's
  elevation so export and the drawn route/distances are untouched.

Consumers read `renderTrackGeojson ?? trackGeojson` (`Results.tsx`,
`DataViewerDetails.tsx`). Chart paths `await ensureRenderGeojson` first.

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
2. `straightenStructures` runs **after** `densifyAlong` and lays a straight line across
   each span.

The line covers the span's **own end samples**, not just what lies between them: a short
bridge on a long route often has no sample strictly inside it (the densification step
scales with route length, up to 100 m), so the whole notch *is* those two ends. Its
anchors come from one sample further out again, each the **median** of the samples within
10 m — but never fewer than three, since on a long route they can be 35 m apart
(`anchorElevation`). A single sample sitting metres off the road at a portal or an
abutment would otherwise tilt the entire span.

Rather than replacing the terrain outright, the line is **clamped** against it: a deck is
never below the ground it spans (`Math.max`), a bore never above it (`Math.min`) — which
is why `StructureSpan` carries the `kind`. That is what makes reaching past the mapped
ends safe: beyond the real structure the terrain is already on the right side of the line,
so nothing changes there.

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
flattens real terrain. The honest fix there is to move the way in OSM.

`smoothElevationSeries` is the single entry point for both passes, so every consumer of
terrain-model elevation applies them in the same order: `ensureRouteRenderGeojson` (after
`straightenStructures`), dataViewer's `ensureRenderGeojson` (which already runs only
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

Which terrain model answers is not among them: every read presents the account, so premium
decides it (see *Crediting the terrain model* below), for profiles and exports alike.

Both of them invalidate the derived caches (`routePlanner.renderGeojson`,
`trackViewer.renderTrackGeojson` clear on `elevationSetSettings`). `routePlannerColorizeProcessor`
and `dataViewerDensifyProcessor` rebuild them, which has to happen whether or not the
chart is open — an active elevation/steepness colorize reads the same cache. An open chart
additionally redraws through `elevationChartProcessor` (see *What the chart shows* below).

The UI is an *Elevation profile* group in `MapPreferencesModal`, reachable from a gear in
the elevation chart's own toolbar.

### Crediting the terrain model — `src/shared/elevationSources.ts`

The elevation API answers from the same national models the outdoor renderer shades with,
so both credit one set of attribution defs: `OUTDOOR_NATIONAL_DTM_ATTRIBUTION`
(`mapDefinitions.tsx`), of which `ELEVATION_API_DTM_ATTRIBUTION` is the subset the API
holds — `ELEVATION_API_DTM_COUNTRIES` stays the authority on which those are, since the
renderer also shades Norway.

Which model answers depends on the read, not only on the place: a **premium** read gets the
national models and GEDTM30 past their borders, while a **non-premium** one is answered from
**SRTM everywhere**. So a non-premium profile has exactly one source to
credit, known without waiting on coverage, and the upsell gem always applies to it.

**The API reports what answered** (see the request contract below), and
`elevationSourcesFromTokens` resolves its tokens against that table: a 2-letter token is
that country's national model, anything else is looked up in `GLOBAL_MODELS` (`gedtm30`,
`srtm`). A country the table has no entry for is still credited, under its
`Intl.DisplayNames` name and without a link — dropping a model the API gained would
under-credit it, which is the worse direction. The order is the table's own, global models
last, so the list doesn't reshuffle between requests.

GraphHopper's `srtm` is the same dataset as the API's non-premium answer, so the `srtm`
provenance is expressed by *appending `SRTM_TOKEN` to the reported tokens* rather than
crediting it separately — reported twice, it collapses to one entry.

**Nothing is derived from the viewport.** With no tokens the credit is empty and the line is
simply absent: `state.map.countries` is only a proxy for where the samples were (it
over-credits a zoomed-out view), and deriving from it means keeping a copy of the API's own
model choice — which countries it holds, what premium changes — here to rot. "We don't know"
is an honest state; a plausible guess isn't. The one cost is deploy skew: a frontend running
against an API without `?sources=1` shows no credit at all, so ship the API first.

Not every profile is ours to credit, so a target's resolver returns an
`ElevationCredit` — a provenance plus, for `terrain-model`, the tokens — since only the
feature being charted knows what sampled it:

- **`terrain-model`** — a drawn line or measurement resampled from the API, a premium route
  (every vertex overridden), a manual/OSRM route (the router returns no elevation, so
  `enrichElevations` fills all of it), or a track the user had **overridden**
  (`elevationDecision === 'all'`, via `elevationCredit` in dataViewer).
- **`srtm`** — GraphHopper's own elevation, kept on the free tier
  (`graph.elevation.provider: srtm`), which is the same data the API answers a non-premium
  read with.
- **`recorded`** — a GPS recording, an imported file, or a track merely gap-filled: a
  measurement no terrain model answered for, credited to nobody.

`useElevationSources(provenance, reported)` turns the two together into the defs the chart
links under its toolbar (with a `PremiumGem` for non-premium users) and `ElevationInfo`
names in its gem's tooltip. A point readout is always `terrain-model` — which is why
`measurementProcessor` reads it through `fetchElevations` rather than its own request, so
the model the tooltip credits is the one that answered.

#### The `?sources=1` contract

`POST /geotools/elevation` answers the bare `(number | null)[]` array as it always has.
**Only** with `?sources=1` does it answer an object instead:

```jsonc
{
  "elevations": [612.3, null],       // exactly the array the plain form returns
  "sources": ["sk", "at", "gedtm30"] // union over the whole batch, any order
}
```

A token is either a **lowercase ISO 3166-1 alpha-2 country code**, meaning that country's
national high-resolution model answered for at least one point, or the **model's own id**
for one that isn't country-scoped (`gedtm30` for a premium read past the national borders,
`srtm` for a non-premium one) — so length alone tells the two apart, and a new national model
needs no new vocabulary. Duplicates are tolerated; points the API has no
data for contribute nothing; an empty array is valid. The parameter belongs in the cache
key, which a query parameter is by default.

`ElevationsResponseCompatSchema` accepts both shapes, so an API that ignores the parameter
credits nothing rather than failing to parse. The frontend asks for the
sources **only where it credits them** — `fetchElevations` appends the parameter exactly
when a `sources` collector `Set` is passed — so export fills and the like neither pay for it
nor fragment the cache.

#### Getting the tokens to the chart

`fetchElevations` / `enrichElevations` / `densifyAlong` take an optional `sources: Set<string>`
that they add to, so a line built from several reads accumulates the union. Getting that union
to a chart opened later takes two mechanisms, because the two caches expire differently:

- **Stamped on the geometry** — `ensureRouteRenderGeojson` and dataViewer's
  `ensureRenderGeojson` put the union on the render feature as `fm:elevationSources`
  (`ELEVATION_SOURCES_PROP` / `readElevationSources`). The render line is cached, so on the
  second chart open the sampling doesn't happen again; carrying the credit *on* the cached
  object is what makes it survive, and makes drift impossible. Stamped **only** on
  render-only geometry — never by `enrichElevations` itself, which also writes into the
  exportable `trackGeojson`.
- **`trackViewer.elevationSources`** — the override's `enrichElevations` writes into
  `trackGeojson`, which can't carry the stamp, and its tokens can't be recovered from the
  densify either: `densifyAlong` inserts nothing into a dense recording, so it makes no
  request at all. Without this field the *normal* "Override all" case would credit nothing.
  The field tracks `elevationDecision` — set with it, emptied with it — so there are only two
  sites to keep aligned.

`elevationCredit(trackViewer, drawn)` unions the two for dataViewer's three chart
dispatchers; routePlanner's reads the stamp directly. The chart's processor then unions the
credit's tokens with whatever its own sampling collected (the drawn-line/measurement path)
into `elevationChartSetElevationProfile`.

### What the chart shows — `elevationChart.target`

The chart is a **derived view**, not something features push into. State holds only
what to show:

```ts
type ElevationChartTarget =
  | { type: 'route-planner' }                    // the active alternative
  | { type: 'track-viewer' }                     // the active imported track
  | { type: 'drawing'; lineId: number }
  | { type: 'tracking'; token: string }
```

`elevationChartProcessor` is the only thing that draws it, and `chartIdentity(state)`
(`resolve.ts`) is its whole redraw rule: one cheap reference naming *what the profile is
derived from* — the render line, the active track feature, the drawn line, the device's
track. A re-route, a switched alternative, a densified line, a reshaped drawn line, a
refilled elevation or an arriving position each replace that object; nothing else does. So
there is no list of actions to keep in step with, and an action that changes anything else
leaves it identical and draws nothing. Cheap rather than free: the identity is a lookup
(for a track viewer target, a scan for the active line feature), evaluated against both the
new and the previous state on every dispatched action.

A drawn line is the one target sampled from the elevation API rather than read off the
feature, and a vertex drag replaces its geometry on every pointer move — so its redraws are
coalesced by a timer that dispatches `elevationChartRedraw`. The wait is deliberately not an
`await` inside the processor, which would hold a progress indicator open for the whole
gesture.

Each target resolves through a small per-feature `resolveElevationChart.ts`, loaded on
demand (a resolver may densify, and pulls the sampling path in with it). A resolver
returns the line, whether to keep its recorded elevation, its waypoints, and the
`ElevationCredit` only it can know — or `null` when there is nothing to chart.

**Identity, not position.** A drawn line is named by an `id` (`DrawnLine`, assigned in
`drawingLinesReducer`), a device by its token. An array index is not an identity: deleting,
splitting and joining renumber lines, and a chart holding an index would quietly come to
draw a different one. The id is deliberately absent from `LineSchema`, so it reaches
neither the URL (`line=`/`polygon=` are positional) nor a persisted map — existing saved
documents carry none, and requiring one would fail their parse. The URL therefore names the
line by position and the id is resolved at that boundary, in `locationChangeHandler` and
`urlProcessor`.

**Staleness.** Resolving can take seconds. The processor re-checks that the target is still
the one it resolved for, and that `chartIdentity` hasn't moved on, before drawing — so a
chart closed or re-aimed mid-sample is never drawn over.

**"Nothing to draw" is two different answers**, and a resolver says which — the feature is
the only thing that can tell them apart:

- **`pending`** — the line isn't there *yet*: a route being recomputed (which is what
  switching transport type does, since every route change clears the old one first), a
  track still downloading, a device that hasn't reported. The chart stays aimed and draws
  nothing; the arrival is itself a redraw trigger.
- **`gone`** — nothing is coming: the line was deleted, the track cleared, the device isn't
  watched. The chart closes.

Collapsing the two is what made a transport-type switch close the profile for good, and a
profile of a locally imported track sit aimed at something that could never come back. A
`fromUrl` flag stood in for this before, and could not work: whether geometry is still on
its way is a fact about the feature, not about where the request came from. `fromUrl`
survives only to keep a page load from being counted as a user toggle.

The chart also ends on an explicit `elevationChartClose`, on `clearMapFeatures`, and when
its target's own tool is closed (`targetTools` in the reducer; a drawn line outlives any
tool, so it has none).

### Per-consumer elevation policy

- **dataViewer** prompts once per track when elevation is missing/partial — **Fill
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
(unzip). The format layer lives under `src/features/dataViewer/`:

- **`parseDataFile(text, filename)`** — the single import boundary. Resolves format by
  extension (falling back to the XML root element) to togeojson `gpx`/`kml`/`tcx` or
  `parseGeojsonFile`. Wired into both drop paths (`Main.tsx` `onDrop`,
  `DataViewerUploadModal`). GPX stays raw text for the set-data processor; everything
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

dataViewer began as a GPX recording viewer and grew into a general geodata viewer
(GPX/KML/KMZ/TCX/GeoJSON, points/lines/polygons, multi-file). Affordances written for a
single recorded GPS log misfire on arbitrary imported geometry, so behavior keys off
provenance tagged at parse time — never re-derived from density/timestamps:

- **`fm:kind: 'track' | 'route' | 'waypoint' | 'feature'`** (`provenance.ts`) is stamped
  by `parseDataFile` from togeojson's `_gpxType` (`trk`/`rte`), Point waypoints, TCX
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

dataViewer keeps **no retained raw source string** — a loaded track is GeoJSON in state,
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

## The loaded track survives a reload

The track viewer's track is the one thing the URL cannot carry, so
[`dataViewer/trackStore.ts`](../src/features/dataViewer/trackStore.ts) keeps it —
a **single entry** in its own `idb-keyval` database, validated on read like the
my-maps working copy (`myMaps/mapStore.ts`).

**Only a track with no other home.** A map's track already lives in the my-maps
working copy and is restored from there; a `track-uid=` or `import-url=` track is
named by the URL and re-fetched from it. Storing either would be a second copy of
the same thing, so `dataViewerStoreProcessor` checks `homedElsewhere` and deletes
the entry instead. What is left is the case the store exists for: a file import, a
conversion, a finished recording — the same condition `DataViewerMenu` warns
about. The check runs off state, on every action that can change the answer, so it
does not depend on whether a loader sets the track before or after the thing that
gives it a home.

**The history entry decides whether it comes back.** `storeTrack` `replaceState`s a
`tr: true` flag onto the current entry as it writes; `urlProcessor` carries the flag
onto the entries it writes afterwards; `handleLocationChange` dispatches
`trackViewerRestoreStored` when it sees it. So reloading the page you were on puts
the track back, while a fresh visit or a shared link is never ambushed by a track
from a previous session.

A load carrying no flag deliberately **does not evict** the record. The record is one
per origin and the flag is one per history entry, so a second tab — a fresh load
with no flag of its own — would delete the only durable copy of a ride the first tab
is still holding. Hygiene comes from the store being a single entry that the next
write and its own delete reclaim.

The write is validated with the same schema the read uses, so a record that would
be discarded on the way back is refused on the way in rather than counted as a
copy. Otherwise it is best effort (`dataViewerStoreProcessor` logs and moves on),
and the copy is dropped on `trackViewerDelete` and `clearMapFeatures` — one that
outlived the track would come back as something the user had already thrown away.
The restore also stands down for a track the URL merely *names*: `homedElsewhere`
covers a fetch that is still in flight, which IndexedDB would otherwise beat, and
declaring a server-hosted track local would take `track-uid=` out of the URL.
`navigator.storage.persist()` is asked for by `storeTrackDurably` **only** — the GPS
recorder finishing a ride, which then deletes the phone's copy, so `false` (stored,
but evictable) is its cue to leave that copy alone. The ordinary path never asks:
Chrome decides silently but Firefox prompts, and prompting because somebody opened a
GPX file would be asking about a hazard they don't have. See
[`doc/gps-recorder.md`](./gps-recorder.md).

## Where features surface in the UI

`tracking` is a real **tool** (`ToolSchema`/`toolDefinitions`, <kbd>g</kbd> <kbd>t</kbd>);
its toolbar (`TrackingMenu`) holds the watched/my-device managers, the visual selector,
the colorize dropdown, and the elevation-chart toggle. Tracking's colorize mode is
persisted (`PersistedTrackingSchema`). For the user-facing
catalog of colorize modes and the export Elevation control, keep
[`src/static/llms.txt`](../src/static/llms.txt) in sync.
