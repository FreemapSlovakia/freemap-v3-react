# Requests to the radar backend (`cache.bigware.sk`)

Notes from the Freemap client side, meant to be forwarded to whoever runs the
feed. Everything below was re-checked against the live service on
**2026-08-10**; measurements are from that day and rain-dependent where noted.

The client consumes both feeds directly, reading `zoomLevels`, `format` and
`times` from each `/{radar|forecast}/status` document rather than assuming them,
so a server that widens a zoom range, changes the tile format or publishes more
frames needs **no client deploy**. See
[`weather-radar.md`](./weather-radar.md) for how the layer uses them.

## Already resolved — thank you

- **History depth.** The measured feed now publishes 36 frames ≈ **5 h 50 min**,
  which matches what the app's premium tier is allowed to reach back (6 h). It
  used to hold ~3 h, so half the tier was empty.
- **Cache headers on measured tiles.** They now come with
  `cache-control: public, max-age=10800, immutable`, so a replay or a pan no
  longer revalidates every tile.

## Remaining requests

### 1. Serve the tiles as WebP (the big one)

Tiles are still PNG: `.webp` is a 404, and `Accept: image/webp` is ignored
(`vary` is only `Origin`). Sizes measured over Slovakia at one timestamp:

| zoom | bytes   |
| ---- | ------- |
| 4    | 123 498 |
| 5    | 35 798  |
| 6    | 42 888  |
| 7    | 53 574  |

That is roughly an order of magnitude above a normal map tile, and an animation
pass fetches *every frame* over the visible area — so this is the single largest
cost of the layer for our users, many of them on mobile data.

Nothing is needed on our side: the app reads `format` from the status document,
so flipping it there switches every client over on its next status poll.

### 2. Offer 1× (256 px) tiles

Tiles are 512×512 on the standard slippy grid — i.e. @2x renders — with no size
parameter, so a non-retina screen downloads four times the pixels it can
display. A `?size=256` (or a parallel path) would let those clients ask for what
they can use. Combined with WebP this is the difference between a ~50 KB and a
~5 KB tile for a large share of visitors.

To be explicit, the ask is only for a *smaller* option: **@3x or @4x renders
would be worthless.** At maximum zoom a tile is already close to a pure upscale
of the zoom below it (comparing z9 against z8 resampled ×2 gives an RMSE of 3,
against 83 for two unrelated tiles), so the pixels are ahead of the ~2 km
composite grid rather than behind it — one data cell already covers ~20 device
pixels at @2x. More detail at deep zoom would have to come from a
higher-resolution source, not from more pixels over the same grid.

### 3. A long `Cache-Control` on forecast tiles too

Measured tiles are `max-age=10800, immutable`, but forecast tiles still come
back as `cache-control: public, max-age=300`:

```
GET /forecast/tiles/1786357800/7/70/44.png
cache-control: public, max-age=300
```

The app already appends `?v=<status.updatedAt>` to every forecast tile URL,
precisely because forecast frames are recomputed under a fixed URL each cycle.
The URL is therefore unique per generation, so those tiles can safely be
`immutable` with a long `max-age` — the version parameter, not the header, is
what makes a new forecast appear.

## Not an issue

`www.freemap.cz` answers 401 (not on the allowed-origins list), but it only
redirects to `freemap.sk`, so nothing needs adding.
`freemap.sk`, `www.freemap.sk`, `freemap.eu` and `www.freemap.eu` all answer.
