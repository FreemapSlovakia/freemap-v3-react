# Panorama viewer

The 360° view from a point on the map, rendered by the terrain service at
`https://terrain.freemap.sk` and turned into something to look around in by
`src/features/panorama/`.

## The service

`POST /panorama` returns `multipart/form-data`: a JSON `meta` part, a PNG
`image` part, and — when asked — a gzipped `depth` part. The full wire contract
is the service's own `docs/API.md` (in the `dem-pyramid` repo); what matters on
this side:

- **It is slow and serialised.** One render saturates the machine, so requests
  queue. About 9 s for the fast tier and 27 s for the detailed one at 360°.
  Nothing may fire a render on map movement — see "The render is an explicit
  act" below.
- **Hanging up cancels the work**, within about a second, queued or running. So
  a new render must abort the one in flight rather than queue behind it. That
  is what the `cancelActions` in `panoramaRenderProcessorHandler` are for.
- **`X-Queue-Depth`** on the response says how many were waiting when this one
  was admitted. It arrives with the finished picture, so it can't drive a live
  queue readout — it is kept on the render and used to warn that the service is
  busy.
- **The client sends the account's bearer token itself.** The service is
  addressed directly rather than through `freemap-v3-api`, so `httpRequest`
  adds no credentials of its own (it only does that for relative URLs) and the
  header is set explicitly. The service clamps the quality an account may have
  and decides queue priority; asking for more than the tier allows is not the
  client's business to prevent, only to avoid embarrassing itself over.

The endpoint is `process.env['TERRAIN_URL']`, defined in `rspack.config.ts`.

**It is cross-origin, so it needs CORS.** The request carries `Authorization`
and `Content-Type: application/json`, either of which makes it non-simple, so
the browser sends an `OPTIONS` preflight first. The vhost in front of the
service has to answer that and allow both headers, and expose `X-Queue-Depth`
or the busy hint reads as zero:

```
Access-Control-Allow-Origin: <the portal origin>
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: authorization, content-type
Access-Control-Expose-Headers: X-Queue-Depth
```

A CORS refusal reaches the client as the same `TypeError` an unplugged cable
would, so `panoramaErrorCode` only says "offline" when `navigator.onLine`
agrees; otherwise it says the service could not be reached, which is all the
browser actually tells us.

## The render is an explicit act

A click on the map with the tool open both places the viewpoint and renders
(`panoramaPick`). Everything else — dragging the viewpoint marker
(`panoramaMoveViewpoint`), changing quality or the vertical range — only stages
the change; the toolbar then offers **Update** (`panoramaRender`).

Whether the picture still answers for the controls is **derived**, not tracked:
`panoramaRenderKey(viewpoint, settings, quality)` is stored on the render and
compared against the current one. Nothing has to remember to set a dirty flag.

## Quality, and the pixel cap

Five tiers in `PANORAMA_QUALITIES`, coarsest to finest — `step`/sampling
0.2/1×3, 0.1/3×3, 0.05/3×3, 0.05/9×9, 0.033/9×9, about 1.5 / 5 / 9 / 27 / 41 s
for a full turn. Cost runs with `supersample_x / step`, so each tier steps
along one of the two axes. Only the coarsest is free, the rest premium's;
`grantedQuality` is the single place that says so — the request, the menu and
the progress bar all ask it rather than each repeating the rule, and asking for
*less* than the account may have is never blocked.

The setting **defaults to the detailed tier**, because the account is what
decides whether it is granted:
asking for it without premium is put back to fast before the request goes out,
and defaulting the other way would leave a premium user on the free picture
until they found the control. For the same reason the menu shows the tier being
rendered rather than the one stored.

`panoramaStep` then raises the asked-for step wherever a full turn over the
current vertical band would exceed the service's 24 Mpx cap. Neither tier
reaches it today, but the headroom is thinner than it looks: pixels and cost
both run with `1/step²`, so one notch finer is several times the render — 0.02
at the standard tilt is 27 Mpx, over the cap and about a minute of somebody
else's server. The cap binds through the **tilt** setting as much as through
the quality, which is why both are in the render key.

## Two passes

A fine tier would leave the panel blank for half a minute or more, so the
handler renders `PANORAMA_PREVIEW_QUALITY` first — the cheapest tier there is,
about a second — publishes it marked `preview`, and renders the asked-for one
behind it. Always, with nothing to turn it off: because the preview is the
*coarsest* tier it adds a few percent to a detailed render, where a middling
preview would have cost the third again that once made it worth asking about.

## What the store holds, and what it can't

`PanoramaRenderInfo` (in `model/reducer.ts`) is the serializable half of a
render. The image's object URL and the decoded distance buffer are neither
serializable nor small, so they live in `renderHolder.ts`, matched by `id`.
The holder revokes what it replaces; `panoramaReleaseProcessor` clears it when
the tool closes or the map is cleared.

## Panning

The image is a repeating background, not a canvas: a 360° render's last column
abuts its first, so `background-repeat: repeat-x` makes panning an offset with
no end to run off — and it keeps a 7200 px image out of a canvas, which older
mobile GPUs cannot hold.

The view fits the whole altitude band by default (`fitScale = viewportHeight /
render.height`) and magnifies from there up to `MAX_ZOOM`, or further where the
image holds pixels the panel isn't showing. Past 1:1 it magnifies rather than
reveals, which is still worth having: it spreads a crowded skyline apart, and
the label layout runs in screen space, so more names appear as it does. Wheel
or pinch; there is no zoom control, because a picture one drags is a picture one
pinches.

**The bearing is a viewport, and both layers have to be told so.** It moves at
gesture speed, which two mechanisms would otherwise punish:

- Every dispatch writes the persisted state to localStorage
  (`statePersistingMiddleware` runs on *every* action), so the bearing reaches
  the store only once the turning settles — not per frame.
- `urlProcessor` chooses `replaceState` only when `restSignature` is unchanged;
  anything else takes the **unpaced** `pushState` branch. So `panorama-az` is a
  param of its own and is listed in `VIEWPORT_KEYS`, which keeps it out of that
  signature — turning the view now coalesces and rate-limits exactly like a map
  pan. Left as content it would have pushed a history entry per degree: six a
  second under auto-pan, one a frame under a drag, until Back was useless and
  WebKit refused the writes.

`panorama.viewpoint` must also appear in that processor's `rest` array to be
noticed at all; without it the param never moved. And the view seeds its
bearing from the store and resyncs when the store's differs from what it last
wrote itself — that last part is what stops a settle landing mid-drag from
snapping the picture back half a second.

The map's field-of-view wedge reads from `viewStore.ts` rather than from Redux,
because it needs the field of view as well as the bearing and that is nobody
else's business. The wedge is a `divIcon` marker drawn pointing north
and turned by mutating one transform, so a pan rewrites nothing else — the same
construction as the located heading beam, in the viewpoint marker's own red so
the two can't be confused. The same store carries where the pointer rests on
the ground, which the map marks with a faded crosshair beside the solid one a
press leaves behind. Each carries a dashed line back to the viewpoint — the
line of sight the reading was taken along — and a press that lands off the map
pans it with `panInside` rather than centring on it, which would throw the
viewpoint at the other end of that line off the screen.

## Labels

The service returns only **visible** summits, with fractional pixel positions
and a **dominance** in metres: how far the summit stands above the terrain
around it, within 3 km of itself. A summit standing clear of its neighbours
reads as a peak; one on a long level ridge does not, however tall it is. Not
called prominence, because topographic prominence is non-negative by definition
and this is not — where it is positive the two agree closely, but the name would
invite comparison with published figures for tops that score below zero.

**Metres are not the rank.** They don't compare across distance in either
direction: raw metres put a big distant massif over a nearby hill that fills
far more of the frame, while metres over distance — the angle it subtends —
puts a roadside knoll over the whole High Tatra range. `labelRank` in
`fromPeaks.ts` takes dominance over the square root of distance, which sits
between the two, and it is the one number here most worth re-tuning against
real views. Whatever it becomes, it stays a bare ordering with no unit:
nothing may test it against a fixed cut.

**Dominance is signed.** A top that never rises clear of its own ridge scores
how far the ridge stands over it — a shoulder around −37 m, a bump inside a
massif around −281 m — so the near field, which used to tie at zero in its
hundreds, now orders itself. `0` means only that there was nothing at that
depth to compare against. Rank on the value; nothing here may treat it as a
magnitude, and a request floor of `0` would drop exactly the near-field tops a
panorama most wants named — hence `MIN_DOMINANCE_M` sits far below any real
terrain.

**Which peaks come back depends on the render**, since visibility is tested
against the depth buffer — a finer tier still resolves somewhat more of them,
though far less than it used to: the service's visibility tolerance was once
tighter than its own sample spacing, which rejected summits in plain view and
made the count swing with `step`. With no floor, one viewpoint now answers with
about 620 named peaks at `step` 0.05 against roughly 540 at 0.1.

Everything about placement is ours. `labels/layout.ts` walks the labels in rank
order and puts each centred just above its subject, climbing a line at a time
where the spot is taken and dropping it where there is no air. It runs against
**screen** positions on every pan and zoom, so zooming in reveals more labels
with no new request.

Two sliders under one **Peak names** menu, and both act on what already
arrived: **Minimum dominance** says which summits count (`DOMINANCE_STEPS_M`, a
floor in metres), **Number of names** says how many of them fit
(`labelLayoutLimits`, a level from 0 to `LABEL_DENSITY_MAX`). Neither narrows
the request — the service is always asked for everything it will name, because
a narrower ask can only take candidates away and would cost a whole render to
change, while a filter over the labels in hand is instant.

They read alike but cut differently, which is why they share a menu rather than
being merged: thinning by the count keeps whatever ranks highest, and the rank
weighs distance, so it favours the near field; the dominance floor keeps the
summits that stand clear however far off they are. "Every big peak, as many as
fit" needs both, and neither slider reaches it alone. The toggle says where the
count stands and adds the floor beside it only while that is filtering, so the
button stays one word for anyone who never touches it.

The density level moves **both** limits `labelLayoutLimits` returns — the width
one name may claim, and how far it may climb to find room — because either
alone is the one that binds and the other then does nothing. The busiest step has no
width at all: what the picture will physically hold is what asking for the most
ought to mean, leaving collision and the climb as the only limits. A rich view offers far more
peaks than fit on one line — the better part of a thousand from a Tatra summit
over the full turn — so what really decides the count is how many lines they may
stack into; raising the cap alone changes nothing while the climb is exhausted
first.

The request asks for **everything the service will name**: a `min_dominance`
below any real terrain, capped at `max_peaks: 2000` as a bound on the payload
rather than on what is drawn. Its own default of 30 m would be a heavy cut, and
against a signed figure a floor of `0` would cut the near field entirely.
Thinning belongs here, where a change is instant; the cap is applied after the
sort, so what it does drop is what dominates the view least.

Beyond that, how many arrive is not the client's to influence. From a valley
viewpoint the service returned **two** peaks with no floor and no cap — asking
for more cannot conjure what it does not consider visible, so a sparse panorama
is a question for the service, not for these numbers.

Leaders are drawn dark-under-light, like the names' own shadow. A pale line
alone vanishes against the sky, which is where most of them run.

### Adding label sources

`PanoramaLabel` (`labels/types.ts`) is deliberately not the wire's shape. The
renderer knows only summits, and its ranking means nothing for a hut in a
valley — such a thing would score ~0 dominance and be culled before it was
ever returned.

But the client can do this itself: the distance buffer makes visibility
testable here. Project any coordinate with a known elevation into azimuth,
distance and altitude, map it with the documented `x = ((azimuth - az_start)
mod 360) / step`, `y = (alt_max - altitude) / step`, and compare its distance
against `distanceAt` at that pixel — which is exactly what the service does for
a summit. Elevation for arbitrary points comes from the elevation API we
already have.

So a second source (map selection, drawn points, route waypoints, gallery
photos, OSM POIs) plugs in by producing `PanoramaLabel`s; layout, culling,
styling and the tap card need no changes. Ranking is per-kind — angular
dominance only makes sense for summits.

## Caveats to keep surfaced

The ⓘ panel says them, and they are the support mail this feature would
otherwise generate:

- **The terrain model is bare earth.** Forests and buildings are invisible, so
  a view a forest would block is drawn as if it were clear. This is by far the
  largest source of error — around 200× bigger than the difference between two
  national datasets at a border.
- **Coverage varies.** National LiDAR where it exists, the global GEDTM30
  elsewhere; the transition is seamless but the detail is not uniform.
- **The eye is the local maximum** within a few metres of the click, because
  the pyramid stores an average and averaging costs a sharp summit more than it
  costs flat ground.

Attribution credits every model the pyramid can answer from — the same set the
elevation API credits (`ELEVATION_API_DTM_ATTRIBUTION`) plus `GEDTM30_ATTR` —
since the service names none per render and a 300 km view crosses borders.

## Not done yet

- Narrow-`fov` re-render for real optical zoom past the image's own pixels;
  the service says it is proportionally cheap.
- Device-orientation ("hold the phone up") mode beside the auto-pan.
- Entry from a selected peak, and a cross-link with the toposcope.
- Sun path — the service hasn't implemented it either.
