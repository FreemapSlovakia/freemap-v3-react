# URL parameter reference

Freemap syncs most application state through the **URL hash** (`#name=value&name2=value2…`). The mapping lives in two modules (see [`architecture.md`](./architecture.md) → *URL ⇄ state synchronization*):

- **state → URL**: [`src/app/url/urlProcessor.ts`](../src/app/url/urlProcessor.ts) — the last processor in the chain, so it sees final state.
- **URL → state**: [`src/app/url/locationChangeHandler.ts`](../src/app/url/locationChangeHandler.ts) (map viewport: [`urlMapUtils.ts`](../src/app/url/urlMapUtils.ts)).

Params are read from `document.location.hash || document.location.search` (so `?name=…` works as a fallback to `#name=…`).

> Keep this file in sync when adding, renaming, or removing a URL param, and cross-update the hash-param mentions in [`src/static/llms.txt`](../src/static/llms.txt).

## Conventions

- **Coordinates**: `lat/lon`, 6 decimals (e.g. `48.748586/19.148000`).
- **Read-only params** are parsed at load but never written back by `urlProcessor` (the table marks them). They are useful for sharing/embedding; the app drops them from the hash once applied.
- **Legacy aliases** are accepted on read for backwards compatibility and never written.

## Map & layers

| Param | Controls | R/W | Format |
|---|---|---|---|
| `map` | Viewport | r/w | `zoom/lat/lon` |
| `geo` | Viewport via RFC 5870 geo URI | read-only | `geo:lat,lon[,ele][?z=zoom]` |
| `layers` | Active base + overlay layers | r/w | `~`-separated layer codes (e.g. `X~I~w`) |
| `shading` | Parametric shading | r/w | `bgColor!comp_params!…` |
| `custom-layers` | Custom WMS/TMS/MapLibre defs | r/w | JSON array |
| `id` | Loaded saved-map id | r/w | map UUID |
| `embed` | Embedded-mode feature flags | r/w | `,`-separated: `search`, `noMapSwitch`, `noLocateMe` |
| `lang` | UI language | read-only | language code (`en`, `sk`, …) |

## Tools & modals

| Param | Controls | R/W | Format |
|---|---|---|---|
| `tools` | Open tool toolbar(s) | r/w | `,`-separated tool ids |
| `tool` | Single tool (legacy) | read-only | tool id |
| `show` | Open modal / viewer | r/w | `type` or `type/arg` (e.g. `gallery-viewer/123`, `wiki/en:Title`) |
| `document`, `tip`, `image`, `wmc` | Legacy modal aliases → `show=…` | read-only | id |

## Route planner

| Param | Controls | R/W | Format |
|---|---|---|---|
| `points` | Waypoints | r/w | `,`-separated `[transport/]lat/lon` |
| `transport` | Transport type | r/w | transport id |
| `route-mode` | `route` / `trip` / `roundtrip` / `isochrone` | r/w | mode (omitted for `route`) |
| `milestones` | Distance milestones | r/w | `abs` / `rel` |
| `trip-distance`, `trip-seed` | Roundtrip target / seed | r/w | integer |
| `iso-buckets`, `iso-distance-limit`, `iso-time-limit` | Isochrone params | r/w | integer |
| `route-params-hash` | Premium route validation hash | r/w | string |

## Track viewer

| Param | Controls | R/W | Format |
|---|---|---|---|
| `track-uid` | Saved track id | r/w | UUID |
| `import-url` | External GPX/KML/TCX/GeoJSON to load | r/w | URL-encoded URL |
| `gpx-url`, `load` | Legacy aliases of `import-url` | read-only | URL |
| `track-colorize-by` | Track colorization mode | r/w | mode id |
| `track-style` | **Default style for unstyled imported features** | read-only | [style codec](#style-codec) |

## Objects (POIs)

| Param | Controls | R/W | Format |
|---|---|---|---|
| `objects` | Active category filter | r/w | `;`-separated category ids |
| `objects-style` | **POI marker color & shape** | read-only | [style codec](#style-codec) — uses `C` (color) and `S` (shape) |

## Search / map details

| Param | Controls | R/W | Format |
|---|---|---|---|
| `q` | Search query | read-only | text |
| `search-style` | **Search / map-details result style** (full style set) | read-only | [style codec](#style-codec) |

`search-style` styles the geometry both the **search** and **map details** features display (they render through the same component). `window.fmHeadless.searchResultStyle` (set by the headless image renderer) still takes precedence over it.

## OSM elements, changesets, gallery, tracking

| Param | Controls | R/W | Format |
|---|---|---|---|
| `osm-node`, `osm-way`, `osm-relation` | Load/highlight an OSM element | r/w | integer id |
| `changesets-days` | Changesets time window | r/w | integer days |
| `changesets-author` | Changesets author filter | r/w | username |
| `gallery-user-id`, `gallery-tag`, `gallery-rating-from`/`-to`, `gallery-taken-at-from`/`-to`, `gallery-created-at-from`/`-to`, `gallery-pano`, `gallery-premium` | Gallery filters | r/w | see source |
| `track` | Live-tracking device + props | r/w | `token[/prop:value…]` |
| `follow` | Followed live device | r/w | token or id |

## Drawing geometry

These place standalone map annotations — markers, lines, filled areas — not routing. To open a link showing a **map with markers/points**, use `point` (one per marker); it is the drawing-point param, distinct from the route planner's plural `points` (waypoints of a computed route). Each param is repeatable and accepts optional [style fields](#style-codec) after the coordinates (a leading `%1E` separates them from the last coordinate).

| Param | Controls | R/W | Format |
|---|---|---|---|
| `point` (repeatable), `info-point` | Drawing point(s) / markers | r/w | `lat/lon[<style fields>]` |
| `line`, `polygon` (repeatable) | Drawing line / polygon | r/w | `lat/lon,lat/lon,…[<style fields>]` |
| `distance-measurement-points`, `area-measurement-points`, `elevation-measurement-point` | Legacy measurement aliases | read-only | coords |

## Style codec

The drawing geometry params and the per-feature default-style params (`track-style`, `objects-style`, `search-style`) share one field codec, implemented by `parseStyleFields` in [`locationChangeHandler.ts`](../src/app/url/locationChangeHandler.ts).

Fields are joined by the record-separator character `\x1e` (URL-encoded `%1E`). Each field is a one-letter code followed by its value:

| Code | Meaning | Example |
|---|---|---|
| `C` | Stroke / marker color (RGBA hex) | `C%23ff0000` → `#ff0000` |
| `F` | Fill color (RGBA hex) | `F%2300ff0033` |
| `W` | Line width (number) | `W6` |
| `D` | Dash array (comma-separated numbers) | `D4,4` |
| `K` | Line cap — `b`utt / `s`quare (default round) | `Kb` |
| `J` | Line join — `m`iter / `b`evel (default round) | `Jm` |
| `S` | Marker shape — `s`quare / `r`ing (default pin) | `Sr` |
| `I` | Marker icon spec — `poi:<name>` (bundled POI icon) or `fa:<name>` (Font Awesome) | `Ipoi%3Aanimal_shelter` → `poi:animal_shelter` (`%3A` = `:`) |
| `L` | Label (drawing geometry only) | `LMy point` |

Colors are RGBA hex; the alpha channel carries the opacity (e.g. `#3388ff33` ≈ 20 % opacity).

Each default-style param applies only the fields it supports (e.g. `objects-style` reads `C` and `S`), merges them over the current style, and persists the result to local storage.

### Examples

```
# Track viewer: render unstyled imported features as a thick semi-transparent red line
#track-style=C%23ff000080%1EW8

# Objects: green ring markers
#objects-style=C%2300aa00%1ESr

# Search result: orange 3px outline, faint orange fill
#search-style=C%23ff8800%1EF%23ff880022%1EW3

# A map with two markers, the second red and labelled "Košice"
#map=8/48.43/19.18&layers=X&point=48.14816/17.10674&point=48.72083/21.25808%1EC%23ff0000%1ELKošice

# A blue ring marker labelled "Ahoj!" with the animal-shelter icon (tools=draw-points is optional — it only opens the editing toolbar)
#map=17/48.979457/21.169961&layers=X&tools=draw-points&point=48.979061/21.167738%1EC%230000ff%1ELAhoj!%1ESr%1EIpoi%3Aanimal_shelter
```
