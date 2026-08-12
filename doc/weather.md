# Requests to the radar backend (`cache.bigware.sk`)

Notes from the Freemap client side, meant to be forwarded to whoever runs the
feed. Re-checked against the live service on **2026-08-12**; measurements are
rain-dependent where noted.

The client consumes both feeds directly, reading `zoomLevels`, `format` and
`times` from each `/{radar|forecast}/status` document rather than assuming them,
so a server that widens a zoom range, changes the tile format or publishes more
frames needs **no client deploy**. See
[`weather-radar.md`](./weather-radar.md) for how the layer uses them.

## Everything asked for has been delivered — thank you

- **History depth.** The measured feed publishes 36 frames at 10-minute steps
  ≈ **5 h 50 min**, matching what the app's premium tier is allowed to reach
  back (6 h). It used to hold ~3 h, so half the tier was empty.
- **Cache headers.** Measured tiles are `public, max-age=10800, immutable`, so a
  replay or a pan no longer revalidates every tile. Forecast tiles now carry the
  same, which is safe because the app appends `?v=<status.updatedAt>` to them —
  the version parameter, not the header, is what makes a new forecast appear.
- **WebP.** `format` is `webp`, and PNG is still served alongside it. This was
  the single largest cost of the layer: PNG tiles ran an order of magnitude
  above a normal map tile, and an animation pass fetches *every frame* over the
  visible area, much of it on mobile data.
- **1× tiles.** `?size=256` returns a genuine 256×256 render (`@1x.<format>`
  works too). Tiles are 512×512 @2x by default, so a non-retina screen used to
  download four times the pixels it could display. Measured over three areas at
  z5–z9 on one frame: **48% fewer bytes** overall, per-tile savings 41–62%.
  `radarTileUrl` sends `size=256` whenever `devicePixelRatio < 2`.

## Standing note: @3x or @4x renders would be worthless

Should larger renders ever be considered, the ask was only ever for a *smaller*
option. At maximum zoom a tile is already close to a pure upscale of the zoom
below it — comparing z9 against z8 resampled ×2 gives an RMSE of 3, against 83
for two unrelated tiles — so the pixels are ahead of the ~2 km composite grid
rather than behind it, one data cell already covering ~20 device pixels at @2x.
More detail at deep zoom would have to come from a higher-resolution source, not
from more pixels over the same grid.

## Not an issue

`www.freemap.cz` answers 401 (not on the allowed-origins list), but it only
redirects to `freemap.sk`, so nothing needs adding. `freemap.sk`,
`www.freemap.sk`, `freemap.eu`, `www.freemap.eu` and the dev origin
`local.freemap.sk:9000` all answer.

Tiles that repeat unchanged across consecutive frames were an OPERA upstream
outage, not a pipeline problem on either side.
