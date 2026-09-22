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
global fallback, `de_by` is Bavaria, `en` is England — which is not a country
and never matches what `/geotools/covered-countries` answers. `countryOf` reads
the part before the underscore and uses it only when the coverage names it a
country, so anything it cannot place is credited everywhere rather than nowhere.

A tile that credits nothing — outside the renderer's coverage — reports an empty
list, which is not the same as reporting nothing. Both paths below keep that
apart, since an empty list narrows the credit while silence widens it.

## Two ways in, for two situations

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

**Offline, out of the bytes.** A rendered tile carries the same list in a JPEG
`COM` segment written as its first segment — `FF D8 | FF FE | len_hi len_lo |
payload` — so `readTileCodes` takes it from a fixed offset without a JPEG
parser. This is what the offline-map downloader reads, because it holds the
blob already; nothing else reads tile bytes.

The two spellings differ — the header spaces the codes where the segment commas
them — so `splitCodes` accepts both. One reader rejecting what the other accepts
would show up only as the online and offline credits disagreeing.

## What is painted, not what is in view

`tileAttributionHandlers` keeps a live set of the tiles each layer currently
paints, from `tileload`/`tileunload`, and the credit is the union over that set.
It grows with the picture: a tile still loading contributes no pixels, so
omitting its sources is exact rather than short. During a zoom Leaflet keeps the
previous level's tiles painted underneath, and those are counted too — which a
bounding box at the new zoom could not express.

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
dictionary fetch can fail. Then `RENDERER_LAYER_TYPES` are credited with every
entry in `/licenses`, narrowed by whatever of it `countryOf` can place against
the countries in view. Past that, `OUTDOOR_ATTRIBUTION` is the floor: Freemap
and OSM, the two knowable without the server.

The direction is the point. Exact codes only ever *narrow* a correct-by-default
answer, so no transport's flakiness can cause a licence breach — only a credit
wider than this particular screen earned, which nobody has been sued over.

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
- **A settled map is not read back.** A completed pass answered for every tile,
  so a resume trusts its verdict; anything less rebuilds from scratch, reading
  the stored tiles. Otherwise every resume would materialise every tile a large
  map holds.
- **Only `RENDERER_LAYER_TYPES` are read at all.** Another provider's JPEG may
  well open with a comment segment of its own, and reading it would both cost
  the whole tile and persist a string nothing can resolve.

## Exports

An export's credit is still resolved before the export runs, from the countries
in the chosen area. `GET /export` answers with the codes on `X-Attribution`,
naming exactly what was drawn — see `TODO.md`.
