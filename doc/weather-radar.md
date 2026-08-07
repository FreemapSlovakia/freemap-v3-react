# Weather radar layer

The `R` overlay is an animated precipitation radar over the EUMETNET OPERA
composite — the pan-European mosaic that SHMÚ contributes to, so Slovakia and
all its neighbours are covered. Ten-minute steps; how far it reaches depends on
entitlement (see Premium below).

## Where it comes from

Two independent upstream services at `cache.bigware.sk`, `radar` (measured) and
`forecast` (extrapolated), each with its own status document, its own
regeneration cycle and — the part that reaches the layer — **its own zoom
range**: 1–9 for the measured feed, 3–7 for the forecast, which is far more
expensive to compute. Asking outside a feed's range is a 404, not an upscale.

The app talks to them **directly**; there is no proxy of ours in the path.
That rests on one thing which is easy to break:

> **Both feeds authenticate by `Referer`, and the app is served with
> `Referrer-Policy: no-referrer`.** Every request therefore has to set its own
> `referrerPolicy` — the tile layer in `RadarLayer`, and the status fetch in the
> processor. A per-request policy overrides the document's;
> `strict-origin-when-cross-origin` sends the origin and no path, which is what
> the server matches on. Drop either and the layer dies with a 401 that looks
> like a server fault.

CORS is sent per allowed origin (`vary: Origin`), so the status `fetch()` works
from `www.freemap.sk` and from `local.freemap.sk:9000` for dev builds. Origins
have to be added upstream one at a time.

`WEATHER_RADAR_URL` (rspack `EnvironmentPlugin`) is the single origin for both
feeds, and the only thing that would change to move them or to put a proxy back
in front.

### Licence

Same OPERA data as before: **EUMETNET OPERA**, and over Italy the national
composite under **CC-BY-SA-4.0** credited as "Radar-DPC" — a `country: 'it'`
attribution entry, so it shows only when the view can contain such a tile.

## The wire contract

Everything the app knows about the API lives in
`src/features/weatherRadar/api.ts`:

- `GET /{radar|forecast}/status` →
  `{ updatedAt, zoomLevels: number[], format, times: string[] }`.
  Times are unix seconds **as strings**; `zoomLevels` and `format` are read
  rather than assumed, so the server can widen a range or move from PNG to WebP
  with no app deploy at all.
- Tiles: `/{feed}/tiles/{time}/{z}/{x}/{y}.{format}`, 512×512 on the **standard
  slippy grid** — verified against a known-standard source — so they are @2x
  renders that Leaflet displays at its usual 256 CSS px. There is no size
  parameter, so a 1× screen pays for pixels it cannot use, and tiles run
  70–210 KB rather than the ~10 KB a vector-ish overlay would.
- `updatedAt` is the feed's regeneration stamp and is **stable between
  requests**, which is what makes it usable as the forecast's cache key.

`toFrames` merges the two feeds into the single timeline the UI animates,
tagging the forecast half. That flag decides the slider's tint, the premium
gate, and which feed a frame's tiles come from.

## Premium

Premium reaches **six hours** back and gets the forecast; everyone else may open
**two hours** of measured frames. Both are ceilings rather than promises — the
feed currently holds around three hours, so premium takes what is there and
picks up more if the server starts publishing it.

The locked frames stay **on the track**. `radarFramesSelector` returns
everything within the six-hour ceiling regardless of entitlement, and
`radarAllowedSelector` says which stretch of it this user may open. A timeline
that simply stopped early would say nothing about what premium buys; a greyed
band at each end says it without a word. So the track reads:

    [ locked older ][ what you may watch ][ forecast, locked without premium ]

- **The slider cannot reach a locked band at all.** Its `min`/`max` are the
  openable frames, and the bands are painted on a wrapper behind it, so the
  browser's own clamping does the work. That matters because a thumb is a
  circle: clicking its left half makes the browser re-centre it on the pointer,
  which walks the value backwards. Catching that after the fact — as an earlier
  version did, by rejecting the change in `onChange` — meant undoing the ring's
  centring, a click on the track, a fast drag and the arrow keys as four
  separate cases, and a rejected change leaves the state untouched, so a
  controlled range kept the thumb wherever the pointer had put it and fired the
  handler again the whole way back out. With the range restricted there is
  simply no value there to move to.

  The offer is a plain click handler on that wrapper, which covers both ways of
  asking for it: clicking a locked band, and a drag that ends over one — pointer
  down and up share the wrapper, so the click lands there either way. A drag
  towards a band can therefore raise the modal more than once across gestures.
  That is accepted rather than worked around: the attempts to suppress it
  (rejecting the change in `onChange`, then a once-per-gesture flag on
  `pointermove`) each added machinery without changing what a user saw.

  The alternative — serving those frames as the checkerboard `ScaledTileLayer`
  uses for premium zooms — reads as broken data on a time axis rather than as a
  teaser, and would spend most of a playback loop in mosaic.
- **Playback and prefetch run over the allowed stretch only**, wrapping at its
  ends, so the animation never stalls on a frame it cannot show and no tiles
  are fetched for frames the user will not see.
- **`radarIndexSelector` clamps into the range**, which matters when premium
  expires mid-session or a pin the entitlement no longer covers is restored.

The bands are drawn by the track's gradient in `RadarTimeline.module.css`, from
three boundaries the component computes; each sits midway between two frames,
since the thumb is at `index / (count - 1)`. Both locked bands use **warning**,
the app's upsell colour, so a free user's track reads as a single statement at
both ends: "this is the premium part". The tail's colour follows what it means
rather than what it is — warning while locked, **info** once the user may open
it, where it marks a forecast rather than an offer. Info because the neutral
middle is already a grey (a muted grey tail would not be told apart from it) and
primary on a track reads as a filled-in portion.

## State

- **`weatherRadar`** (transient) — the frame list, each feed's format and zoom
  band (straight from its status document), and where the user is in the
  animation. The selection has three states, all decided by `pinnedTime` in the
  reducer:
  - **`null` is live** — follow the newest observed frame, so a refresh carries
    the view forward. Picking that frame *stores* `null`, rather than its
    timestamp, or playing to the end would silently freeze the layer until the
    frame aged off the list, hours later.
  - **Any other frame pins** to its absolute time and stays there as the
    window advances.
  - **A pin that ceases to exist moves to the nearest frame that does.** The
    oldest ages off every ten minutes and forecast frames are republished on
    shifted timestamps, so this is routine; going to the nearest keeps a viewer
    of the old end at the old end instead of flinging them forward to live.
- **`weatherRadarSettings`** (persisted) — only `showNowcast` now; the server
  offers a single palette with no smoothing or snow variants. A dedicated
  settings slice per the convention in the root agent file, so the choice
  survives turning the layer off and on.

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

Both feeds are asked for together, and a failure of one is left to the other
rather than losing both — the forecast is the more fragile and the less
essential. `weatherRadarRefreshProcessor` awaits only the **first** fetch. A periodic
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
  be shown as a sheet of nothing over the frame that was working. The
  replacement image fires a `tileload` of its own, so only a tile still carrying
  its radar URL is counted as answered.
- Dropping a layer that is the visible one forgets that it was visible, so a
  layer rebuilt for the same frame is revealed rather than mistaken for the one
  already on screen. The pool cleanup that a new frame list triggers runs ahead
  of the effect that shows a frame, so anything it drops is rebuilt in the same
  commit instead of leaving the map blank until the next list arrives.
- On `moveend`, every layer but the visible one and the one most recently asked
  for is dropped. Keeping them all would make a single pan re-fetch a whole
  animation's worth of tiles for the new area; they are rebuilt lazily as the
  loop comes round again. The asked-for frame stays because it may still be
  loading — and nothing re-adds it until the frame itself changes, so dropping
  it would strand the map on the previous frame (a pan or a zoom during the
  first load, or any `mapRefocus` while GPS following is on).

Each frame's layer takes its `minNativeZoom`/`maxNativeZoom` from **its own
feed**, not from the layer registry: the two bands differ, and asking outside
one is a 404 rather than an upscale. The registry's `maxNativeZoom: 9` is only
what it advertises to the offline export and the layer table.

Playback lives in `useRadarPlayback`, called from `RadarLayer` rather than from
the toolbar, so the animation is tied to the layer that shows it and not to a
menu that can be hidden. It paces itself off **whether the frame has finished
trying**, not off a bare timer: `RadarLayer` publishes the set of resolved
frames and the dwell starts when the selected one is in it. Stepping on a timer
alone let the index race ahead of the picture on a first pass — every second or
third frame appearing, which reads as a stutter — because a frame is revealed
only after every one of its tiles has settled.

"Resolved" and not "painted", which is a distinction worth keeping: a frame
whose every tile 404s is never painted, and its layer stays in the pool so
Leaflet never re-fires `load`. Waiting for *that* stalls the loop for the full
timeout on every pass rather than once. The timeout still covers the frame that
is merely slow.

## The toolbar

`WeatherRadarMenu` is mounted from `Main.tsx` while `layers` contains `R` — the
same arrangement as `GalleryMenu` for the photos layer, and closed by its own ×
(which turns the layer off) rather than by Escape. It holds the transport
buttons, `RadarTimeline` (the frame slider, whose track is tinted from the point
"now" falls on it, plus the clock and the relative offset), and a settings
dropdown. The colour-scheme names come from the server and are **not**
translated — each names the product it reproduces (NEXRAD, Dark Sky, …).
