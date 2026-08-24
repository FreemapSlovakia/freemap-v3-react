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
- **Progress comes over a side channel.** The response is one multipart body
  that arrives at the end, so `renderPanorama` invents a token, sends it as
  `X-Job`, and subscribes to `GET /progress/{token}` — an `EventSource`
  reporting `phase` (`queued`/`rendering`/`encoding`/`done`), how many renders
  are `ahead`, and `percent`. Subscribed *before* the request, or the queued
  phase is missed. Both ends must close it: `done` is the last event and a
  browser reopens a stream that ends. An unrecognised phase — the service's
  `unknown`, for a token whose request hasn't landed yet — reports nothing, and
  the panel falls back to the clock estimate, which is also what happens where
  the stream can't be opened at all. The response's own `X-Queue-Depth` says
  the same thing after the fact and is not read.
- **The client sends the account's bearer token itself.** The service is
  addressed directly rather than through `freemap-v3-api`, so `httpRequest`
  adds no credentials of its own (it only does that for relative URLs) and the
  header is set explicitly. The service clamps the quality an account may have
  and decides queue priority; asking for more than the tier allows is not the
  client's business to prevent, only to avoid embarrassing itself over.

The endpoint is `process.env['TERRAIN_URL']`, defined in `rspack.config.ts`.

**It is cross-origin, so it needs CORS.** The request carries `Authorization`,
`Content-Type: application/json` and `X-Job`, any of which makes it non-simple,
so the browser sends an `OPTIONS` preflight first. The vhost in front of the
service has to answer that and allow all three:

```
Access-Control-Allow-Origin: <the portal origin>
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: authorization, content-type, x-job
```

The progress stream is a plain `GET`, so it needs the origin header on the
response but no preflight — and it needs `proxy_buffering off`, or nginx holds
every event until the render is over.

A CORS refusal reaches the client as the same `TypeError` an unplugged cable
would, so `panoramaErrorCode` only says "offline" when `navigator.onLine`
agrees; otherwise it says the service could not be reached, which is all the
browser actually tells us.

## The render is an explicit act

Naming a place both places the viewpoint and renders (`panoramaPick`) — the ask
itself is the explicit act. Everything else — dragging the viewpoint marker
(`panoramaMoveViewpoint`), changing quality or the vertical range — only stages
the change; the controls then offer **Update** (`panoramaRender`).

**The panel is not a map-click tool.** It is in `panelTools`, not `mapTool`, so
it can stay open beside the route planner. Where to stand is asked for
explicitly, by a split button wearing the same standing figure its map marker
wears (the viewshed's pair wear an eye, the toposcope's the viewpoint starburst
— one glyph per observer, so a map carrying several says which is which; the
binoculars are the viewshed *layer's* own mark, in the switcher and its toolbar
title): its own
press raises `pickingViewpoint`, a picking mode like the toposcope's centre (see
`pickingModeSelector`), and its one menu item takes the GPS instead. The
toposcope's centre is placed by the same pair in the same order — the two panels
ask the same question, so they must not answer it in opposite orders.

Whether the picture still answers for the controls is **derived**, not tracked:
`panoramaRenderKey(viewpoint, settings, quality)` is stored on the render and
compared against the current one. Nothing has to remember to set a dirty flag.

**Standing where the user is** borrows the map's own Locate me rather than
asking the browser separately: one watch, one permission prompt, and the dot on
the map to say where the fix put them. The machinery is the location feature's
and shared — `requestFix('panorama')`, answered by `fixReady`; see
`locateOnceProcessor`. A fix already in hand is taken at once; otherwise
locating is turned on and the first good fix answers. `panoramaFixProcessor` is
all that is left on this side: it turns that answer into a `panoramaPick`.

**The first fix is not good enough to stand on.** `locateProcessor` opens with a
deliberately coarse one — `enableHighAccuracy: false`, ten minutes of cache
allowed — so the marker appears at once, and it arrives well before the watch's.
Taken as the viewpoint it would draw a panorama of where the user was ten
minutes ago, or of a cell-tower estimate kilometres off, at up to forty seconds
of server time. Both paths therefore hold a fix to `standable` — rougher than
`MAX_ACCURACY_M` or older than `MAX_AGE_MS` and it is ignored, including the one
already in hand when the button is pressed, since locating may have been on for
the map's own reasons for the last ten minutes. Ignoring rather than refusing:
the wait simply continues, and the button stays pressable, which is how a user
gives up.

Of the two tests the accuracy is the one that carries it. `locateProcessor`
stamps `at` with the current time wherever the platform's own timestamp cannot
be trusted, so on such a host a cached fix arrives looking fresh — but the
coarse pass asks for no accuracy, and what it answers with says so.

Three more details that are easy to get wrong. `toggleLocate` **clears the last fix**
on its way in, so turning on what is already on would throw away the answer —
hence the `!locate` guard. The fix processor is gated on `location.fixRequest`,
so locating for any other reason (the map's button, a tracking session) never
moves a viewpoint the user placed by hand: a render this expensive is not
started by a fix nobody asked for.

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

**The toolbar is inside the window.** The panorama registers no tool menu of its
own; `PanoramaControls` renders the same controls along the bottom of its panel,
inside the shared `FloatingWindowControls` — the scroller the top toolbars use,
so a narrow window scrolls them sideways rather than wrapping them into the
picture's height. They belong to the picture and the picture floats — and full
screen made the point plainly, since the panel covered the tool's own toolbar
and left the controls unreachable. What `ToolMenu` also carried had to be
carried here: the experimental and offline badges, and the close button.

One line decides: **the toolbar carries what rearranges the picture already in
hand; the modal carries what has to be asked for again.** Cost, not frequency —
frequency is what it usually amounts to, but it gives no answer for a setting
that is rarely touched and still instant, and the haze slider spent a day in the
modal on that mistake.

Two deliberate exceptions, both request parameters kept in the toolbar because
they are how a view is *framed* while looking at it: quality and the vertical
view. Nothing else in the toolbar costs a render, and nothing in the modal is
free.

By that test nothing moved into the modal when it arrived — the toolbar's
controls all pass. The peak-name sliders act on the picture already in hand, so
they are instant and belong under the eye. Quality is the most-changed render
param and doubles as the premium surface, showing the tier actually granted.
The tilt presets are how a view is framed, which is a thing done while looking
at it. Locate and Update are actions.

What the modal took was what had **no UI at all**: `eye`, which every request
carried and nothing could change, and the exact vertical band, which the toolbar
could display when a link carried one but had nowhere to type. The look
(`ridge_strength`, `ridge_color`, `ground_color`) joined them, and so did the
depth lift, which sits beside the band because it moves it.

The one cut that setting brings — whether the summits it reveals are named — is
in the peak-names menu instead, and only while there is a lift to have revealed
any. Same rule: the lift is asked for, the cut acts on the labels in hand.

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

**How far the picture sees** is the other setting an account can overreach on:
`rangeKm`, 10–400 km, past `FREE_RANGE_MAX_KM` (300 — the service's own default,
so nothing regressed when the control arrived) it is premium's, since every
extra kilometre is samples along every ray. The two travel together as
`PanoramaGrants` from `grantedPanorama(settings, premium)`, which is what
`buildPanoramaRequest` and `panoramaRenderKey` take: the key carries the
**granted** range, so a lapsed account is not told its picture is out of date
over a figure it cannot have. The modal's slider stops at what the account may
have and wears a gem, rather than running to 400 and being clamped behind the
user's back — the same shape as the cached-map zoom range.

`panoramaStep` then raises the asked-for step wherever a full turn over the
current vertical band would exceed the service's 24 Mpx cap. Neither tier
reaches it today, but the headroom is thinner than it looks: pixels and cost
both run with `1/step²`, so one notch finer is several times the render — 0.02
at the standard tilt is 27 Mpx, over the cap and about a minute of somebody
else's server. The cap binds through the **tilt** setting as much as through
the quality, which is why both are in the render key.

## Unfolding distance

A true panorama spends its frame badly: the ridge four kilometres off fills a
third of the picture and the range that is the reason to look that way gets a
sliver above it. `depth_lift` — the modal's **Unfold distance** — raises terrain
in proportion to how far off it is, nothing at the eye and the asked-for degrees
at the service's `range`, so the layers separate. `0` is a true view and the
default.

Two consequences the client owns.

**The band is raised with it.** The horizon rises by exactly the lift, so
`renderTiltRange` adds the same amount to `alt_max` before the request goes out
— otherwise the far ridges the lift exists to separate climb straight out of an
unchanged frame. `panoramaStep` works from the raised band too, since the pixel
cap binds through it. The tilt setting itself is left alone: the toolbar and the
modal go on saying what the user framed, and `panoramaRenderKey` carries the
lift as an entry of its own, because a lift of 1° over a 12° top is a different
picture from none over 13°.

**The lift reveals.** It warps the world rather than the picture, so it decides
what hides what: a range lifted clear of the crest in front of it is drawn, and
its summits come back with `revealed: true`. That is not a bug to route around —
the service tried keeping true visibility under a lifted picture and it tears,
leaving distant ranges as flat-topped slabs — but it does mean a render with a
lift is a **drawing, not a photograph**, and the client has to say so. It does,
three ways: such a name and its leader are drawn at `REVEALED_OPACITY`,
`showRevealedLabels` turns them off altogether (a cut in `candidateLabels`, so
the toposcope obeys it too), and the ⓘ panel gains a caveat.

Both of those, and the checkbox itself, key on **`render.depthLift`, not the
setting** — the setting says what the *next* render will do, and a lift staged
or taken away without pressing Update would otherwise hide the one control that
can bring back names hidden in the picture still on screen.

`labelRank` also **halves** a revealed summit's rank, so where names compete for
room the one that can actually be seen takes it. Halved rather than tiered below
every seeable top: what the lift reveals is usually the range the picture was
unfolded to see, and a strict tier would hand its name to the near ridge that
hides it.

## Two passes

A fine tier would leave the panel blank for half a minute or more, so the
handler renders `PANORAMA_PREVIEW_QUALITY` first — the cheapest tier there is,
about a second — publishes it marked `preview`, and renders the asked-for one
behind it. Always, with nothing to turn it off: because the preview is the
*coarsest* tier it adds a few percent to a detailed render, where a middling
preview would have cost the third again that once made it worth asking about.

**Both passes ask for peaks**, and the names are redrawn when the second lands.
They do not fully agree: `visible` is decided by the two rays bracketing a
summit, 0.2° apart at preview quality and 0.017° at the finest, and a summit
whose neighbourhood is near-level can still swing its dominance — together, four
of the top forty labels changed under the second pass at an Ötztal viewpoint.
Asking once and carrying the first answer over was tried and reverted: it saved
the second peak pass, about two seconds of a server that renders one at a time,
but it made the *coarse* pass answer for visibility, so summits the detailed
picture draws behind a ridge kept their names. Redrawing is the honest half of
that bargain — the labels answer for the picture actually being looked at.

Everything else about a peak is tier-independent, which is worth knowing before
optimising here: over 2470 peaks common to both passes of that view, `ele`,
`distance`, `azimuth` and `altitude` were identical to the last digit, and `y`
is a closed form in `altitude` and `step`. Only `visible`, `revealed` and
`dominance` move.

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
construction as the located heading beam.

**Everything `PanoramaResult` draws is inked in `panoramaSettings.groundColor`**
— the eye, the faded eye, the wedge, the sight lines and the marks they end at.
That is what tells them from the located heading beam, and from another
terrain overlay's own marks (the viewshed's follow its overlay colour the same
way). One source, so a look changed in the settings modal moves all of them.

**Everything read out of the picture is anchored at `sightFrom`** — the render's
own viewpoint — rather than at the pin: the wedge, and the sight line each mark
carries. The pin only stages where the *next* render goes, so a drag leaves it
standing somewhere the picture never saw, and lines drawn from there cross
country nobody measured. Where the two have come apart — the pin under the
finger, or `atRenderedViewpoint` false after the drop — a faded, undraggable eye
is drawn at `sightFrom`, so the wedge and the lines stand on something rather
than radiating out of bare ground; it carries the render's eye elevation, which
is still true of that place if no longer of the pin.

The ghost is put out at `dragstart`, which means a **re-render inside the
gesture**. That is only safe because `RichMarker` keeps the icon it has wherever
nothing about it changed: rebuilding one reaches Leaflet's `setIcon`, whose
`_initIcon` → `_initInteraction` replaces the marker's `MarkerDrag` and takes
the gesture with it. That is what made the eye undraggable in the first place —
the panorama re-renders every half-degree the view turns, so the drag handler
was being replaced a dozen times a second and the press died before it moved.

The same store carries where the pointer rests on the ground, which the map
marks with a faded crosshair beside the solid one a press leaves behind. A finger has no hover, so **the hover branch is a mouse's and a pen's alone**
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

The press also leaves a dot in the picture itself, in the picked names' ink,
which is the map crosshair's counterpart where the pressing happened. It is put
back from the same bearing and row, so it stays on its terrain as the view
turns, and it answers to the mark on the map rather than to itself: picking a
name instead clears it, since a named summit already reddens its own anchor dot,
and a new viewpoint drops both while this picture is still up. A press on the
sky marks nothing, the way it already marks nothing on the map.

A mark already on screen leaves the map alone: moving it under someone who can
see what they asked for is the rudest thing this could do. One that isn't —
a ridge picked out of the picture can be tens of kilometres off — is **centred**,
which is where the eye goes looking for it. On screen is measured in container
pixels against a `PAN_MARGIN_PX` inset, so a mark hard against an edge counts as
off. Note the check knows nothing of the panel itself, which floats over the
map: a mark behind it reads as visible and is left there.

## Labels

The service returns only **visible** summits — including, under a depth lift,
the ones only the lift made visible, flagged `revealed` — with fractional pixel
positions and a **dominance** in metres: how far the summit stands above the terrain
around it, within 3 km of itself. A summit standing clear of its neighbours
reads as a peak; one on a long level ridge does not, however tall it is. Not
called prominence, because topographic prominence is non-negative by definition
and this is not — where it is positive the two agree closely, but the name would
invite comparison with published figures for tops that score below zero.

**Metres are not the rank.** They don't compare across distance in either
direction: raw metres put a big distant massif over a nearby hill that fills
far more of the frame, while metres over distance — the angle it subtends —
puts a roadside knoll over the whole High Tatra range. `labelRank` in
`fromPeaks.ts` takes dominance over `distance ** distanceWeight`, which sits
between the two wherever the weight does, times a haze term
`exp(-distance / hazeM)`. Both are the user's; the square root is the default.

The distance term alone still flattered the horizon: it is a slow falloff and the
far field is *wide* — a ring at 150 km holds far more mountains than one at 15 —
so distant giants crowded out the near hills, and thinning the names took the
near ones first. The haze term says a summit has to be **seeable**, not merely
big; it barely touches anything close and falls away hard past `hazeM`
(120 km by default). Soft over the range that matters — the tail cut below is
what ends it: the High Tatras at 50 km still
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
the density setting — none of which it knows. Re-ranking costs a re-sort of the
labels in hand; doing it server-side would cost a whole panorama.

**Both terms are the user's**, so `rankLabels` runs in the viewer and
`labelsFromPeaks` hands over an unordered list. That is why the rank is not a
field on `PanoramaLabel`: it would be stale the moment a slider moved.

`labelDistanceWeight` is the exponent `p` in `dominance / distance ** p`, and
its two ends are the only two things a rank can honestly mean — `0` is **real
size** (raw metres, so the far massif wins) and `1` is **apparent size** (the
angle it subtends, so the near hill wins). `0.5` is the default and asks a
summit twice as far for `√2` the dominance to tie. `labelHazeKm` is the other
end of the same question, and `0` is clear air — no falloff, no cut. Its slider
runs through `LABEL_HAZE_STEPS_KM`, which puts that `0` **after** 400 km rather
than before 10: it means names carrying further than any figure on the slider,
so at the low end it would read as the opposite of what its position says.

Two knobs for what looks like one preference, because they act on different
scales: the exponent sets the trade rate everywhere, while the haze does almost
nothing up close and bites hard past its own distance. Once real views say which
pairs are worth having, they are candidates to collapse into one preset.

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
against the rays the tier actually cast — two bracketing a summit stand 0.2°
apart at preview quality and 0.017° at the finest, so a marginal top appears at
one tier and not the other. From an Ötztal viewpoint the two passes shared 2470
peaks and disagreed about 358 of them. Dominance no longer moves with the tier
in the same way (the service measures it on a grid of its own), though a summit
whose neighbourhood is near-level can still swing hard — 634 m against −0.8 m
for one of them. So the names are redrawn when the detailed pass lands; see
"Two passes".

Everything about placement is ours, in two passes. `thinLabels` decides which
summits get a name at all: one per pitch of horizon, in rank order. `layoutLabels`
then walks the survivors and puts each centred just above its subject, climbing a
line at a time where the spot is taken and dropping it where there is no air, all
against **screen** positions.

**The thinning is in degrees, over every candidate — not in pixels, over the ones
on screen.** A count of labels filled from the whole ranked list makes what is
named depend on where the view points: a better-ranked summit scrolling in at one
edge takes the name off a summit in the middle, and a pan is a steady flicker of
names going out for no visible reason. Against degrees the answer holds still, and
labels only come and go at the edges. The pitch is `pitchPx * degPerPx`, so the
zoom is still in it — magnifying spreads the skyline out, which is what reveals
more names with no new request.

**A name the layout then can't fit leaves a hole**, rather than the next
candidate taking its place. The count-based version backfilled — it walked the
ranked list until that many were *placed* — and that is exactly what cannot be
kept: whether a label finds air depends on screen positions, so which summit
backfills would depend on where the view points, and the flicker would be back
one level down. A vertically crowded skyline therefore shows slightly fewer
names than the pitch alone implies.

Four sliders under one **Peak names** menu, and every one of them acts on what
already arrived. Two cut: **Minimum dominance** says which summits count
(`DOMINANCE_STEPS_M`, a floor in metres) and **Number of names** says how many
of them fit (`labelLayoutLimits`, a level from 0 to `LABEL_DENSITY_MAX`). Two
order: the distance weight and the haze above. None of them narrows the request
— the service is always asked for everything it will name, because a narrower
ask can only take candidates away and would cost a whole render to change, while
a filter over the labels in hand is instant.

**That is also why they are all here and not in the settings modal.** The line
is not how often a control is used but what it costs: the toolbar carries what
rearranges the picture already in hand, the modal carries what has to be asked
for again. Everything in `PanoramaSettingsModal` is a request parameter, and the
Save button stages a render for it; nothing in the toolbar's own menus does.
Quality and the vertical view are the two deliberate exceptions — they *are*
request parameters, but they are how a view is framed while looking at it, so
burying them behind a modal would cost more than the rule is worth.

**The haze also cuts, at three times its distance** (`hazeCutoffM`, beside
`labelRank` so one module owns both halves of what the haze does). As a
weighting alone it can only demote, and the thinning keeps the best name per
stretch of horizon — so a giant 200 km off, alone in its stretch with nothing
near to lose to, is named however far its rank has fallen. That is the one case
where the name is certainly wrong: it is pointing at empty sky. A tail cut on
the same slider closes it without a second control, and it is what the setting's
own prose already claimed ("by two or three times this…"). Note it does not bite
at the default: 120 km × 3 is past the 300 km the picture holds unless the
account has premium and asks for more.

**The service has no peak-distance cut** — peaks come back filtered only by
visibility and `min_dominance`, then cut to `max_peaks`, and no list is sent to
it (the peaks are its own `--peaks` GeoPackage). Its `range` looks like the same
thing and is not: it bounds the terrain the render *sees* — a setting of its own
under "Quality", not a way to thin names — so narrowing it to drop a name would take the
ridge out of the picture too, and cost a whole render. Hence a client-side
filter.

The other two read alike but cut differently, which is why they share a menu rather than
being merged: thinning by the pitch keeps whatever ranks highest in each stretch
of horizon, and the rank weighs distance, so it favours the near field; the
dominance floor keeps the summits that stand clear however far off they are. "Every big peak, as many as
fit" needs both, and neither slider reaches it alone. The toggle says where the
count stands and adds the floor beside it only while that is filtering, so the
button stays one word for anyone who never touches it.

The density level moves **both** limits `labelLayoutLimits` returns — the stretch
of horizon one name may claim, and how far it may climb to find room — because either
alone is the one that binds and the other then does nothing. The busiest step has no
width at all: what the picture will physically hold is what asking for the most
ought to mean, leaving collision and the climb as the only limits. A rich view offers far more
peaks than fit on one line — the better part of a thousand from a Tatra summit
over the full turn — so what really decides the count is how many lines they may
stack into; raising the cap alone changes nothing while the climb is exhausted
first.

The request asks for **everything the service will name**: a `min_dominance`
below any real terrain, capped at `max_peaks: 5000` as a bound on the payload
rather than on what is drawn. Its own default of 30 m would be a heavy cut, and
against a signed figure a floor of `0` would cut the near field entirely.
Thinning belongs here, where a change is instant.

**The cap is bandwidth, not server load.** The service truncates before
serializing, so raising it costs it only the gzip of what it keeps — a
millisecond or so — and the reader 248 B a peak, 59 B of it on the wire once
the vhost's `gzip` has had it. A rich Alpine view answers with 2665 peaks, and
the whole response, picture included, lands in 236 KB. Hence 5000 rather than a
tight number: the cap binds only where a view really holds that many, and there
it now costs a few hundred kilobytes rather than the megabyte and a half it
would have before the service rounded its numbers and nginx started compressing
them.

What the cut drops is decided by the service's own label rank, whose distance
exponent we send as `peak_rank_power` — the viewer's `labelDistanceWeight`. The
two orders are not identical, since ours also carries a haze term and the
revealed penalty and the service's does not; sending it narrows the gap where
the cap binds, which is the only place either order matters. That parameter is
**not** in `panoramaRenderKey`: it changes which peaks are sent, not what is
drawn, and the slider it comes from is one of the instant ones, so the next
render for any other reason picks it up.

Sorting by raw dominance was the old behaviour (`peak_rank_power: 0`) and it
truncated the wrong end — from an Ötztal viewpoint a summit 2.1 km away was cut
while distant massifs filled the payload, unrecoverable client-side. The
service's `revealed_peaks` flag is a similar trap avoided: it would free cut
slots when the revealed names are switched off, but the switch is instant and
the payload is not, so checking it back on would show nothing until the next
render. That filter stays client-side.

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
tooltip, and a readout floating in the picture's top-right corner says it under
the viewpoint's own elevation.

Three because each covers where the other two aren't: the readout is the only
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

## Round to a toposcope

The toolbar's compass-rose button turns the picture into a
[toposcope](../src/features/toposcope/): `panoramaToposcopeProcessor` stands the
dial's centre on the render's viewpoint (`makeToposcopeCenter`, or the existing
centre moved rather than a second one appearing) and adds one drawn point per
named summit, then opens the tool. Both panels float, so neither closes the
other.

A converted summit is an ordinary drawing point — `poi:peak`, `props.name` and
`props.ele`, label `{p:name}` — because the dial has no store of its own: its
rays *are* the drawn points, and its default templates then read the name over
the elevation and distance with nothing typed in. The point is what carries the
conversion into a saved map, a URL and a GeoJSON export.

**The rays are worked out from the render, never read off the screen.** The
viewer's own `named` set was the obvious source and is the wrong one: it is
thinned in pixels, so zooming in names more of the skyline and pressing the
button at a different magnification would give a different dial. The processor
runs the same filters (`candidateLabels`) over `render.labels` and thins by a
pitch of its own — the density setting read at `REFERENCE_DEG_PER_PX`, the
picture at its natural framing, with `DIAL_MIN_PITCH_DEG` under it. So the
peak-name sliders still say how busy the dial is, and nothing else does.

The floor carries **both** ends of that slider, where `labelLayoutLimits` sets no
pitch: the busiest step, which asks for all the picture holds, and "none", which
turns names off in the picture — not an answer to a button pressed for a dial of
them. It caps the dial at 72 rays.

**Every point goes in one `drawingPointSetAll`.** Adding them one at a time
pushes a history entry per summit — a `point=` param is a content change, and
`urlProcessor` never holds a push back — which WebKit refuses past a hundred in
ten seconds.

**Whether the drawing already on the map is kept is the user's answer, not a
rule.** A map with drawn points on it asks (`useConfirmChoice`, the shape
`MyMapsModalList` uses for the same question) and the choice rides in the
action's `replace`. Appending leaves a summit already standing within
`placeKey`'s five decimals alone, so appending twice from one picture doesn't
double every ray; replacing takes every drawn point away, and the selection with
them where it named one.

An existing centre **moves** to the new viewpoint under either answer — a dial
centred anywhere else would measure the new summits from a place the picture was
not taken from — so the dialog says so: it re-aims rays that were already there,
which "append" alone would not lead anyone to expect.

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
- **An unfolded picture is a drawing.** Said only while the lift is set, since
  without one the picture keeps the promise this takes back: a dashed-leader
  peak is really behind a ridge, and a distance read off the depth buffer no
  longer implies a line of sight.

Attribution credits every model the pyramid can answer from — the same set the
elevation API credits (`ELEVATION_API_DTM_ATTRIBUTION`) plus `GEDTM30_ATTR` —
since the service names none per render and a 300 km view crosses borders.

## Not done yet

- Narrow-`fov` re-render for real optical zoom past the image's own pixels;
  the service says it is proportionally cheap.
- Entry from a selected peak, and the toposcope's own way back to a panorama.
- Sun path — the service hasn't implemented it either.
