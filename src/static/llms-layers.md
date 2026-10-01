## Map Layers

Freemap provides numerous raster, vector, and WMS map layers with different content, coverage, and zoom levels.
Each layer includes attributes describing its purpose, availability, and data sources.
The map-layer switching toolbar is available at the middle bottom of the screen.
Featured or user-configured maps are directly accessible as buttons in this toolbar.
A map that cannot be shown where the view currently is stays listed rather than disappearing, marked with a button that puts it right: a magnifier when the view is zoomed out past the map's minimum zoom, a globe when the view is away from the map's area, and a magnifier-with-marker when both — pressing it switches the map on and moves the view to where the map draws. Custom maps and offline maps are each listed in alphabetical order, after the built-in ones.

The toolbar also contains the following buttons:

- zoom in (keyboard shortcut: <kbd>+</kbd>)
- zoom out (keyboard shortcut: <kbd>-</kbd>)
- find me (locate me by the browser's geolocation API)
- toggle fullscreen (not shown in the installed app, which has no browser chrome to escape, nor on iOS, whose Safari has no fullscreen to enter)
- manage maps (last; a gear opening the "Manage maps" menu described below, hidden while a photo position or a map area is being picked, and never present in an embedded map)

**Find me** cycles through three states: off; on with the map following the position (the button is highlighted); and on without following, once the map has been moved by hand (the button stays pressed but loses the highlight). Pressing it in that third state brings the map back to the position and resumes following rather than switching locating off — only a press while following turns it off.

While waiting for the first fix the button shows a spinner in place of its icon. A refused permission switches locating off with a brief warning. If the device is still searching after half a minute, the spinner stays and a warning says there is no signal yet; if it cannot determine a position at all, the spinner gives way to a warning. Either way locating stays on, so a fix arriving later is still taken.

On a touch screen the map also zooms with one finger: double-tap, keep the second tap down and drag — down zooms in, up zooms out, about the place tapped, so it can be worked with the thumb of the hand holding the phone. A plain double-tap still zooms a level in as it always did.

The map is also moved with the keyboard, without having to click it first: <kbd>+</kbd> and <kbd>-</kbd> zoom a level at a time, and the arrow keys pan, holding <kbd>shift</kbd> for a triple step. Zooming keeps the map following the located position, while panning with the arrows ends the following — as do dragging, a two-finger touch, and zooming toward a point with the wheel or a double click. The one-finger zoom ends it too, being aimed at a point like the rest.

The located position is drawn as a dot with an accuracy circle, plus a direction beam that widens as the heading gets less certain. Its source is chosen by the **Direction indicator** preference (see Map preferences below): *Hidden*, *Direction of travel* (GPS course, shown only while moving), or *Device compass* (also works standing still; offered only on devices with orientation sensors). The compass is the default wherever it needs no permission; on iOS, which prompts for it, the default is direction of travel. The whole display fades as its fix ages, so a lost signal stops reading as a live position: it stays solid for the first 20 seconds, dims until the fix is two minutes old, and then remains as a faint last-known position rather than disappearing.

With the **Distance and bearing** preference on (the default), panning the map away from the located position also draws a crosshair in the middle of the map and a dotted line from it to the position, with the distance and the bearing from the located position to the middle of the map — the heading to walk to reach what is being looked at — shown above the crosshair (for example "326 m · 226°"). The line and the readout fade with the age of the fix like the rest of the located display; the crosshair does not, since it marks the middle of the screen rather than anything the GPS reported. It appears only once the map is far enough off the position for the line to say anything, so it stays out of the way while the map follows the position.

There is also a button with three vertical dots that opens a menu listing additional maps, a "Filter maps" box, and a "Show all maps" item.

### Manage maps

- Access: Manage maps button (the gear in the map toolbar)

A menu of six items, each opening its own modal, in three groups: **Layers configuration**, which lists every map — built-in, custom and cached alike; then the three that add maps or keep copies of them, **Custom maps** (suffixed with the number of custom maps and map combinations), **Offline maps** (suffixed with the total cache size) and **Cache while browsing**; then **Map preferences** and **Elevation preferences**.

#### Layers configuration

- Keyboard shortcut: <kbd>m</kbd> <kbd>y</kbd>
- URL path: `/#show=map-layers-config` (legacy `/#show=map-settings` still works)

A table of every map — built-in, custom and cached alike. A built-in map can be uninstalled (the plug column): it is then left out of the toolbar, the menu (even under **Show all**), its keyboard shortcut, the search box and the offline-map and export pickers, while a link naming it in `layers=` still shows it and the menu lists it for as long as it is on. For each layer the user can toggle: show in toolbar, show in menu, overlay opacity (overlays only, and hidden while an active map combination sets it), and a keyboard shortcut (a 🚫 marker indicates that no shortcut can be assigned).

#### Custom maps

- Keyboard shortcut: <kbd>m</kbd> <kbd>c</kbd>
- URL path: `/#show=custom-maps`

Manage user-defined map layers — a list with edit/delete actions and an **Add custom map** button. Each custom map has:

- name
- icon, picked from the same icon set the drawing points use (Font Awesome and the OSM POI icons); the map type's icon is used when none is picked
- type (technology): Image tiles (TMS, XYZ), Vector (MapLibre), WMS, Parametric shading, or Color
- URL (tile template for TMS/XYZ, server URL for WMS, or style URL for MapLibre; a Parametric shading map has none)
- for Parametric shading: the terrain comes from the built-in Parametric terrain shading layer (`h`), whose tiles, zoom range, premium limit and credits it takes, and it is rendered wherever the shading panel says (in the browser or on the server). The map keeps shading settings of its own, set live in the shading panel on the map and saved there; the built-in shading layer and custom shading maps without their own share one set, which is what `shading=` in the URL carries. So a shading map can be a base map, whose background colour is always opaque — white where it has none — (as an overlay the background is optional: **Remove** takes it off while it is selected, and **Add** puts it back), and two shading maps can show at once with different settings
- for Color: one colour all over — a blank base map to lay overlays on (always opaque), or a tint as an overlay (with alpha); it needs no network. Its layer field comes before the colour, and switching to base drops the colour's alpha
- min zoom / max native zoom (for a WMS the latter caps the requested image resolution instead of the zoom drawn at)
- extra resolutions and "scale with DPI" (not for WMS or Parametric shading, which always match the display density)
- for WMS: "load in tiles" — off by default, since a WMS is asked for one GetMap covering the whole view per pan/zoom; switch it on for a server that limits image size or caches tiles (premium-gated zooms use tiles either way)
- layer: base or overlay, with the z-index beside it for an overlay (an overlay is always drawn above the base map, whatever its z-index)
- show in toolbar / show in menu

When several shading layers are on, the shading panel has a picker for which one it edits: the shared settings of the built-in layers, or a custom shading map's own. Edits to a custom map's shading show at once but are kept only when **Save** in the panel is pressed; **Revert** drops them. For the shared settings the panel instead offers **Save as custom map**, opening the form for a new shading map with those settings.

The panel is headed **Parametric terrain shading** and collapses to that heading. Below the heading, **On server** / **In browser** chooses where every shading layer is rendered; the choice is remembered, and **On server** is the default. In the browser (experimental; WebGPU, disabled without it) edits show as they are made. On the server tiles arrive as finished WebP images: edits to the shared settings show only after **Apply**, and **Revert** drops them — both stay in place, disabled while there is nothing to apply — and a custom map shows only its saved shading.

The panel lists the shading's layers (hillshade, slope, colour relief, aspect, and a background), with **Add** and **Remove**; Add also offers **Contour** and **Fog / inversion**, colour reliefs built from an elevation. A **Presets** button beside them replaces the whole shading with a ready-made one — cartographic (Classic, Freemap outdoor, Shadow only, Multidirectional, Embossed, Swiss style, Steepness, Hypsometric tints + shading, Lowland tints + shading, Aspect + slope) or artistic (Sepia, Night, Moonlight, Golden hour, Glacier, Mars, Ink drawing, Blueprint, Neon, Watercolour, Autumn) — asking first when the shading is not already a preset. For the shared settings it applies at once, without **Apply**; on a custom map it is an edit like any other, kept by **Save**. A dial sets the light's azimuth and elevation for the hillshade and slope layers by dragging their handles. Below it, a collapsed **Parameters** section holds the selected layer's azimuth and elevation as numbers, and its **Height exaggeration**, **Contrast** and **Brightness** as sliders with a typed value beside each; the typed value can go past the slider's range. Contrast and brightness go into `shading=` only when they differ from 1 and 0.

The same list holds **map combinations** — **Map combination** is the last type in the custom-map form, and switching the type keeps the name and icon. A combination is a saved set of at least two layers: overlays, each with its own opacity, and — with **Layer: Base** — a base map; with **Layer: Overlay** it has none and lays over any base map. Its opacities apply to its own layers while it is active; shading comes from the shading maps it lists. One with a base map acts as a base map: it is listed among them with a radio, activating it replaces the overlays that were on (except those of active overlay-only combinations), and it stays active — whatever layers are switched on or off meanwhile — until a base map is picked from the menu or toolbar (even its own), which takes its overlays off and keeps any added since; picking it again restores its set. One without a base map acts as an overlay: listed among them with a checkbox, ticking adds its layers and unticking takes them off, and several can be on at once. A combination is active only when picked as such — it is then named in `layers=` as `_<id>` beside its layers, so a link carries it to another browser signed into the same account — and selecting the same layers by hand does not activate it. A new combination's form starts from the layers on the map; an existing one's row has **Update from current map**. Combinations can sit in the toolbar, take a keyboard shortcut in Layers configuration, and are found by name in the search box.

#### Map preferences

- Keyboard shortcut: <kbd>m</kbd> <kbd>p</kbd>
- URL path: `/#show=map-preferences`

- **Max zoom** — global maximum zoom level
- **Zoom step** — the smallest zoom change scroll-wheel, pinch, box zoom and the one-finger double-tap drag can settle on: `1` (whole zoom levels, the default), `½`, `¼`, or *Free* (no snapping at all). The <kbd>+</kbd>/<kbd>−</kbd> buttons and keys always go to the next whole level whatever this says
- **Resolution scale** — simulates display pixel density and affects which tile variant is fetched (Auto by default)
- **Feature size** — enlarges rendered labels and lines (no effect on satellite, shading, WMS, or vector (MapLibre) layers)
- **Direction indicator** — source of the direction beam on the located position: *Hidden*, *Direction of travel* (GPS course over ground, visible only while moving) or *Device compass* (magnetometer, works standing still, offered only where orientation sensors exist). Defaults to the compass except on iOS, where enabling it costs a permission prompt, so direction of travel is the default there
- **Distance and bearing** — while locating, draws a line between the located position and a crosshair in the middle of the map, labelled with the distance and the bearing from the position to the crosshair; visible only once the map is panned away from that position. On by default
- **Reset to default** — fills this modal's fields (max zoom, zoom step, resolution scale, feature size, direction indicator, distance and bearing) with their defaults; apply with Save or close without saving

#### Elevation preferences

- Access: Manage maps button > Elevation preferences, or the gear in the elevation profile's toolbar
- Keyboard shortcut: <kbd>m</kbd> <kbd>e</kbd>
- URL path: `/#show=elevation-settings`

- **Remove spikes** — a slider, 0–100 m, default 25 m. Where a way is drawn a few metres off the road it describes, the terrain model answers with the bank or rock face beside it; a running median drops excursions narrower than half this window, up or down, and keeps anything wider as real terrain, followed by a light average that rounds off the steps a median leaves. Zero switches it off
- **Fill terrain-model ditches** — a slider, 0–100 m, default 25 m. The detailed national terrain models (available in some countries) are usually adjusted for hydrology and dig a ditch through the road at every culvert; dips narrower than this are filled in the elevation profile and its climb/descent totals, while wider ones are kept as real terrain. Zero switches it off, and it changes nothing where the global model is used. Bridges and tunnels a route crosses are levelled separately, from the router's own data, and are unaffected by this setting
- **Steepness window** — a slider, 0–200 m plus a final "whole line" notch, default 50 m. The steepness reported at the place pointed at on the elevation profile is averaged over a stretch this long around it, so a couple of metres of GPS noise don't read as a wall. The window is centred on that place itself, so on a track whose points are far apart it still describes the stretch under the pointer rather than whatever surrounds the nearest point. Zero measures across just the segment the place stands on; "whole line" measures across the entire line at once, so the readout is the same everywhere on it and reports the rise over the line's whole length — on a straight measuring line that is the angle one end is seen at from the other, useful for sightlines (which ridge hides a summit or a sunset). Unlike the two sliders above it corrects nothing, so it changes no profile, only that readout

Which terrain model answers is not a setting: premium reads get the detailed national models where they exist and GEDTM30 past their borders, everyone else gets SRTM everywhere, for profiles and exports alike.

The first two sliders correct a terrain model, so they apply wherever elevation is read from one — planned routes, drawn lines and measurements, and imported tracks whose elevation was replaced from the server — and never to recorded altitude (live tracking, or a track kept as recorded).

Modals that edit a persisted default style or settings (Map preferences, Elevation preferences, Layers configuration, drawing **Default properties**, objects **Marker style**, track-viewer **Default style**, **Lookup style**) also carry a **Reset to default** button that refills the form with default values (applied with Save, not immediately).

### Maps

Pre-defined map layers.

#### Field description

- **name** (human-friendly; as shown in the UI)
- **id** (internal type code; used in the `layers=` URL param)
- **layer** (base | overlay) — overlays are drawn on top of a base layer
- **technology** (tile | maplibre | wms | parametricShading | gallery | wikipedia | interactive | radar)
- **minZ / maxNativeZ** (minimum usable zoom / maximum native tile zoom; above maxNativeZ tiles are upscaled)
- **premiumFromZ** (zoom level from which premium access is required, if any)
- **creditsPerMTile** (offline-export price in credits per million tiles, if applicable)
- **supersededBy** (id of the replacement layer, for legacy layers)
- **shortcut** (keyboard shortcut to toggle the layer, if any; ⇧ = Shift)
- **countries** (ISO 3166-1 alpha-2 codes the layer covers; blank = worldwide / not restricted)
- **notes** (attribution, experimental status, coverage quirks)

#### Layer registry

Mirrors `src/shared/mapDefinitions.tsx`. A blank cell means the field is not set in the definition (worldwide / default / not applicable). ⇧ denotes Shift.

**Base layers**

| name                         | id  | technology        | minZ | maxNativeZ | premiumFromZ | creditsPerMTile | supersededBy | shortcut | countries    | notes                                                  |
| ---------------------------- | --- | ----------------- | ---: | ---------: | -----------: | --------------: | ------------ | -------- | ------------ | ------------------------------------------------------ |
| Outdoor                      | X   | tile              |    5 |         20 |           19 |            5000 |              | x        | Europe (~46) | © Freemap, OSM; multi-source national elevation/relief, GEDTM30 elsewhere |
| KST Hiking Trails            | XK  | tile              |    5 |         20 |              |                 |              |          | sk           | Outdoor map showing only official KST hiking routes; © Freemap, OSM; multi-source national elevation/relief |
| OpenStreetMap                | O   | tile              |    0 |         19 |              |                 |              | o        |              | © OpenStreetMap                                        |
| Aerial                       | S   | tile              |    0 |      19/20 |           20 |            1000 |              | s        |              | © Esri worldwide; in SK and CZ the sharper national orthophoto (to zoom 20, © GKÚ, NLC; © ČÚZK) is drawn over it; premium applies to the orthophoto only, and the offline export exports only the orthophoto, so SK and CZ |
| Aerial (2017–2019)           | J1  | tile              |    0 |         19 |              |            1000 | S            |          | sk           | © GKÚ, NLC (legacy mosaic)                              |
| Aerial (2020–2022)           | J2  | tile              |    0 |         19 |              |            1000 | S            |          | sk           | © GKÚ, NLC (legacy mosaic)                              |
| Public transport (ÖPNV)      | d   | tile              |    0 |         18 |              |                 |              | q        |              | © MeMoMaps, OSM                                        |
| Detailed terrain shading     | 7   | tile              |    0 |         20 |           15 |            1000 |              | h        | sk           | © Freemap; LLS DMR © ÚGKK SR                            |
| Surface shading              | 6   | tile              |    0 |         18 |              |            1000 |              |          | sk           | © Freemap; DMP 1.0 © ÚGKK SR                            |
| OpenStreetMap Vector         | VO  | maplibre          |      |            |              |                 |              |          |              | OSM data; MapTiler                                     |
| Streets Vector               | VS  | maplibre          |      |            |              |                 |              |          |              | OSM data; MapTiler                                     |
| Dataviz Vector               | VD  | maplibre          |      |            |              |                 |              |          |              | OSM data; MapTiler                                     |
| Outdoor Vector               | VT  | maplibre          |      |            |              |                 |              |          |              | OSM data; MapTiler                                     |
| Cadastre                     | WKA | wms               |      |            |           15 |                 |              | k        | sk           | © GKÚ                                                   |
| Tree Composition             | WDZ | wms               |   13 |            |           15 |                 |              |          | sk           | © NLC Zvolen                                            |
| Forest Types                 | WLT | wms               |   12 |            |           15 |                 |              |          | sk           | © NLC Zvolen                                            |
| Geological                   | WGE | wms               |      |            |           15 |                 |              | l        | sk           | © ŠGÚDŠ                                                 |
| Hydrochemic                  | WHC | wms               |      |            |           15 |                 |              | w        | sk           | © ŠGÚDŠ                                                 |

**Overlay layers**

| name                       | id  | technology        | minZ | maxNativeZ | premiumFromZ | creditsPerMTile | supersededBy | shortcut | countries | notes                                                      |
| -------------------------- | --- | ----------------- | ---: | ---------: | -----------: | --------------: | ------------ | -------- | --------- | ---------------------------------------------------------- |
| Data layer                 | i   | interactive       |      |            |              |                 |              | ⇧d       |           | Interactive items of all tools (drawing, route, search, …) |
| Photos                     | I   | gallery           |   10 |            |              |                 |              | ⇧f       |           | Own Creative-Commons photos (CC BY-SA 4.0 default; premium-only option) **and** geotagged Wikimedia Commons photos, in one layer; both shown from zoom 10 |
| Wikipedia                  | w   | wikipedia         |    8 |            |              |                 |              | ⇧w       |           | Wikipedia                                                  |
| Weather radar              | R   | radar             |      |          9 |              |                 |              | ⇧r       |           | Animated precipitation radar. Premium: up to 6 h of history plus a 1-hour forecast; otherwise 2 h and no forecast. Data © EUMETNET OPERA — over Italy CC BY-SA 4.0 © Radar-DPC |
| Viewshed                   | v   | viewshed          |      |            |              |                 |              | ⇧v       |           | What can be seen from one chosen point, computed on the server from the terrain model (© Freemap; national LiDAR models, GEDTM30 elsewhere). Premium: further than 20 km, and detail past what the free pixel budget buys at the chosen range (a short viewshed already earns finer tiers) |
| Hiking difficulty          | xs  | tile              |   12 |         20 |           19 |                 |              |          | Europe    | SAC scale of paths as dots, green (easy) to red (hard); transparent. © Freemap, OSM |
| Road smoothness            | xq  | tile              |   12 |         20 |           19 |                 |              |          | Europe    | OSM `smoothness` of roads as dots on an 8-step ramp; transparent. © Freemap, OSM |
| MTB difficulty             | xm  | tile              |   12 |         20 |           19 |                 |              |          | Europe    | OSM `mtb:scale` (S0–S6) of paths as dots; transparent. © Freemap, OSM |
| Hiking trails              | xh  | tile              |    9 |         20 |           19 |                 |              |          | Europe    | Hiking routes, plus guideposts and route markers from zoom 13; transparent. © Freemap, OSM |
| Bicycle trails             | xb  | tile              |    9 |         20 |           19 |                 |              |          | Europe    | Bicycle routes; transparent. © Freemap, OSM                |
| Ski trails                 | xl  | tile              |    9 |         20 |           19 |                 |              |          | Europe    | Ski routes; transparent. © Freemap, OSM                    |
| Horse trails               | xr  | tile              |    9 |         20 |           19 |                 |              |          | Europe    | Horse-riding routes; transparent. © Freemap, OSM           |
| Outdoor map without base   | xa  | tile              |    5 |         20 |           19 |                 |              |          | Europe    | The outdoor map minus what an aerial image already shows (relief, contours, land cover, water, buildings, trees), for laying over an aerial map or a shading layer (Parametric terrain shading, Detailed terrain shading). © Freemap, OSM |
| Forest tracks NLC (2017)   | l1  | tile              |   11 |         15 |              |            1000 | l2           |          | sk        | © NLC Zvolen (legacy)                                      |
| Forest tracks NLC          | l2  | maplibre          |    9 |            |              |                 |              | ⇧n       | sk        | © NLC Zvolen                                               |
| Parametric terrain shading | h   | parametricShading |      |         18 |           15 |                 |              | ⇧h       |           | Shaded with the shading panel's settings, on the server or in the browser; national terrain models (so far SK, CZ, AT, CH, SI, PL, IT) and the 30 m GEDTM30 elsewhere in Europe, each credited when the tiles on screen use it; © Freemap |
| Cadastre                   | wka | wms               |      |            |           15 |                 |              | ⇧k       | sk        | © GKÚ (cadastre over aerial)                               |

Notes:

- The `i` (Data layer) overlay hosts every tool's interactive features; hiding it hides those features without disabling the tools.
- The `X` "Outdoor" base map renders hiking, bicycle, ski and riding trails together. The `xh`, `xb`, `xl` and `xr` overlays carry each activity's trails alone, and `xs`, `xm` and `xq` the grades, transparent, for laying over another base map such as aerial imagery or OpenStreetMap. `xa` is the whole Outdoor map without its own ground, for an aerial map or a shading layer beneath.
- The `v` (Viewshed) overlay is not a map of anything until a point is chosen: turning it on asks where you stand, and the answer starts a render that takes seconds on the server. Its own toolbar sets the range (5–300 km; a link or a stored setting naming a radius between the stops — an older one written when 1–3 km were offered — is snapped to the nearest stop rather than dropped) and the quality tier, each tier showing the ground a pixel covers at the current range, and behind a cog a settings modal (`/#show=viewshed-settings`) with the eye and target heights (typed in metres), the colour, the strength and the minimum opacity; it offers Update whenever the overlay is of other settings, and beside the eye button a ⋮ menu treats the viewpoint as a place like any other — the map context menu's whole list, and "Open in…". A circle around the viewpoint shows how far it looks, dashed while that is a promise about the next render. The viewpoint marker can be dragged, which stages a new place rather than rendering: the eye the overlay was actually drawn from stays behind faded, with its own range circle, until the next render catches up. Without premium the range is capped at 20 km and only the coarsest detail tier renders — the other options stay in the menus, marked with a gem that opens the purchase flow; the quality button's own label turns amber while the tier is clamped, saying so without the menu being opened (the panorama's does the same). The image's opacity is the projected area of each patch of ground, so a slope facing you reads solid and one seen edge-on fades; the strength slider curves that so it can be read at a glance, and the minimum opacity turns it into a stencil. It is bare earth — no trees, no buildings — and the link carries `viewshed=lat,lon,radiusKm`.
- The `R` (Weather radar) overlay is animated: turning it on opens its own toolbar with play/pause, frame stepping and a timeline. The timeline carries the same frames for everyone — the measured frames the server publishes plus a one-hour forecast — but only part of it can be opened without premium: premium reaches up to six hours back and can open the forecast, everyone else two hours and no forecast. The locked stretches are painted in the upsell colour at each end and offer premium when clicked. The only setting is whether the forecast frames are shown at all, which is itself premium.

##### Internal layer codes

The id values above are used in deep links via the `layers=` URL param: one base-layer code, optionally followed by `~` and the concatenated overlay codes (e.g. `layers=X~I` = Outdoor base + Photos overlay). Links with the removed ids `y` and `z` open `h` instead, the removed base maps `5` and `8` open `X` with `h`, and `Z` opens `S`. They are **advisory** for interpreting links and do **not** grant permission to scrape tiles or data; respect each layer's attribution and license.

Clicking a marker on the Wikipedia overlay opens a preview modal, addressable via the unified `show=` param: `/#show=wiki/<lang>:<title>`. Wikimedia Commons photos are part of the Photos layer and open in the gallery viewer like any other photo (legacy `/#show=wmc/<pageId>` and `/#wmc=<pageId>` links still resolve there).
