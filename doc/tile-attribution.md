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

## Three ways in, for three situations

**Online, off the response.** Every tile carries
`Server-Timing: src;desc="…", attr;desc="o ssk csk"`, and
`PerformanceResourceTiming.serverTiming` is the one response header JavaScript
can read for an `<img>`. So `<img>` keeps its whole lifecycle — `srcset`,
Leaflet's tile management, the browser's own prioritised decode — and no tile
byte is fetched twice.

- **`Timing-Allow-Origin` is what makes it work cross-origin.** Without it the
  browser hands the page an empty `serverTiming` and reports nothing anywhere,
  so a missing header looks exactly like a renderer that sends no codes. The
  renderer sets it on every tile response, 304s included. To check:
  `performance.getEntriesByType('resource').filter(e => e.serverTiming.length)`.
- **The metric's presence is the signal**, not a truthy `desc`. `attr;desc=""`
  is a tile known to credit nothing; no `attr` at all is a tile rendered before
  the renderer carried attribution.
- **`buffered: true`** on the observer, so tiles that loaded before the first
  layer mounted still count.

**Off a response, `X-Attribution`.** Anything holding the response reads the
codes off `X-Attribution: csk,o,ssk` — comma-separated, as `/export` answers —
rather than the metric, whose grammar would have to be parsed. That is the
offline-map downloader here, and the API's mbtiles builder server-side.

- **`Access-Control-Expose-Headers: X-Attribution` is what makes this one
  work.** Reading a header from a cross-origin `fetch` is gated by CORS, not by
  `Timing-Allow-Origin` — two headers, two gates, and the observer path having
  codes says nothing about whether this one does. Server-to-server there is no
  gate at all.
- **Present and empty credits nothing; absent is unknown.** The same
  distinction the metric draws with `desc`.
- **A stored tile keeps the header.** `putTileResponse` carries it into the
  cached `Response`, so a resume reads what a tile credits out of the cache
  instead of fetching the tile again — and a tile stored before that cannot be
  credited later, there being nowhere else to read it from.

**From the service worker, by message.** A tile the worker answers is
**timing-opaque** — `transferSize` 0, `nextHopProtocol` empty, `serverTiming`
empty — whatever headers the response carries and whether it came from the
network or from Cache Storage. No header fixes that, because the opacity is the
worker being in the path rather than anything about the body. So `announcing`
reads `X-Attribution` off whatever it is about to return and posts `{url,
codes}` to the client, and the page feeds that into the same store the observer
fills.

- **Every branch that answers announces**, the pass-through `fetch` included:
  it is worker-owned too.
- **The page listens at module scope.** The worker posts when the response
  resolves, which is before the image loads — a listener installed on
  `tileload` would miss the first screenful, which is the whole initial view.

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

- **An errored tile announces itself as loaded.** Leaflet swaps in
  `errorTileUrl`, which loads like any other tile and fires `tileload`. That URL
  carries no codes, so it would blank the layer's credit; `tileerror` marks the
  element first.
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

Old Safari has no `serverTiming`, a middlebox can strip the header, the
dictionary fetch can fail. The map on screen then stops at
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
