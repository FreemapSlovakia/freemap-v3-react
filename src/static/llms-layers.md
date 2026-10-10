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
- manage maps (last; a gear opening the menu described in [Manage maps](/llms-manage-maps.md), hidden while a photo position or a map area is being picked, and never present in an embedded map)

**Find me** cycles through three states: off; on with the map following the position (the button is highlighted); and on without following, once the map has been moved by hand (the button stays pressed but loses the highlight). Pressing it in that third state brings the map back to the position and resumes following rather than switching locating off — only a press while following turns it off.

While waiting for the first fix the button shows a spinner in place of its icon. A refused permission switches locating off with a brief warning. If the device is still searching after half a minute, the spinner stays and a warning says there is no signal yet; if it cannot determine a position at all, the spinner gives way to a warning. Either way locating stays on, so a fix arriving later is still taken.

On a touch screen the map also zooms with one finger: double-tap, keep the second tap down and drag — down zooms in, up zooms out, about the place tapped, so it can be worked with the thumb of the hand holding the phone. A plain double-tap still zooms a level in as it always did.

The map is also moved with the keyboard, without having to click it first: <kbd>+</kbd> and <kbd>-</kbd> zoom a level at a time, and the arrow keys pan, holding <kbd>shift</kbd> for a triple step. Zooming keeps the map following the located position, while panning with the arrows ends the following — as do dragging, a two-finger touch, and zooming toward a point with the wheel or a double click. The one-finger zoom ends it too, being aimed at a point like the rest.

The located position is drawn as a dot with an accuracy circle, plus a direction beam that widens as the heading gets less certain. Its source is chosen by the **Direction indicator** preference (see Map preferences in [Manage maps](/llms-manage-maps.md)): *Hidden*, *Direction of travel* (GPS course, shown only while moving), or *Device compass* (also works standing still; offered only on devices with orientation sensors). The compass is the default wherever it needs no permission; on iOS, which prompts for it, the default is direction of travel. The whole display fades as its fix ages, so a lost signal stops reading as a live position: it stays solid for the first 20 seconds, dims until the fix is two minutes old, and then remains as a faint last-known position rather than disappearing.

With the **Distance and bearing** preference on (the default), panning the map away from the located position also draws a crosshair in the middle of the map and a dotted line from it to the position, with the distance and the bearing from the located position to the middle of the map — the heading to walk to reach what is being looked at — shown above the crosshair (for example "326 m · 226°"). The line and the readout fade with the age of the fix like the rest of the located display; the crosshair does not, since it marks the middle of the screen rather than anything the GPS reported. It appears only once the map is far enough off the position for the line to say anything, so it stays out of the way while the map follows the position.

There is also a button with three vertical dots that opens a menu listing additional maps, a "Filter maps" box, and a "Show all maps" item.

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

Mirrors `src/shared/mapLibrary/mapIndex.tsx`. A blank cell means the field is not set in the definition (worldwide / default / not applicable). ⇧ denotes Shift. Public transport (ÖPNV) and the four Vector maps start uninstalled, as do on freemap.eu the maps whose only country is sk; they are added from **Available maps** (see [Manage maps](/llms-manage-maps.md)).

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
| Detailed terrain shading     | 7   | tile              |    0 |         20 |           15 |            1000 |              | ⇧h       | sk           | © Freemap; LLS DMR © ÚGKK SR                            |
| Surface shading              | 6   | tile              |    0 |         18 |              |            1000 |              |          | sk           | © Freemap; DMP 1.0 © ÚGKK SR                            |
| Parametric terrain shading   | h   | parametricShading |      |         18 |           15 |                 |              | h        |              | Shaded with the shading settings of its row in the Map layers panel, on the server or in the browser; national terrain models (so far SK, CZ, AT, CH, DE, NL, BE, LU, SI, HR, PL, IT, ES, FR, NO, FI, England and Wales) and the 30 m GEDTM30 elsewhere in Europe, each credited when the tiles on screen use it; © Freemap |
| OpenStreetMap Vector         | VO  | maplibre          |      |            |              |                 |              |          |              | OSM data; MapTiler                                     |
| Streets Vector               | VS  | maplibre          |      |            |              |                 |              |          |              | OSM data; MapTiler                                     |
| Dataviz Vector               | VD  | maplibre          |      |            |              |                 |              |          |              | OSM data; MapTiler                                     |
| Outdoor Vector               | VT  | maplibre          |      |            |              |                 |              |          |              | OSM data; MapTiler                                     |
| Cadastre                     | WKA | wms               |      |            |              |                 |              | k        | sk           | © GKÚ                                                   |
| Tree Composition             | WDZ | wms               |   13 |            |              |                 |              |          | sk           | © NLC Zvolen                                            |
| Forest Types                 | WLT | wms               |   12 |            |              |                 |              |          | sk           | © NLC Zvolen                                            |
| Geological                   | WGE | wms               |      |            |              |                 |              | l        | sk           | © ŠGÚDŠ                                                 |
| Hydrochemic                  | WHC | wms               |      |            |              |                 |              | w        | sk           | © ŠGÚDŠ                                                 |
| Solid colour                 | c   | color             |      |            |              |                 |              |          |              | One colour all over, set in the Map layers panel; a blank base map, or a tint as an overlay. Not in the menu by default |

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
| Cadastre                   | wka | wms               |      |            |              |                 |              | ⇧k       | sk        | © GKÚ (cadastre over aerial)                               |

Notes:

- The `i` (Data layer) overlay hosts every tool's interactive features. Turning it off (<kbd>shift</kbd> <kbd>d</kbd>, or its menu row or toolbar button) hides those features, to see the map under them, without disabling the tools; meanwhile its toolbar button and menu row show a crossed-out eye (on a narrow screen, the map menu's button does). With nothing on the map to hide, nothing is hidden, and removing the last feature shows them again. That lasts only until the page reloads: it is neither remembered nor written into links, and an `i` in an older link's `layers=` is ignored.
- The `X` "Outdoor" base map renders hiking, bicycle, ski and riding trails together. The `xh`, `xb`, `xl` and `xr` overlays carry each activity's trails alone, and `xs`, `xm` and `xq` the grades, transparent, for laying over another base map such as aerial imagery or OpenStreetMap. `xa` is the whole Outdoor map without its own ground, for an aerial map or a shading layer beneath.
- The `v` (Viewshed) overlay is not a map of anything until a point is chosen: turning it on asks where you stand, and the answer starts a render that takes seconds on the server. Its own toolbar sets the range (5–300 km; a link or a stored setting naming a radius between the stops — an older one written when 1–3 km were offered — is snapped to the nearest stop rather than dropped) and the quality tier, each tier showing the ground a pixel covers at the current range, and behind a cog a settings modal (`/#show=viewshed-settings`) with the eye and target heights (typed in metres), the colour, the strength and the minimum opacity; it offers Update whenever the overlay is of other settings, and beside the eye button a ⋮ menu treats the viewpoint as a place like any other — the map context menu's whole list, and "Open in…". A circle around the viewpoint shows how far it looks, dashed while that is a promise about the next render. The viewpoint marker can be dragged, which stages a new place rather than rendering: the eye the overlay was actually drawn from stays behind faded, with its own range circle, until the next render catches up. Without premium the range is capped at 20 km and only the coarsest detail tier renders — the other options stay in the menus, marked with a gem that opens the purchase flow; the quality button's own label turns amber while the tier is clamped, saying so without the menu being opened (the panorama's does the same). The image's opacity is the projected area of each patch of ground, so a slope facing you reads solid and one seen edge-on fades; the strength slider curves that so it can be read at a glance, and the minimum opacity turns it into a stencil. It is bare earth — no trees, no buildings — and the link carries `viewshed=lat,lon,radiusKm`.
- The `R` (Weather radar) overlay is animated: turning it on opens its own toolbar with play/pause, frame stepping and a timeline. The timeline carries the same frames for everyone — the measured frames the server publishes plus a one-hour forecast — but only part of it can be opened without premium: premium reaches up to six hours back and can open the forecast, everyone else two hours and no forecast. The locked stretches are painted in the upsell colour at each end and offer premium when clicked. The only setting is whether the forecast frames are shown at all, which is itself premium.

##### Internal layer codes

The id values above are used in deep links via the `layers=` URL param: one base-layer code, optionally followed by `~` and the concatenated overlay codes (e.g. `layers=X~I` = Outdoor base + Photos overlay). Links with the removed ids `y`, `z`, `5` and `8` open `h` instead, and `Z` opens `S`. They are **advisory** for interpreting links and do **not** grant permission to scrape tiles or data; respect each layer's attribution and license.

Clicking a marker on the Wikipedia overlay opens a preview modal, addressable via the unified `show=` param: `/#show=wiki/<lang>:<title>`. Wikimedia Commons photos are part of the Photos layer and open in the gallery viewer like any other photo (legacy `/#show=wmc/<pageId>` and `/#wmc=<pageId>` links still resolve there).
