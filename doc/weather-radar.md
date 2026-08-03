# Weather radar layer

The `R` overlay is an animated precipitation radar fed by
[LibreWXR](https://librewxr.net/) — an AGPL-3.0 server that re-implements the
RainViewer v2 API over freely available composites. For us the relevant source
is **EUMETNET OPERA**, the pan-European composite (~155 radars, 24 countries,
2 km grid, 15-minute production cycle); SHMÚ contributes to it, so Slovakia and
all its neighbours are covered. The nowcast frames past "now" come from the
model layer LibreWXR blends in over the same area.

## Where it runs

We run **our own LibreWXR** rather than using the project's public instance.
That instance serves from several workers whose frame lists disagree: the same
`/public/weather-maps.json` answers `nowcast: 6` or `nowcast: 0` seconds apart,
and tiles of a frame it has just advertised come back `404` about half the time.
Single-worker mode is one process and one frame list, and the problem is gone.

- **`~/librewxr` on fm5** — a `git clone` of the upstream repo plus a `.env`,
  started with `docker compose up -d --build` in `single` mode, published on
  `127.0.0.1:8080` only. Configured for Europe: `LIBREWXR_ENABLED_REGIONS=EUROPE`
  (OPERA + the Italian DPC composite), NWP chain `[dmi_dini, icon_eu, ecmwf_ifs]`,
  satellite off, alerts on, and every non-European model fetcher disabled.
  `LIBREWXR_MAX_FRAMES=36` gives six hours of history; ~7 GB resident of a 12 GB
  limit. A `docker-compose.override.yml` bind-mounts the cache onto `/fm/data4`
  (1.6 TB free) rather than the root NVMe, since the frame memmaps live under
  `LIBREWXR_CACHE_DIR` and grow with the frame count.
- **`etc/nginx/sites-available/weather.freemap.sk`** on the same host, with its
  `http`-level companion `etc/nginx/conf.d/weather-cache.conf`, terminates TLS
  and caches in front of it. `LIBREWXR_URL` points at that hostname.

`LIBREWXR_URL` (rspack `EnvironmentPlugin`) is the single origin for **both**
metadata and tiles. The metadata document reports its own `host`; `api.ts`
deliberately ignores it and rebuilds every URL from `LIBREWXR_URL`, which is why
moving between the public instance and our own was a one-variable change.

Frame counts, the nowcast horizon and the zoom ceiling are all server config,
which is the main dividend of self-hosting — the six-hour history is not
something the public instance can offer.

**`LIBREWXR_NOWCAST_BLEND_MODE=radar`, not the default `blended`.** Blended fades
from ~82% radar at T+10 to ~20% at T+60, and the model behind it over Slovakia is
ICON-EU at ~7 km, which cannot resolve a convective cell. The visible result was
storms dissolving within twenty minutes. Pure radar extrapolation keeps the cell
and its track at the cost of no growth or decay — the right trade for "will that
storm reach me before I get down", where a forecast that quietly deletes a storm
is the worst possible failure.

### Licence

Self-hosting moved which obligations apply. The **CC-BY-4.0 "credit LibreWXR"**
term covers data served by *their* public instance — upstream is explicit that
"you may choose your own data licensing terms for data served by your own
LibreWXR instance" — so what binds us now are the sources: **EUMETNET OPERA**,
and over Italy the national composite, which is **CC-BY-SA-4.0** and asks to be
credited as "Radar-DPC" (a separate `country: 'it'` attribution entry, so it
shows only when the view can contain such a tile).

What *starts* applying on self-hosting is **AGPL-3.0 §13**: running it as a
network service entitles the people using it to the Corresponding Source. So
LibreWXR stays in the credits, pointing at the repository rather than the
project page — as a source offer, not a data credit. We run it unmodified, for
which a link upstream suffices; a local patch would have to be published.

### The vhost

Things in it that look like omissions or over-caution and are neither:

- **It clears the client-identifying headers** and keeps **no access log**. The
  backend is ours, but it has an MCP endpoint that should never see a
  credential, and nginx forwards the client's own headers unless told otherwise
  — so *not* adding `X-Forwarded-For` would still pass a client-supplied one on.
- **A tile is not immutable for its timestamp, and is cached for the origin's
  five minutes.** The URL invites the opposite conclusion, and I acted on it:
  a frame's `time` is the moment it is *valid for*, not a version, and the
  forecast frames are re-computed every cycle as new radar arrives — same
  timestamp, different picture. The same URL served 4274 bytes from a cache and
  1598 bytes freshly rendered. Cached for hours, a frame becomes a mosaic of
  whichever version each tile was first fetched at, visible as rectangular
  blocks that don't line up with their neighbours. So no
  `proxy_ignore_headers`: the origin's own lifetime is the correct one.
- **`404` is not cached, and error responses get no `Cache-Control`.** A 404
  means the frame has rolled off the list; `add_header ... always` would have
  put an immutable hour on it, and a browser holding one could never load that
  tile again — a passing failure made permanent.
- **There is no `limit_req`.** An animation looks exactly like abuse — one pass
  of 18 frames over a desktop viewport is ~430 requests in a couple of seconds,
  from an address that may be a NAT shared by several people. A 30 r/s limit
  rejected a third of them with 503s, which reach the browser as missing tiles.
  No other vhost here rate-limits either.
- **The upstream is an `upstream` block with `keepalive`.** A `proxy_pass`
  naming a variable cannot pool connections.
- **The cache is not redundant with the app's own.** LibreWXR renders every
  tile on demand — there is no static pyramid. It is not serial about it
  (each render is `asyncio.to_thread` onto a pool of `cpu_count-1`; the numpy
  and WebP work releases the GIL, and the container runs ~450 threads), so the
  cache exists because the cheapest render is the one not done, not to rescue a
  bottleneck. Its in-process LRU reports zero entries precisely because nginx
  absorbs the repeats first. Sized for that (`max_size=1g`, `inactive=30m`),
  not for archiving: entries live five minutes.

Paths we don't consume — `/docs`, `/openapi.json`, `/mcp/` — return 404 rather
than being republished.

It follows fm5's conventions: cache under `/fm/data4/nginx-proxy-cache/<name>`
with an upper-case zone name, `$blocked_country` from `conf.d/geoip.conf`, and
`gzip_types` set in the vhost because the global `gzip on` there comes with
`gzip_types` commented out. Installing it needs the certificate first — the
`# managed by Certbot` lines mean the vhost cannot load before one exists, so
issue against a throwaway HTTP-only vhost and use `certonly`, which does not
rewrite (and thereby reformat) the real file.

## The wire contract

Everything the app knows about the API lives in `src/features/weatherRadar/api.ts`:

- `GET /public/weather-maps.json` → `{ generated, radar: { past[], nowcast[], colorSchemes[] } }`.
  Each frame is `{ time (unix seconds), path }`. Currently 12 past frames and 6
  nowcast frames, ten minutes apart — but nothing in the code assumes those
  counts.
- Tiles: `{path}/{size}/{z}/{x}/{y}/{colorScheme}/{smooth}_{snow}.webp`. WebP
  because a radar tile is about half the size of the same frame as PNG, and the
  animation fetches one per frame. `size` is 256 or 512 for the *same* ground —
  512 is simply the @2x render, so it is what a HiDPI screen gets
  (`resolutionScale ?? devicePixelRatio > 1.4`), displayed at Leaflet's usual
  256 CSS px.

`toFrames` merges the two lists into the single timeline the UI animates,
tagging the nowcast half with `forecast: true`. That flag is what colours the
slider's tail and what `showNowcast` filters on.

## State

- **`weatherRadar`** (transient) — the frame list, the colour schemes the server
  offers, and where the user is in the animation. The selection has three
  states, all decided by `pinnedTime` in the reducer:
  - **`null` is live** — follow the newest observed frame, so a refresh carries
    the view forward. Picking that frame *stores* `null`, rather than its
    timestamp, or playing to the end would silently freeze the layer until the
    frame aged off the list — six hours, at the history we keep.
  - **Any other frame pins** to its absolute time and stays there as the
    window advances.
  - **A pin that ceases to exist moves to the nearest frame that does.** The
    oldest ages off every ten minutes and forecast frames are republished on
    shifted timestamps, so this is routine; going to the nearest keeps a viewer
    of the old end at the old end instead of flinging them forward to live.
- **`weatherRadarSettings`** (persisted) — colour scheme, smoothing, snow,
  show-nowcast. A dedicated settings slice per the convention in the root agent
  file, so the choices survive turning the layer off and on.

`radarFramesSelector` / `radarIndexSelector` / `radarFrameSelector`
(`model/selectors.ts`) are the only place the "which frame is on screen" rule is
written down. They are memoized — the frame list is filtered per `showNowcast`,
so an unmemoized selector would hand out a new array on every action.

## Polling

`weatherRadarLayerProcessor` starts and stops a two-minute poll as the layer
goes on and off, plus a `visibilitychange` refetch (a backgrounded tab has its
timers throttled, so a phone returning to the map would otherwise animate a
stale list). It compares the layer's presence itself rather than using
`stateChangePredicate`, because the layer can already be on at startup — from
the URL hash or the saved layer set — and no state change announces that.

`weatherRadarRefreshProcessor` awaits only the **first** fetch. A periodic
refresh is returned unawaited on purpose: the middleware raises the global
progress spinner for any handler still pending after a tick, and a spinner every
two minutes is noise. A failed refresh is likewise swallowed — the frames
already on screen stay usable and the next tick retries.

## Rendering

`RadarLayer` keeps one Leaflet `TileLayer` per frame and cross-fades by opacity,
so a step never blinks through to the map underneath. Four rules make that
work:

- A frame's layer is built the first time the frame is **needed** — which
  includes the one frame ahead while playing, so a step lands on tiles that are
  already there instead of stalling on the first pass through the loop.
- A layer is revealed only once it has fired `load`, and only if it is still the
  frame most recently asked for (fast scrubbing otherwise lets a late load
  overwrite a newer frame).
- A frame whose tiles **all** failed is not revealed, and provokes a re-read of
  the frame list. Leaflet fires `load` even when every tile errored — an errored
  tile counts as settled once `errorTileUrl` renders — so without counting
  `tileload` against `tileerror`, a frame that has rolled off the server would
  be shown as a sheet of nothing over the frame that was working.
- On `moveend`, every layer but the visible one and the one most recently asked
  for is dropped. Keeping them all would make a single pan re-fetch a whole
  animation's worth of tiles for the new area; they are rebuilt lazily as the
  loop comes round again. The asked-for frame stays because it may still be
  loading — and nothing re-adds it until the frame itself changes, so dropping
  it would strand the map on the previous frame (a pan or a zoom during the
  first load, or any `mapRefocus` while GPS following is on).

`maxNativeZoom: 10` in the layer registry stops the client asking for levels the
2 km composite has no more detail for. Some softness is inherent — at 2 km, a
tile is an interpolation long before it is a photograph — but a stretched 256
tile on a 2x screen is not, which is what the `size` switch above is for.

Playback lives in `useRadarPlayback`, called from `RadarLayer` rather than from
the toolbar, so the animation is tied to the layer that shows it and not to a
menu that can be hidden.

## The toolbar

`WeatherRadarMenu` is mounted from `Main.tsx` while `layers` contains `R` — the
same arrangement as `GalleryMenu` for the photos layer, and closed by its own ×
(which turns the layer off) rather than by Escape. It holds the transport
buttons, `RadarTimeline` (the frame slider, whose track is tinted from the point
"now" falls on it, plus the clock and the relative offset), and a settings
dropdown. The colour-scheme names come from the server and are **not**
translated — each names the product it reproduces (NEXRAD, Dark Sky, …).
