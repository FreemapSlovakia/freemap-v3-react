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

**Standing where the user is** borrows the map's own Locate me rather than
asking the browser separately: one watch, one permission prompt, and the dot on
the map to say where the fix put them. A fix already in hand is taken at once;
otherwise `panoramaLocateProcessor` turns locating on and `panoramaFixProcessor`
picks the viewpoint off the first fix.

**The first fix is not good enough to stand on.** `locateProcessor` opens with a
deliberately coarse one — `enableHighAccuracy: false`, ten minutes of cache
allowed — so the marker appears at once, and it arrives well before the watch's.
Taken as the viewpoint it would draw a panorama of where the user was ten
minutes ago, or of a cell-tower estimate kilometres off, at up to forty seconds
of server time. `panoramaFixProcessor` therefore ignores a fix rougher than
`MAX_ACCURACY_M` or older than `MAX_AGE_MS` and keeps waiting for the accurate
one. Ignoring rather than refusing: the wait simply continues, and the button
stays pressable, which is how a user gives up.

Three more details that are easy to get wrong. `toggleLocate` **clears the last fix**
on its way in, so turning on what is already on would throw away the answer —
hence the `!locate` guard. The fix processor is gated on `awaitingFix`, so
locating for any other reason (the map's button, a tracking session) never moves
a viewpoint the user placed by hand: a render this expensive is not started by a
fix nobody asked for.

And the wait answers to **`toggleLocate`, not to the error paths** — those do
not agree. `locateProcessor` reports failure three ways: a timeout keeps trying
and says nothing to us, `POSITION_UNAVAILABLE` dispatches `locateFailed`, and a
refused permission dispatches `toggleLocate(false)` and a toast without ever
dispatching `locateFailed` at all. Waiting on the failure actions alone left the
button spinning for ever behind a "could not get position" toast. So any toggle
clears the flag — which is also right for the user turning locating off by hand
— and the processor sets the flag *after* its own `toggleLocate`, or it would
clear the wait it is starting.

Even that leaves one hole, because `locateProcessor` runs **inside** that
dispatch: where it refuses on the spot — no geolocation at all — locating is
already off again by the time the flag is set, and no later toggle is coming to
clear it. So the processor reads `location.locate` back and gives up rather than
assuming the ask took. And the button is never disabled: a bare timeout
dispatches nothing whatsoever, so pressing it again is the only way out of a
wait that will not end, and a disabled button has none.

## Toolbar or modal

One line decides: **the toolbar carries what is changed while looking at the
picture; the modal carries what is set once.**

By that test nothing moved into the modal when it arrived — the toolbar's
controls all pass. The peak-name sliders act on the picture already in hand, so
they are instant and belong under the eye. Quality is the most-changed render
param and doubles as the premium surface, showing the tier actually granted.
The tilt presets are how a view is framed, which is a thing done while looking
at it. Locate and Update are actions.

What the modal took was what had **no UI at all**: `eye`, which every request
carried and nothing could change, and the exact vertical band, which the toolbar
could display when a link carried one but had nowhere to type. The look
(`ridge_strength`, `ridge_color`, `ground_color`) joined them.

The band is split rather than duplicated, which is the trap here: the modal
first grew its own preset dropdown, and the same control in two places is two
places free to disagree. **The toolbar picks a preset, the modal types the
angles.** The toolbar's list ends in a "Exact angles…" item that opens the modal
rather than setting anything, and the modal's two fields are seeded from
`tiltRange` — whatever is framed now — so they read as the numbers behind the
current choice. Only typing different ones sets `tilt: 'custom'`; leaving them
alone must not turn "Standard" into a pair of numbers saying the very same
thing.

Everything in there is a request parameter, so all of it is in
`panoramaRenderKey` and none of it renders on its own — Save stages, Update
pays. Named looks lead, because the only preview a colour has is a whole render
and choosing four numbers blind is not a thing to ask of anyone;
`panoramaLookOf` reads the settings back to a name, or `custom` where they match
none.

**`ridgeStrength` is a gain, not an opacity.** The renderer inks a near ridge at
about 0.55 alpha and a distant one at 0.15, so `1` is already translucent and
there would be no way to ask for a solid line if the field stopped at full. The
service therefore sets no ceiling — alpha clamps at composite — but the slider
stops at `RIDGE_STRENGTH_MAX`, past which even the haziest distant ridge has
saturated and moving it further changes nothing.

`ridgeWidth` is thickness in **output** pixels, so a line weighs the same
whatever `step` the tier renders at, and it is independent of the gain: the
interior of a stroke inks at the same alpha however wide it is, so widening
thickens without darkening. This one the service does bound (20), because every
stroke inks a band of rows and the pass costs more the wider they are.

## Quality, and the pixel cap

Five tiers in `PANORAMA_QUALITIES`, coarsest to finest — `step`/sampling
0.2/1×3, 0.1/3×3, 0.05/3×3, 0.05/9×9, 0.033/9×9, about 1.5 / 5 / 9 / 27 / 41 s
for a full turn. Cost runs with `supersample_x / step`, so each tier steps
along one of the two axes. Only the coarsest is free, the rest premium's;
`grantedQuality` is the single place that says so — the request, the menu and
the progress bar all ask it rather than each repeating the rule, and asking for
*less* than the account may have is never blocked.

The setting **defaults to a middling tier**, not the free one, because the
account is what decides whether it is granted: asking for more without premium
is put back to `FREE_QUALITY` before the request goes out, and defaulting the other way
would leave a premium user on the free picture until they found the control.
Middling rather than finest because the top tier is the better part of a minute
of a server that renders one at a time — a default nobody chose should not cost
that. For the same reason the menu shows the tier being rendered rather than the
one stored.

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

**Turning it by hand stops the following outright**, rather than pausing it:
the drag clears `autoPan`, which is the same state the stop button writes and
is persisted like any other preference. A timed resume was the first attempt
and was wrong — someone drags because they want to look at something, and
having the picture swing back to where the phone points a few seconds later
takes it away again. The stop fires only once travel passes `CLICK_SLOP_PX`,
so a press asking a distance is not steering.

**Where the device points wins over turning by itself.** One `autoPan`
preference, two behaviours: with a magnetometer the view eases toward the
compass bearing (`subscribeCompass`, which already resolves iOS' ready-made
heading against the W3C Euler angles and compensates for tilt and screen
rotation), and without one it turns at a steady six degrees a second. Both run
off the same rAF loop, and the loop asks per frame rather than picking a mode
once: a sensor that goes quiet for `COMPASS_STALE_MS` hands the turn back
rather than freezing the picture at the last bearing it heard.

The easing constant is the whole feel of it — `COMPASS_EASE_MS` short enough
that turning around arrives with the turn, long enough that magnetometer jitter
reads as a still picture. Note `useHeading` is deliberately **not** reused here:
it fuses in the GPS course and is gated on the locate mode being on, and someone
standing still reading a skyline wants neither.

iOS grants the sensor only from a user gesture — a promise chained off a click
still counts, a later effect does not — so **the map click that picks the
viewpoint is where it is asked**, not the ▶ button. A phone starts out
following, so waiting for ▶ would mean waiting for a press nobody has any
reason to make: the compass would never engage at all, and the view would spin
forever. The ▶/■ press asks too, on either edge, for the case where following
was turned off and is being turned back on.

Nothing is done with the answer. A refusal leaves the view turning by itself,
which is what a device without a magnetometer does anyway — and deliberately
**not** `ensureCompassPermission`, which would take a refusal here out on
`locationSettings.headingSource`, a preference belonging to the located heading
beam and nothing to do with this panel.

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
press leaves behind. A finger has no hover, so **the hover branch is a mouse's and a pen's alone**
and a press is what measures on touch. Gating it that way is not tidiness: a
touch starting on a peak label is never registered (the label stops the
`pointerdown`) while its moves still bubble, so it would set a readout that
nothing could clear — its `pointerup` finds no gesture to end, and
`pointerleave` is precisely what a finger lifting fires.

The reading is held as a bearing and an image row, not as the pixel it was
taken at, so it stays over its own terrain while the view turns — a press-set
one has to survive the compass moving the picture under it. It is dropped when
a new render lands: the two passes are different heights, and the same row in
the preview and in the detailed picture are different altitudes. Each carries a dashed line back to the viewpoint — the
line of sight the reading was taken along.

A mark already on screen leaves the map alone: moving it under someone who can
see what they asked for is the rudest thing this could do. One that isn't —
a ridge picked out of the picture can be tens of kilometres off — is **centred**,
which is where the eye goes looking for it. On screen is measured in container
pixels against a `PAN_MARGIN_PX` inset, so a mark hard against an edge counts as
off. Note the check knows nothing of the panel itself, which floats over the
map: a mark behind it reads as visible and is left there.

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
between the two, times a haze term `exp(-distance / HAZE_M)`.

The square root alone still flattered the horizon: it is a slow falloff and the
far field is *wide* — a ring at 150 km holds far more mountains than one at 15 —
so distant giants crowded out the near hills, and thinning the names took the
near ones first. The haze term says a summit has to be **seeable**, not merely
big; it barely touches anything close and falls away hard past `HAZE_M`
(120 km). It is a soft falloff, not a cutoff: the High Tatras at 50 km still
outrank the foothills, which is right, while a 1500 m giant at 177 km drops
below a hill two ridges away, which is also right — on most days it is not
there at all.

**Both terms scale a signed number, which is the trap.** Dominance is negative
for a top that never rises clear of its own ridge, and scaling a negative number
*down* raises it — so multiplying by a falloff made a subordinate top rank
*better* the further off it was, exactly backwards, and across most of the near
field the weighting exists to protect. `labelRank` therefore divides by the
falloff where the dominance is negative and multiplies where it is positive:
either way the rank drops with distance, and every top that stands clear
outranks every one that doesn't.

This belongs here and not in the request. The service is asked for everything it
will name, and ranking is display policy that depends on the panel, the zoom and
the density setting — none of which it knows. Re-tuning `HAZE_M` costs a
re-render of the labels; re-tuning it server-side would cost a whole panorama.

`labelRank` is the one number here most worth re-tuning against real views.
Whatever it becomes, it stays a bare ordering with no unit: nothing may test it
against a fixed cut.

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
styling and what a press does need no changes. Ranking is per-kind — angular
dominance only makes sense for summits.

**Pressing a name marks its summit on the map**, and the mark carries the
summit with it: `PanoramaProbe.peak` holds the label's id, name and elevation
beside the coordinates. One picked thing, said in three places at
once — the name in the picture goes the marker's colour, the marker gets a
tooltip, and the panel's footer says it beside the viewpoint's own elevation.

Three because each covers where the other two aren't: the footer is the only
one a finger can read (there is no hover to open a tooltip with), the tooltip
is the one that works when the panel is small or the map is what you are
looking at, and the colour is what says *which* of a hundred names on the
skyline the other two are talking about.

`distance` and `azimuth` sit on the probe itself rather than inside `peak`,
because a press on the bare terrain reads both off the picture just the same —
that is the whole of what such a press asked. Only the `peak` half is optional,
so the tooltip and the footer both carry the figures and add the name above
them where there is one. The marker is interactive so that a press on the pin
does not fall through to the map, which under this tool picks a new viewpoint —
nobody presses a pin meaning to move house.

**The eye marker says its own elevation**, from `meta.eye_elevation` — the
render answers it for the place it was taken from, so there is no request to
make, no account to branch on (the service clamped what it would give this one
when it drew the picture) and no credit to add beyond the ⓘ panel's. It is the
eye's height, `settings.eye` included, not the bare DEM value.

It is hidden the moment the marker is dragged off the rendered viewpoint, since
dragging stages a new place without rendering and the figure would then be
about somewhere else. Only the viewpoint is compared, not the whole render key:
reframing or changing the tier makes another picture of the same spot, and the
same spot is the same height.

**Elevation is not derived for a terrain press.** It looks as though it should
be: the image row gives the altitude angle, and `eye + distance × tan(alt)`
follows. It doesn't survive the far field — the renderer draws with Earth
curvature and refraction, so at 50 km the naive inversion is out by the better
part of 200 m, and matching its correction means guessing its constants. The
right source is the elevation API the app already talks to
(`src/shared/elevation.ts`), keyed on the ground point the press already
resolves. Not wired up yet.

Earlier attempts, both worse: a card drawn in the picture put the answer over
the very skyline it was about and stole presses and hover from the viewer under
it; a toast said it somewhere the eye had no reason to be, and timed out while
the thing it described was still on screen.

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
- Entry from a selected peak, and a cross-link with the toposcope.
- Sun path — the service hasn't implemented it either.
