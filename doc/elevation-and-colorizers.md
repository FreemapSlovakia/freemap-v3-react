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
  elevation so export and the drawn route/distances are untouched. Because the two
  variants differ, `authSetUser` drops the cache and re-runs
  `routePlannerColorizeProcessor` — signing in or buying premium in the same session
  otherwise keeps the line built for the previous status.

  It is cached in **two steps**. `sampledGeojson` is what the requests above buy;
  `renderGeojson` is that line with structure levelling and `smoothElevation` applied,
  which are pure. So `elevationSetSettings` drops only the second and re-derives without
  a request, and `authSetUser` drops only a line this session sampled — one carrying
  `saved: true` came with a map document and stands for whoever opens that map. That is
  what a saved map stores (see `savedRoute.ts`), so a route opened offline has a full
  profile and still follows the live smoothing preferences.

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

1. `flattenLevelledSpans` merges legs/steps into one coordinate list (dropping the vertex
   consecutive steps share) and converts the structure ranges into **spans in metres along
   the line** — a structure split across a step boundary is rejoined here;
2. `levelSpans` runs **after** `densifyAlong` and lays a straight line across each span.

The line covers the span's **own end samples**, not just what lies between them: a short
bridge on a long route often has no sample strictly inside it (the densification step
scales with route length, up to 100 m), so the whole notch *is* those two ends. Its
anchors come from one sample further out again, each the **median** of the samples within
10 m — but never fewer than three, since on a long route they can be 35 m apart
(`anchorElevation`). A single sample sitting metres off the road at a portal or an
abutment would otherwise tilt the entire span.

Rather than replacing the terrain outright, the line is **clamped** against it: a deck is
never below the ground it spans (`Math.max`), a bore never above it (`Math.min`) — which
is why `LevelledSpan` carries the `kind`. That is what makes reaching past the mapped
ends safe: beyond the real structure the terrain is already on the right side of the line,
so nothing changes there.

Metres, not indices, because densification renumbers every point but leaves distances
along the line alone — and it must run last, since the inserted points are DEM-sampled too
and would otherwise put the notch straight back inside a long bridge. It applies on the
free tier as well (GraphHopper's own DEM has the same holes) at no request cost. Only
`renderGeojson` is affected; exports keep the router's raw elevation.

**A third kind, `unrouted`, is not a structure.** Where routing fails, the result carries a
straight `mode: 'error'` leg between the waypoints so the map has something to draw, and
the DTM happily reports every ridge that line crosses — as a profile, as ascent, and as
colorize. `flattenLevelledSpans` emits those legs as spans too, and they are the one kind
levelled **without** the clamp: clamping a straight line up onto a 2500 m ridge would
restore the exact fiction being removed. The same spans are what `routeColorizeFeatures`
cuts the colorize line at, leaving one feature per routed run so the red dotted line — the
only thing still saying routing gave up there — is not painted over. A partly-failed route
therefore colorizes as several features, which per-feature-normalized modes scale
independently and the legend declines to label; that is the honest reading of two runs
with a hole between them.

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
`levelSpans`), dataViewer's `ensureRenderGeojson` (which already runs only
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
- **`gradeWindow`** — the stretch, in metres, the steepness readout on the elevation
  chart's active point is averaged over (`gradeAt` in
  `src/features/elevationChart/grade.ts`); `0` measures across the segment the active
  point stands on. It corrects nothing — it is read off the already-drawn profile
  points. The window is centered on the active point's own distance and its ends are
  interpolated between the samples they fall between, so it is exactly the length asked
  for and slides with the pointer. Snapping the ends to samples instead — or centering
  on the sample nearest the point — makes the readout a coarse step function on a
  profile whose samples are far apart (a hand-drawn GPX, with a point only where the
  slope changes), and one that never reaches the grade the slope actually has.
  The out-of-band value `GRADE_WINDOW_WHOLE_LINE` (`-1`) asks for an unbounded window,
  so the readout spans the whole stretch the point lies on (ends and elevation gaps
  still stop it) and reads the same wherever on it the pointer is. Consumers pass the
  stored value through `gradeWindowMeters`, which turns that sentinel into
  `Infinity` — the only thing `gradeAt` itself knows about. `MapPreferencesModal` puts
  it on the slider's top notch, one step past the 200 m maximum, converting in both
  directions around the control.

Which terrain model answers is not among them: every read presents the account, so premium
decides it (see *Crediting the terrain model* below), for profiles and exports alike.

The first two invalidate the derived caches (`routePlanner.renderGeojson` —
but not the `sampledGeojson` under it, so a route re-derives without a request —
and `trackViewer.renderTrackGeojson` clear on `elevationSetSettings`). `routePlannerColorizeProcessor`
and `dataViewerDensifyProcessor` rebuild them, which has to happen whether or not the
chart is open — an active elevation/steepness colorize reads the same cache. An open chart
additionally redraws through `elevationChartProcessor` (see *What the chart shows* below).

`gradeWindow` shares the same `elevationSetSettings` action but must do none of that, so
every one of those five consumers gates on `affectsElevationSmoothing(payload)` rather than
on the bare action. `MapPreferencesModal` accordingly dispatches only the keys the user
actually changed.

That predicate lives in `settingsReducer.ts`, next to the settings it reads, and not beside
the action it tests: `RootAction` is a union built from every export of the `model/actions`
modules, so a plain function exported from one widens that union with its return type and
breaks type narrowing across the store.

The UI is an *Elevation profile* group in `MapPreferencesModal`, reachable from a gear in
the elevation chart's own toolbar.

### Crediting the terrain model — `src/shared/elevationSources.ts`

The elevation API answers from the same national models the outdoor renderer shades with,
so both credit one set of attribution defs: `OUTDOOR_NATIONAL_DTM_ATTRIBUTION`
(`mapDefinitions.tsx`), of which `ELEVATION_API_DTM_ATTRIBUTION` is the part the API
holds — `ELEVATION_API_DTM_COUNTRIES` stays the authority on which those are, since either
side can gain a model the other doesn't hold.

Coverage is reported per country (`/geotools/covered-countries` answers `alpha2` codes), so a
model that covers only part of one is marked `partial` and its country left out of GEDTM30's
`exceptCountries`: the model is credited over the whole country and GEDTM30 beside it, both
over-credits rather than a missing one. England's LIDAR composite is the case. The premium
offer's country list names such an area through `dtmAreaNames` instead of the country —
`Intl.DisplayNames` names countries alone.

Which model answers depends on the read, not only on the place: a **premium** read gets the
national models and GEDTM30 past their borders, while a **non-premium** one is answered from
**SRTM everywhere**. So a non-premium profile has exactly one source to
credit, known without waiting on coverage, and the upsell gem always applies to it.

**The API reports what answered** (see the request contract below), and
`elevationSourcesFromTokens` resolves its tokens against that table: a 2-letter token is
that country's national model, anything else is looked up in `GLOBAL_MODELS` (`gedtm30`,
`sonny`, `srtm`). A country the table has no entry for is still credited, under its
`Intl.DisplayNames` name and without a link — dropping a model the API gained would
under-credit it, which is the worse direction. The order is the table's own, global models
last, so the list doesn't reshuffle between requests.

GraphHopper serves its own elevation from **Sonny's LiDAR DTM** — a different dataset from
the API's non-premium SRTM, so the two are separate tokens. The `sonny` provenance is
expressed by *appending `SONNY_TOKEN` to the reported tokens* rather than crediting it
separately, so one table resolves both.

That model also weights the graph, so it shapes **every** GraphHopper route — including a
premium one, whose profile is re-read from the national models and so never names it. Its
open licence is met the other way round: `useRoutingAttributions` in `Attribution.tsx` adds
`SONNY_ATTR` to the map's attribution list whenever a GraphHopper route or isochrone stands,
which is also what `useResolvedAttributionText` bakes into an exported map — there only when
the route is among the exportables, since that credit belongs to the drawn route.

The same hook adds `OSM_DATA_ATTR` for any standing result (a route is OSM-derived whatever
layer is drawn under it, and an aerial base credits nothing else) and `OSRM_ROUTING_ATTR`
where OSRM answered. All three dedupe against the layers' own copies in `categorize`. Only
the last is `type: 'routing'` — the credits above it are for *data the route is derived
from*, whereas `routing` names the service that answered, and the GraphHopper behind it is
ours to run rather than anyone's to credit.

A multimodal route is asked of both routers leg by leg, so one GraphHopper leg earns the
credit whatever the default transport is. `legTransports` is the single reading of that rule
— the find-route handler segments its requests by it — because two copies of it would drift
into crediting the wrong router.

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
- **`sonny`** — GraphHopper's own elevation, kept on the free tier, read from Sonny's
  LiDAR DTM.
- **`recorded`** — a GPS recording, an imported file, or a track merely gap-filled: a
  measurement no terrain model answered for, credited to nobody.

`useElevationSources(provenance, reported)` turns the two together into the defs the chart
links under its toolbar (with a `PremiumGem` for non-premium users) and `ElevationValue`
names in its ⓘ tooltip. A point readout is always `terrain-model` — which is why
`measurementProcessor` reads it through `fetchElevations` rather than its own request, so
the model the tooltip credits is the one that answered.

`ElevationValue` (`src/features/elevationChart/components/`) is that readout — spinner,
em dash for no data, or the value with its source tooltip and premium gem. Two toasts show
it: `ElevationInfo` (the measurement readout, which adds coordinates and tile links) and
the search/objects details toast, whose `objectDetailsProcessor` reads one point of the
selected feature once the details are already on screen — a line at its midpoint, anything
else at the centre of its geometry — and drops the line rather than raising an error when
the read fails or the feature carries no geometry at all.

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
  | { type: 'gps-recorder' }                     // the recording in progress
  | { type: 'drawing'; lineId: number }
  | { type: 'tracking'; token: string }
```

`elevationChartProcessor` is the only thing that draws it, and `chartIdentity(state)`
(`resolve.ts`) is its whole redraw rule: one cheap reference naming *what the profile is
derived from* — the render line, the active track feature, the drawn line, the device's
track, the recorder's fixes. A re-route, a switched alternative, a densified line, a
reshaped drawn line, a refilled elevation or an arriving position each replace that object;
nothing else does. So
there is no list of actions to keep in step with, and an action that changes anything else
leaves it identical and draws nothing. Cheap rather than free: the identity is a lookup
(for a track viewer target, a scan for the active line feature), evaluated against both the
new and the previous state on every dispatched action.

That price is also what keeps a derived value out of the identity. A recording's profile is
drawn from its *segments*, but splitting the whole track twice per action is not a lookup —
so the identity names the flat `gpsRecorder.points` the split reads, and `splitGapS`, the
only other thing that can move the breaks, is listened for as `gpsRecorderSetSettings`
alongside `dataViewerSetActiveTrack`. (Calling the memoized `selectRecorderSegments` here
would be worse than recomputing: alternating it between the new and the previous state
thrashes its one-entry cache, and the map's own consumer of it re-renders on every action.)

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
- **gpsRecorder** likewise, for the same reason: the recorded altitude is what a
  recording is kept for, and it grows a fix at a time. See
  [`doc/gps-recorder.md`](./gps-recorder.md).
- **export** offers an opt-in **Elevation** control (Keep recorded / Fill missing /
  Override all; hidden for Garmin) — see below.

## Shared colorizers — `src/shared/colorizers/`

Imported via `@shared/colorizers/…`. One colorizer per visual variable lives in
`modes/` (`elevation`, `steepness`, `speed`, `heading`, `time`, `heartRate`, `cadence`,
`power`, `temperature`, `battery`, `gsmSignal`, plus the categorical `surface`,
`smoothness`, `roadType`, `trackType`, `hikeRating`, `mtbRating`); `index.ts` aggregates
them (`colorizers`, `colorizingModes`, `ColorizingModeSchema`).

- **Steepness is not a straight ramp.** A grade reaches its colour through
  `asinh(grade / STEEPNESS_KNEE)` — odd-symmetric, defined at zero and straight either side
  of it, which a plain log is not. One ramp has to hold an alpine path and a road route
  whose entire range is a couple of per cent; measured over real routes, a 3 % knee is what
  makes the second legible without painting the terrain model's own noise.
- **The ends are the reader's to set** (`STEEPNESS_SCALES`, ±5 % to ±100 %, default 100 %).
  No one value serves every route: measured against real ones, the widest scale that clamps
  almost nothing is 5 % for a road ride, 15 % for a car, 25 % on rolling hills and 60 % in
  the Tatras. The slider steps through the list *by index* — the useful settings are
  geometric, and a linear slider would spend half its travel above 50 % where nothing
  changes.
- **It lives in `elevationSettings`**, beside `gradeWindow`: like that one it corrects
  nothing and belongs to the reader rather than to a map feature, so one field serves route
  planner, track viewer and tracking at once. `useZoomColorize` reads it and passes it in
  `ColorizeOptions` — one place, rather than threaded through three call sites — and it is
  part of that hook's cache-reset key, or a changed scale would redraw from the old colors.
- `steepnessColor` and `steepnessGradeAt` are inverses; `ColorizeLegend` labels seven evenly
  spaced ticks through the latter, so the line and its legend cannot drift apart. Even
  positions rather than round grades because round ones cannot be had at every scale — at
  ±5 % they collapse onto zero — and the labels closing up toward the middle is itself what
  shows the compression.

- Each `Colorizer` exposes **`isAvailable`**, which gates whether a mode is offered for a
  given feature — routes expose Elevation/Steepness/Time/Heading; a track exposes a mode
  only when it carries that channel's data. This is why the "Colorize by" dropdown
  differs per consumer.
- **Categorical modes** (`modes/pathDetail.ts`) paint named values instead of a scale.
  They read GraphHopper path details that ride on the feature as
  `properties['fm:pathDetails']` — stretches in **metres** along the line, because the
  line is densified for premium users and every point index shifts with it (the same
  reason `structureElevation.ts` measures bridges that way). Because they are measured
  from the start of the line, an edit that shortens it has to move them: `splitTrack.ts`
  re-bases and clips them onto each piece a cut or an explode gives, or a tail would be
  painted with the categories of the original beginning. `compute` returns the whole
  line as **one** list of points — every list drawn becomes its own canvas layer, and a
  route changes surface hundreds of times — with the stretch boundary interpolated onto
  the exact metre the value changes and emitted twice, once per color. The zero-length
  segment between the two paints nothing, which is what makes the change a hard edge
  instead of a blend across the segment spanning it. For the same reason a value no
  category claims is **not** a gap: `categoricalColorizer` appends an `unknown` category
  in `NO_DATA_COLOR` grey, so it reads like the no-data line without splitting the layer,
  and the legend can say how much of the route nobody has mapped. One `covering()`
  generator yields the stretches as painted — holes and unclaimed values already resolved
  to `unknown` — and both `compute` and the legend's `categories` consume it, so the
  distances the legend lists cannot drift from the line drawn.
- **Two fields carry all of that**, so no component asks "is this mode categorical":
  **`categories(features, messages)`** returns the legend's rows (key, label, color,
  metres) — the same shape of contract as the scalar `legend: { unit, values }`, which is
  why `ColorizeLegend` imports nothing from `modes/`; and **`spanBased`** says the mode
  paints router-reported stretches, which is what tells the route planner to colorize the
  plain line rather than the densified one, `RoutePlannerResult` to set Leaflet's
  `smoothFactor: 0` (simplification would collapse the coincident boundary pair — see the
  `react-leaflet-hotline` patch), `useZoomColorize` that one cache entry answers every
  zoom, and the data-viewer/tracking menus that the mode can never apply to a track. A
  future *scalar* span mode (`average_speed`, `curvature`) sets `spanBased` and a normal
  `legend`.
- `colorizeByValues` (`colorize.ts`) maps values to a Hotline palette and flags missing
  values as gaps on `ColorizedPoint`; `splitOnGaps`/`noDataRuns` split a feature's points
  into gap-free runs so the Hotline render loop can break the line at gaps.
- Sensor colorizers read recorded `coordinateProperties` channels and fall back to
  computed values; absolute-scale ones (battery, GSM, temperature, power, cadence, HR)
  use `coordPropColorizerAbsolute` (`coordPropColorizer.ts`) so a given color means the
  same thing across tracks. Battery/GSM use a fixed 0–100 % scale.
- Colorize-mode labels live in `src/shared/colorizers/translations/`
  (`useColorizerMessages`), not the global message blob. A categorical mode's category
  labels sit beside them, under `categories`.
- **Where the details come from** — `pathDetailKeys` (`routePlanner/model/pathDetails.ts`)
  names what each profile asks GraphHopper for, so a car route doesn't pay for a hiking
  rating. The response's ranges are stored **per step** (`Step.details`), which is what
  survives the legs of independently-routed segments being concatenated;
  `flattenPathDetails` turns them into metre stretches over the whole line, rejoining the
  parts of one stretch that the step boundaries clipped apart. `routeColorizeFeatures`
  (`routeGeometry.ts`) is what stamps them onto the feature — a `Colorizer` is handed
  nothing else.
- **Premium gate** — `premiumColorize.ts` names the free modes (elevation, speed, time);
  every other mode needs premium access. It is enforced twice: `usePremiumColorizeLock`
  (`components/`) disables the option and badges it with a clickable `PremiumGem` in the
  three "Colorize by" dropdowns, and `useUnlockedColorizingMode` resolves the stored mode
  to `null` wherever it is read — the three menus and the three `*Result` renderers, plus
  `unlockedColorizingMode` in `routePlannerColorizeProcessor`. The second layer is what
  stops a mode that came from persisted settings, a saved map or the URL from colorizing
  after premium lapses; the stored value is left alone, so buying premium restores the
  user's choice.

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
- **Operate on a chosen track, not `features[0]`.** `activeTrackIndex`
  (`trackSelection.ts`) picks the active line among loaded line-like features; the chart,
  "more info" and matching act on it. Clicking a line selects it
  (`main.selection.type === 'data-viewer'`, blue halo pane below the foreground) and
  `dataViewerSelectProcessor` aims the active index at it; deselecting leaves the index
  alone, so an open chart doesn't jump to another track. Resets on load —
  `dataViewerSetData({ select: true })` (an import, a saved recording, a conversion, not a
  link or a reload) selects the loaded line where the data holds exactly one, so the usual
  single-track import arrives ready to chart. No "All tracks" aggregate — separate
  activities aren't auto-concatenated.
- **Waypoints on the profile.** Standalone Points are pinned where the profile passes
  within `WAYPOINT_SNAP_METERS` (100 m); among candidates, the one closest in **time**
  when both waypoint and track carry timestamps (disambiguates a self-crossing track),
  else nearest in space.
- **Convert-to-drawing replaces.** Drawing state lives in the URL hash, so per-vertex
  HR/cadence/elevation can't be carried. Only a dense `fm:kind === 'track'` has rich
  per-vertex data to lose, so it gets the shared simplify dialog
  (`src/shared/simplifyDialog.tsx`) with that warning as its preamble (Cancel aborts);
  routes/generic geometry convert straight away, and are asked at all only when dense
  enough to be worth thinning.

- **Simplify in place.** The dataViewer's own **Simplify** / **Simplify all**
  (`dataViewerSimplify` → `simplifyTrack.ts`) thins the loaded data without converting it.
  The tolerance is a **maximum deviation in metres**: `src/shared/simplifyGeo.ts` scales
  longitude by cos(latitude) before Douglas–Peucker, so it means the same distance
  whichever way a line runs. It reports the surviving indices rather than the geometry,
  which is what lets the per-point channels — and, re-measured along the shortened line,
  the matched `fm:pathDetails` spans — be thinned alongside the coordinates.

- **Sensor channels are averaged, not decimated.** A surviving vertex carries the mean of
  the samples it now stands for (the run up to the midpoint of the gap either side). DP
  keeps *corners*, and corners are junctions and switchbacks, so one-sample-per-survivor
  would bias a recording towards wherever it slowed down. `PER_VERTEX` in
  `trackChannels.ts` lists what keeps its own vertex's value instead — times (they have to
  keep matching the place recorded) and angles (`courses`/`bearings`: the mean of 350° and
  10° is 180°). Elevation is in `coord[2]`, not a channel, so it is never averaged; note
  that DP is horizontal-only, so simplifying drops elevation extremes that sit on a
  straight plan line and lowers the computed climb/descent.

### Matching a track to the graph — `src/features/dataViewer/matchTrack.ts`

**Match to paths** (the dataViewer ⋮ menu) POSTs the selected track to GraphHopper's
`/match` and replaces it with what comes back. The point is not the snapping — it is that
a matched line carries `details`, so a *recording* can be colorized by Surface, Smoothness,
Road type, Track grade and the ratings, which no imported track can otherwise be. That is
why `DataViewerMenu` no longer filters `spanBased` modes out of its dropdown: each mode's
own `isAvailable` decides, and it is false until a track has been matched.

Facts that decide the implementation, all measured against the live server:

- **GPX only.** A JSON body is a 415. `segmentToGpx` writes the `<trkpt>`s, with `<ele>`
  and `<time>` where the segment has them — the matcher is a walk over time steps, so times
  are what tell it how fast the fix could have been moving. All of them or none:
  an unparseable stamp reads as `NaN` without shortening the array, and a half-timed
  sequence is worse than an untimed one.
- **`gps_accuracy` is a constant** (`MATCH_ACCURACY`, 25), not a control. GraphHopper's own
  default of 10 is tighter than a real fix and sends the matcher hunting detours that fit
  the noise: a 15 km track jittered by 12 m came back **4.3 % long** at 10, against 0.3 %
  at 20 and 0.1 % at 40. Raising it is no better — a track laid 400 m off any path failed
  outright at 5 and came back as a confident 90 km at 25 — so exposing it would mostly let
  a reader turn a loud failure into a silent one. The modal asks only which transport.
- **A broken sequence fails its segment, not the track.** Where the graph offers no way
  from one observation to the next — off-trail, a lift, a ferry — it answers 400 with
  `Sequence is broken for submitted track at time step N`, and there is no partial result
  for that segment. The processor matches that string, keeps the segment as recorded and
  carries on, since one leg of a mixed track routinely defeats the profile the other needs;
  only a track where *nothing* matched is refused outright.
- **Observations are thinned to 50 m.** Two fixes closer together than their own error
  carry no direction, only noise, and the matcher rationalizes that by detouring — one
  track sent at 10 m spacing under 10 m of scatter came back four times its true length,
  falling back toward it as the spacing widened (62 → 48 → 36 → 29 → 18 km at
  10/20/30/50/80 m). So `segmentToGpx` sends points no closer than `2 × MATCH_ACCURACY`,
  and
  nothing is lost by it: what comes back is the graph's own path, not the points put in.
  It also keeps the body well under the nginx limit in front of GraphHopper. (The multiple
  is the one constant here not settled against a real recording: synthetic noise is
  independent per point, where a real receiver's drifts.)
- **One request per segment.** GraphHopper reads a GPX as a single sequence of
  observations, so a paused recording sent whole has it *route across the pause*: a real
  recording carrying a stray three-point fragment 28 km from the walk matched at four
  times its length. `trackSegments` keeps them apart, measuring each on its own, and the
  result is a feature per segment rather than one `MultiLineString` — the details are
  metres along their own line, and `@turf/flatten` would hand every part the same spans.
  A segment the graph cannot get through is kept as recorded rather than failing the lot,
  since one leg of a mixed track routinely defeats whatever profile the other leg needs.
- **A match longer than the recording is refused** (`MATCH_MAX_LENGTH_RATIO`). Matching can
  only answer with paths the graph holds, so a stretch someone took across open ground —
  or by a transport the profile cannot follow — comes back routed *around* it: one 0.94 km
  meadow crossing in a 12.7 km walk added 5 km, at every accuracy alike. Measured across
  real recordings, a good match lands between **0.96 and 1.00** (under 1, since GPS wander
  inflates the raw track) while everything wrong sat at **1.17 and above** — a mixed
  walk-then-drive at 1.17 and 1.44, that meadow at 1.41, a ride matched as a bike at 3.14.
  Compared against the track's own length rather than GraphHopper's `original_distance`,
  which is measured on what we *sent* — thinned, and so ~6 % short.
- **What it cannot do is a track that changes transport partway** — the walk, then the
  drive home, recorder never stopped. No profile matches both, and the refusal above is all
  that saves it from being mangled. Splitting is the real answer; see `TODO.md`.
- **Details arrive as point indices**, not metres; `toMetreSpans` converts them against the
  cumulative distances `matchedSegment` walks once — the same walk gives the matched length,
  which is measured this way rather than read from the response's own `distance` (the
  graph's edge distance, ~2 % above a walk of the points it returns) so that both sides of
  the ratio check are measured alike.
- **Per-point channels do not survive.** The matched line has its own points (1010 for a
  286-point input in one measurement) and nothing maps the recorded ones onto them, so
  `coordinateProperties` is dropped and the feature keeps its name alone. The modal warns
  only when the track actually carries times or sensors. Transferring them would need a
  correspondence between the two lines — `nearestPointOnLine` would give it, in either
  direction, and it is the obvious next step if the loss proves unpopular.

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
`dataViewerRestoreStored` when it sees it. So reloading the page you were on puts
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
and the copy is dropped on `dataViewerDelete` and `clearMapFeatures` — one that
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
