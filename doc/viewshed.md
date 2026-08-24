# Viewshed overlay

What can be seen from one point on the map, rendered by the terrain service at
`https://terrain.freemap.sk` and drawn by `src/features/viewshed/`.

## The service

`POST /viewshed` returns `multipart/form-data`: a JSON `meta` part and an image
part — a square RGBA raster in Web Mercator, centred on the viewpoint and
transparent where nothing is visible. The full wire contract is the service's
own `docs/API.md` (in the `dem-pyramid` repo); what matters on this side:

- **`meta.bounds` is `[west, south, east, north]`**, which is what a Leaflet
  `ImageOverlay` wants. Leaflet stretches the image between the two corners in
  projected space, which is exactly how the service drew it.
- **`radius` and `scale` are validated together** — the raster is
  `2 × radius / scale` on a side, and the pair must come to no more than 96 M
  pixels (9797 a side). `radius` itself reaches 300 km.

  **The tiers are set from the data, not from that cap.** The pyramid's finest
  level is 6.27 m over LiDAR and 30 m elsewhere, and the marcher steps by cell,
  so a finer raster is pixels carrying no information at quadratic cost — and
  the cost that bites is the payload, since near terrain at full resolution is
  all edges and edges do not compress (the service measures 9 MB for a 96 Mpx
  render). So each tier in `VIEWSHED_DETAILS` carries **a resolution and a pixel
  budget**, and `viewshedScale` takes the coarser of the two, never finer than
  the data and never so coarse that a short range draws a few dozen pixels.
- **Opacity is the projected area** of each patch of ground, not a flat stencil:
  a slope facing you is solid, one seen edge-on fades out. Most of a wide
  viewshed is distant, gently sloping ground and lands at 0.05–0.15, which the
  layer's own opacity cannot lift — the faintness is in the pixels. That is what
  `gamma` is for (`alpha ** (1/gamma)`, the Strength slider, default 2): a curve
  rather than a gain, since any multiplier big enough to rescue the far field
  drives the near field solid and throws the gradation away. `alpha_floor` is
  the blunt version — at 1 the overlay is a plain stencil. Neither can make
  hidden ground appear, so transparent still means exactly "not visible".
- **It is bare earth**, and only as good as the DEM behind it — 1 m LiDAR in the
  surveyed countries, 30 m GEDTM30 elsewhere.
- **The eye must be on the summit, not near it.** A viewshed is far more
  sensitive to the exact viewpoint than a panorama: from Gerlach's nominal
  coordinates the DEM reads 78 m below the true top and loses whole quadrants.
  Hence the wider `eye_search_radius` in `buildViewshedRequest`.

Everything about talking to the service — the bearer token, the `X-Job` progress
token and its `EventSource`, and what a failure means — is
`src/shared/terrainService.ts`, shared with the panorama; see `doc/panorama.md`
for the CORS the vhost has to answer with. The renders share one queue, so a
viewshed can wait behind a panorama and says so.

## A layer, not a tool

The overlay is in the layer registry (`v`, `technology: 'viewshed'`) and reaches
the map through `Layers.tsx` like any other. What it is *of* lives in the
feature's own slices, the way the weather radar's does:

- `viewshed` — the viewpoint, the render in flight and the finished
  `ViewshedRenderInfo`. The image itself is an object URL, so it lives in
  `renderHolder.ts`, which also holds the claim a render checks before it
  installs anything.
- `model/selectors.ts` — the grants premium allows and whether the overlay is
  still of what the controls say. Derived in one place, so the request, the
  toolbar, the layer and the link cannot disagree.
- `viewshedSettings` — range, detail, eye, target height, colour, strength and
  minimum opacity; persisted. The colour inks the eye marker and the staged
  circle as well as the wash, so pin and picture read as one thing — the
  panorama's marks follow its own `groundColor` the same way.

`ViewshedMenu` is its toolbar, gated on the layer being on and collapsible like
the radar's. Turning the layer on with nowhere to look from raises the picking
mode (`viewshedLayerProcessor`), which is what makes the first render an
explicit act.

## What premium grants

Distance and detail, the two settings that decide what a render costs: without
premium the range is held at `FREE_RADIUS_MAX_KM` (20 km) and the tier at
`FREE_DETAIL` (the coarsest). **The service clamps neither**, so `grantedViewshed`
in `request.ts` is the only thing keeping the request honest — everything that
speaks about what is on the map (the request, the render key, the circle, the
wait estimate, both dropdowns) reads the granted figures rather than the stored
ones, or it would claim a picture nobody rendered.

The locked options stay in the menus wearing a `PremiumGem`; picking one opens
the purchase flow instead of storing a choice the next render would clamp away.
The stored choice is kept either way, so premium grants it back silently.

## The render is an explicit act

A render is seconds of a server that runs one at a time, so:

- **Nothing renders on map movement.** Only `viewshedPick` — the click that says
  where to stand, the GPS fix, or a link's `viewshed=` — and the toolbar's
  Update button.
- **Dragging the eye stages a place** (`viewshedMoveViewpoint`); so does every
  setting. Whether what's on the map still answers for the controls is
  **derived**: `viewshedRenderKey(viewpoint, settings)` is stored on the render
  and compared against the current one, so nothing has to set a dirty flag. The
  dashed circle appears exactly while they disagree.
- **A new render aborts the one in flight** rather than queueing behind it —
  `CANCEL` in `renderHandler.ts`. The layer going is one of its triggers,
  whichever way it went.

## The link

`viewshed=lat,lon,radiusKm`, written only while the layer is on — the layer
itself rides in `layers=`, so a link that carries one carries the other. The
image is not in the link: arriving with a viewpoint renders it again. A radius
that arrives on its own is staged, not rendered; only the viewpoint pays.
