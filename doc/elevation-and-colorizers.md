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
- **`densifyAlong(feature, …)`** — inserts intermediate points (≈2 px / ≤100 m spacing
  via `@turf/along`) into segments long enough to draw as a coarse straight line, then
  DEM-samples *only* the inserted points (existing vertices keep their elevation). A
  dense line is a reference-equal no-op. **Drops `coordTimes`/`coordinateProperties`**
  (can't be interpolated) — so its output is render-only, never exported.

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
  no recorded measurement, so the router's own (different-DEM, shape-point-density)
  elevation is *always* ignored for rendering: `enrichElevations('all')` overrides every
  vertex from our DEM, then `densifyAlong` adds DEM points. `alternatives` keep
  GraphHopper's elevation so export and the drawn route/distances are untouched.

Consumers read `renderTrackGeojson ?? trackGeojson` (`Results.tsx`,
`TrackViewerDetails.tsx`). Chart paths `await ensureRenderGeojson` first.

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
