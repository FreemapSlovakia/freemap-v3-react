# Drawing feature export/import format mapping

How drawing points, lines and polygons round-trip through GPX and GeoJSON,
including the curated icon mappings for foreign consumers (Garmin, OsmAnd,
Locus).

## Design in one line

Every field that's not native to GPX/GeoJSON is written into **both** a
private `fm:*` element (lossless source of truth) **and** the closest
foreign equivalent (best-effort rendering in other apps). On import the
`fm:*` shadow wins; foreign extensions are heuristic fallbacks.

This mirrors what Locus and OsmAnd do: apps that round-trip their own
exports namespace everything they care about, because standard slots are
either lossy (color split into RGB + float opacity), semantically
ambiguous (gpx_style width is mm; locus:lsWidth is pixels), or unevenly
supported across consumers.

## Namespaces

| Prefix | URI | Used for |
|---|---|---|
| (default) | `http://www.topografix.com/GPX/1/1` | Core GPX 1.1 |
| `gpxx` | `http://www.garmin.com/xmlschemas/GpxExtensions/v3` | Garmin GpxExtensions v3 (declared, currently unused for drawing) |
| `gpx_style` | `http://www.topografix.com/GPX/gpx_style/0/2` | Topografix line/fill styling |
| `locus` | `http://www.locusmap.eu` | Locus Map |
| `osmand` | `https://osmand.net` | OsmAnd |
| `fm` | `https://www.freemap.sk/GPX/1/0` | **Freemap-private, source of truth for lossless round-trip** |

The root `<gpx>` element declares all of these as `xmlns:*` attributes so
togeojson picks up unknown-prefix elements as feature properties on
import.

## Drawing points

### GPX export (per `<wpt>`)

| State field | GPX element(s) | Notes |
|---|---|---|
| `coords` | `lat`/`lon` attrs on `<wpt>` | Core |
| `label` | `<name>` | Core |
| `icon` | `<sym>` | Curated `iconSpec → Garmin sym name`; falls back to literal text / stripped poi/fa name when no curated mapping exists |
| `icon` | `<osmand:icon>` | Curated `iconSpec → OsmAnd icon name` (e.g. `amenity_restaurant`) |
| `markerType` | `<osmand:background>` | `pin → octagon`, `square → square`, `ring → circle` |
| `color` | `<osmand:color>` | Plain hex (alpha truncated) |
| `markerType` | `<fm:markerType>` | **Lossless** |
| `icon` | `<fm:icon>` | **Lossless** — preserves `fa:` / `poi:` / literal text prefix |
| `color` | `<fm:color>` | **Lossless** — preserves full `#RRGGBBAA` |
| (derived) | `<locus:icon>` | Self-contained SVG data URL mirroring `RichMarker` (shape + inner white + glyph: text/fa path/poi image). Purely visual; not source of truth. |

### GeoJSON export (per Point feature)

| State field | GeoJSON property | Notes |
|---|---|---|
| `label` | `title` | |
| `color` | `marker-color` + `marker-color-opacity` | Mapbox simplestyle (splits alpha) |
| `icon` | `marker-symbol` | Garmin sym name when curated mapping exists |
| `markerType` | `markerType` | **Lossless** plain key |
| `icon` | `icon` | **Lossless** plain key |

### Import priority

`src/processors/convertToDrawingProcessor.ts` → `pointStyleFromProperties()`:

```
markerType ← freemap:markerType  → plain markerType
                                 → osmAndBackgroundToMarkerType(osmand:background)
icon       ← freemap:icon        → osmAndIconToIconSpec(osmand:icon)
                                 → plain icon
                                 → garminSymToIconSpec(sym / marker-symbol)
color      ← freemap:color       → osmand:color
                                 → marker-color
```

## Drawing lines and polygons

GPX has no native polygon type. We emit polygons as closed `<trk>`s
(first point repeated at end). The polygon vs line distinction is carried
by `<fm:type>` for lossless round-trip, with `gpx_style:fill` presence on
a closed ring as the heuristic fallback for other consumers / external
files.

### GPX export (per `<trk>`)

| State field | GPX element(s) | Notes |
|---|---|---|
| `label` | `<name>` | Core |
| `type` | `<fm:type>` (`line`/`polygon`) | **Lossless polygon flag** |
| `points` | `<trkseg><trkpt>` | Polygons close the ring (last point == first) |
| `color` | `<gpx_style:line><color>` + `<opacity>` | RGB + float, lossy |
| `color` | `<locus:lsColorBase>` | `#AARRGGBB` (8-bit alpha) |
| `color` | `<osmand:color>` | RGB only |
| `color` | `<fm:color>` | **Lossless** |
| `fillColor` (polygon) | `<gpx_style:fill><color>` + `<opacity>` | RGB + float |
| `fillColor` (polygon) | `<locus:lsColorFill>` | `#AARRGGBB` |
| `fillColor` (polygon) | `<osmand:fill_color>` | RGB only |
| `fillColor` (polygon) | `<fm:fillColor>` | **Lossless** |
| `width` | `<gpx_style:line><width>` | Pixels (spec says mm — known semantic drift) |
| `width` | `<locus:lsWidth>` + `<locus:lsUnits>PIXELS` | Pixels, explicit unit |
| `width` | `<osmand:width>` | Pixels |
| `width` | `<fm:width>` | **Lossless** |
| `lineCap` | `<gpx_style:line><linecap>` + `<fm:lineCap>` | |
| `lineJoin` | `<gpx_style:line><linejoin>` + `<fm:lineJoin>` | |
| `dashArray` | `<gpx_style:line><dasharray>` + `<fm:dashArray>` | Space-separated numbers |

### GeoJSON export (per LineString / Polygon feature)

| State field | GeoJSON property | Notes |
|---|---|---|
| `type` | Geometry type | Native (`LineString` vs `Polygon`) — no shadow; no `freemap:type` (that's a GPX-only signal) |
| `label` | `title` | |
| `color` | `stroke` + `stroke-opacity` | Simplestyle (lossy alpha) |
| `color` | `freemap:color` | **Lossless** |
| `fillColor` | `fill` + `fill-opacity` | Simplestyle (lossy alpha) |
| `fillColor` | `freemap:fillColor` | **Lossless** |
| `width` | `stroke-width` | |
| `lineCap` | `stroke-linecap` | |
| `lineJoin` | `stroke-linejoin` | |
| `dashArray` | `stroke-dasharray` | |

### Import priority

`src/processors/convertToDrawingProcessor.ts` → `lineStyleFromProperties()`:

```
type       ← freemap:type        → (closed ring AND gpx_style:hasFill) ? polygon : undefined
color      ← freemap:color       → osmand:color  → stroke
fillColor  ← freemap:fillColor   → osmand:fill_color → fill
width      ← freemap:width       → osmand:width  → stroke-width
lineCap    ← freemap:lineCap     → stroke-linecap
lineJoin   ← freemap:lineJoin    → stroke-linejoin
dashArray  ← freemap:dashArray   → stroke-dasharray
```

`freemap:type` is a GPX-only signal (GPX has no polygon geometry). For
GeoJSON, `convertToDrawingProcessor` recognises native `Polygon`/`MultiPolygon`
geometry directly, so no shadow is needed. The closed-ring + `gpx_style:hasFill`
heuristic is what lets us correctly classify polygons from third-party GPX
producers that don't write `fm:type`.

## Curated icon dictionaries

Two bidirectional mapping modules. Both are pure data + lookup helpers,
small enough to live alongside the export feature.

### `src/features/export/garminSymMapping.ts`

Maps our `iconSpec` (`poi:church`, `fa:bell`, …) to/from the Garmin
BaseCamp/MapSource `<sym>` catalog (Restaurant, Bank, Church, Gas Station,
Lodging, …).

- `iconSpecToGarminSym(icon)` — export side.
- `garminSymToIconSpec(sym)` — import side, case-insensitive.
- ~80 poi entries + ~40 fa entries + a handful of reverse aliases
  (e.g. `Airport → poi:aerodrome`, `Summit → poi:peak`).
- A trailing comment block lists known Garmin sym values that are
  intentionally unmapped (nautical Navaid variants, marine-only
  symbols, model-specific markers) and why.

### `src/features/export/osmandIconMapping.ts`

Maps to/from OsmAnd's `<key>_<value>` POI catalog (e.g.
`amenity_restaurant`, `tourism_hotel`, `natural_peak`, `special_warning`).

- `iconSpecToOsmAndIcon(icon)` / `osmAndIconToIconSpec(name)`.
- `markerTypeToOsmAndBackground(markerType)` /
  `osmAndBackgroundToMarkerType(background)` — `pin↔octagon`,
  `square↔square`, `ring↔circle`.
- ~100 poi entries + ~35 fa entries.

When extending: add the new entry to whichever direction is needed (or
both), Biome/tsgo will catch typos. No tests for the mappings themselves —
they're audited by eye and exercised through round-trip exports.

## Source file index

| File | Role |
|---|---|
| `src/features/export/garminSymMapping.ts` | Garmin sym ↔ iconSpec |
| `src/features/export/osmandIconMapping.ts` | OsmAnd icon/background ↔ iconSpec/markerType |
| `src/features/export/model/processors/gpxExportProcessorHandler.ts` | GPX writer (`addDrawingPoints`, `addDrawingLines`, marker SVG builder for Locus icon) |
| `src/features/export/model/processors/geojsonExportProcessorHandler.ts` | GeoJSON writer |
| `src/features/tracking/model/processors/trackViewerSetTrackDataProcessor.ts` | GPX → GeoJSON parser; injects canonical `freemap:*` / `osmand:*` / `gpx_style:hasFill` props onto wpt/trk features |
| `src/processors/convertToDrawingProcessor.ts` | Turns parsed features into drawing state; hosts `pointStyleFromProperties` / `lineStyleFromProperties` priority chains |
| `src/shared/drawingIcons.tsx` | iconSpec parser, FA loader, POI name↔URL maps, `tagsToPoiIconSpec` |
| `src/shared/components/RichMarker.tsx` | Renderer the Locus icon SVG mirrors |

## Adding a new field

If you add a new persisted field to a drawing point/line, the full
checklist is:

1. Add it to the Zod schema (`DrawingPointSchema` /
   `LineSchema`) and the action payloads.
2. **GPX writer** (`addDrawingPoints` / `addDrawingLines`):
   emit it as `<fm:fieldName>` always; emit it in foreign namespaces
   (osmand/locus/gpx_style) wherever a sensible counterpart exists.
3. **GeoJSON writer**: emit it as `freemap:fieldName` always; emit a
   simplestyle key if there's a natural fit.
4. **GPX importer** (`trackViewerSetTrackDataProcessor`): extend
   `enrichWaypointsWithExtensions` / `enrichTracksWithExtensions` to
   inject the canonical key.
5. **Convert** (`pointStyleFromProperties` /
   `lineStyleFromProperties`): add the priority-chain line, freemap first.
6. If the field affects the visual marker, update the Locus SVG builder
   in `gpxExportProcessorHandler.ts` so the embedded raster reflects it.
