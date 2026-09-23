# Tile attribution

What the outdoor map credits, decided by the tiles themselves rather than by the
countries in view. The renderer reports which datasets contributed a pixel to
each tile; `src/shared/tileAttribution.ts` collects those reports and
`src/shared/tileLicenses.ts` resolves them to names.

## The codes

A dataset is named by a short code. `o` is OSM, `s<key>` its shading, `c<key>`
its contours — namespaced apart because a region can draw them from different
sources under different licences. `expandCode` turns each into the form
`/licenses` is keyed by: `o` → `osm`, `ssk` → `shading:sk`, `c_` →
`contours:_`.

**`<key>` is the renderer's own identifier, not a country code.** `_` is the
global fallback, `de_by` is Bavaria, `en` is England. `countryOf` reads the part
before the underscore, maps the territories the coverage spells differently
(`en` → `gb`) and uses the result only when `/geotools/covered-countries` names
it, so anything it cannot place is credited everywhere rather than nowhere.

A tile that credits nothing — outside the renderer's coverage — reports an empty
list, which is not the same as reporting nothing. Both paths below keep that
apart, since an empty list narrows the credit while silence widens it.

## One way in: the response that carried the tile

Every tile response carries `X-Attribution: csk,o,ssk` — comma-separated, as
`/export` answers — and everything reads the codes off it. That is the map
(`ScaledTileLayer`), the offline downloader, and the API's mbtiles builder
alike.

- **The map fetches its own tiles.** An `<img>` hands back no response, so
  `ScaledTileLayer` builds the element itself, `fetch`es the tile, reads the
  header, and gives the bytes to the element as an object URL — which decodes
  exactly as any other image does. Letting Leaflet set `src` first would fetch
  every tile twice.
- **`Access-Control-Expose-Headers: X-Attribution` is what makes it readable**
  cross-origin. Without it `headers.get` returns `null` with no error anywhere,
  which looks exactly like a tile reporting nothing. Server-to-server — the
  mbtiles builder — there is no gate.
- **Present and empty credits nothing; absent is unknown.**
- **Only where CORS allows reading at all.** A layer with `cors: false` keeps
  the plain `<img src>` path, `srcset` and all; its response could not be read
  anyway.
- **The density is chosen here.** `srcset` used to pick the `@Nx` variant; one
  URL is fetched now, so `pickTileScale` reads the screen instead, falling back
  to the plain tile if the variant is missing.
- **A tile stored in a cache keeps the header**, so a resume reads what it
  credits without fetching again — and a tile stored before that cannot be
  credited later, there being nowhere else to read it from.

**Not resource timing.** `Server-Timing` looks like the natural channel for an
`<img>`, and it is unusable: WebKit restricts `PerformanceResourceTiming`'s
`serverTiming` to same-origin outright, *"intentionally stricter than a TAO
check"*, so it is permanently empty for tiles in Safari. A response a service
worker answers with is also timing-opaque in every browser, whatever headers it
carries. Both are why the codes come off the response instead.

**The worker tells a download from the map by `fm-draw` on the URL.** All three
ask for the same tile with `fetch` now, so `destination` no longer separates
them, and a request's cache mode is an init option the browser may spell its own
way. Only the renderer's layers are fetched, so the marker never reaches another
provider, and the renderer ignores it.

**Nothing a cache keys by carries it.** `unmarkDrawnTile` strips it first, or a
tile browsed and the same tile downloaded would be two entries — and everything
stored before the marker existed would be orphaned. It does reach the network,
so a drawn tile and a downloaded one are separate entries in the browser's HTTP
cache and in anything in front of the renderer — panning over an area just
downloaded refetches it, where the browse cache, when it is on, absorbs that.

The renderer also writes the list into the tile's JPEG `COM` segment. That is
its own record, for rebuilding these headers when it serves a tile it did not
just render; nothing here reads it.

## What is painted, not what is in view

`tileAttributionHandlers` keeps a live set of the tiles each layer currently
paints, from `tileload`/`tileunload`, and the credit is the union over the ones
on screen. It grows with the picture: a tile still loading contributes no
pixels, so omitting its sources is exact rather than short. During a zoom
Leaflet keeps the previous level's tiles painted underneath, and those are
counted too — which a bounding box at the new zoom could not express.

**On screen is measured, not calculated.** Leaflet retains whole rings of tiles
past the viewport after a pan (`keepBuffer`), and ground nobody can see credits
nobody; `onScreen` intersects each tile's rect with the map container's rather
than deriving it from the coordinates, which would have to mirror every
`tileSize`/`zoomOffset` the hi-DPI and feature-scale paths set.

**The map's own `moveend`/`zoomend` is what asks for that measurement**, from
`Layers`. Tile events cannot: panning back over tiles Leaflet kept fetches
nothing and so announces nothing, which left the credit showing the view that
had fetched them until a pan went far enough to load something.

What this cannot narrow is a tile only partly in view: the codes are per tile,
so one straddling the edge credits everything it drew anywhere. At low zoom that
is a lot — a z5 tile over central Europe reports ten sources — which is the
price of the exactness the codes buy elsewhere, and it errs towards crediting
too many rather than too few.

Three things that are not what they look like:

- **An errored tile announces itself as loaded**, on a layer Leaflet still loads
  for: it swaps in `errorTileUrl`, which loads like any other tile and fires
  `tileload`. That URL carries no codes, so it would blank the layer's credit;
  `tileerror` marks the element first.
- **react-leaflet unbinds the handlers before removing the layer**, so a layer
  switched off announces none of its removals. The count self-heals on
  `tile.isConnected` instead of trusting the event.
- **A premium placeholder is a `div`**, not an `<img>`, and paints nothing to
  credit.

## Resolving

`/licenses` on the renderer is the authority for what a code means; the app
holds no copy of the dataset list. Only where it says something the renderer's
string cannot — a translated label, a link into the app — does a local
`AttributionDef` override, which today is `osm` alone. A national model's name
is the rights-holder's own text, so a local copy of it would only be the
dictionary going stale.

**A code maps to a list, not to one licence**, and `url` is optional — the same
key can cover ground held under separate terms, as `shading:be` does for
Wallonia and Flanders.

`resolveTileCodes` seeds `FM_ATTR` and `OSM_DATA_ATTR`: neither has a code, the
renderer is ours to credit whatever a tile drew, and the map is an OSM-derived
work even where a tile put none of it on screen. Any code it cannot resolve
makes it return `null`, and the caller widens to the layer's whole list — an
unresolvable code must never quietly drop a source.

The dictionary is fetched once a session, as soon as a tile paints rather than
when something asks for the credit, and kept in `localStorage`. A session that
never opened the attribution panel would otherwise persist nothing and have
nothing to fall back on next time it is offline. A refusal or a malformed answer
clears the in-flight promise, so a later call asks again.

## When the codes do not arrive

A middlebox can strip the header, CORS can hide it, the dictionary fetch can
fail. The map on screen then stops at
`OUTDOOR_ATTRIBUTION` — Freemap and OSM, the two knowable without the server. A
terrain dataset is named by the tiles that drew it or not at all: no tile
painted yet, nothing to credit.

The catalogue of everything the renderer could have drawn on is only for what
the painted tiles cannot answer for — an export's chosen area, and an offline
map downloaded before the header was kept. Both name an area the tiles on screen
say nothing about, so there `countryOf` narrows `/licenses` by the countries the
area covers.

## Offline maps

A downloaded map carries `attributionCodes` — the union over its tiles — and
`attributionLicenses`, the slice of the dictionary those codes name, because
offline there is nobody to ask. The rules that keep it honest:

- **Only a pass that walked every tile may publish a union.** One cut short by a
  stop, or by a premium gate leaving stored tiles above its ceiling unvisited,
  has seen less than the cache holds.
- **A pass in flight clears the codes.** Its predecessor's union is already
  stale against the tiles just fetched, so an interrupted download leaves the
  map on its layer's list rather than on a union that predates its own cache.
- **One tile short and the whole map falls back.** A union missing a source is
  the one failure that matters.
- **A map already credited is not read back.** A completed pass that published a
  union answered for every tile, so a resume trusts it — an empty union
  included, that being an answer. A map with no union recorded is rebuilt from
  the headers its stored tiles carry.
- **A tile stored without its header cannot be credited later.** What a tile
  drew is only on the response that delivered it, and a resume does not fetch
  one it already holds. So a map cached before the header was kept stays on its
  layer's list until it is downloaded again.
- **Only `RENDERER_LAYER_TYPES` are read**, and only where the pass can publish
  what it finds. A gated one cannot, having left the tiles above its ceiling
  unvisited, so reading them would be work thrown away.

## Exports

An export's credit is still resolved before the export runs, from the countries
in the chosen area. `GET /export` answers with the codes on `X-Attribution`,
naming exactly what was drawn — see `TODO.md`.
