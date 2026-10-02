## Manage maps

- Access: Manage maps button (the gear in the map toolbar, see [Map Layers](/llms-layers.md))

A menu of seven items, each opening its own modal, in three groups: **Layers configuration**, which lists the installed maps — built-in, custom and cached alike — and **Map library**, where maps are installed; then the three that add maps or keep copies of them, **Custom maps** (suffixed with the number of custom maps and map combinations), **Offline maps** (suffixed with the total cache size) and **Cache while browsing**; then **Map preferences** and **Elevation preferences**.

### Layers configuration

- Keyboard shortcut: <kbd>m</kbd> <kbd>y</kbd>
- URL path: `/#show=map-layers-config` (legacy `/#show=map-settings` still works)

A table of the installed library maps (see **Map library**) and of every custom and cached map. For each layer the user can toggle: show in toolbar, show in menu, overlay opacity (overlays only, and hidden while an active map combination sets it), and a keyboard shortcut (a 🚫 marker indicates that no shortcut can be assigned). **Reset to default** leaves what is installed alone.

### Map library

- Keyboard shortcut: <kbd>m</kbd> <kbd>i</kbd>
- URL path: `/#show=map-library`

The library holds the built-in maps and about 600 more — orthophotos, historic imagery and maps, elevation and other tile maps from around the world — taken from the OSM Editor Layer Index (credited at the bottom of the modal, CC BY-SA 3.0). Those are not installed until the user adds them; a link to one (`layers=<5-character id>~`) shows it all the same. Opens on the installed maps under a search box ("Search N maps"). Typing searches the whole library — by name, by country (code or name) and by the same keywords the search box knows — and lists the best 50 matches, with a count of the rest to refine the query by. Either list is split into **Base maps** and **Overlays**. Each row has a **+** (install) or red trash-can (uninstall) button, which takes effect at once, and an eye button that previews the map: the library steps aside, the map is switched on and, if the view is away from it, the view moves to it. The map can be panned and zoomed, but the rest of the interface is put away as while picking a place, and maps can't be switched. A toolbar then offers **Install** (for a map not installed), **Keep on map** (leaves it on and closes the library — a map can be used this way without installing it), **Back to library** (<kbd>Esc</kbd>) and **×**; the last two put back the layers that were on before. An uninstalled map is left out of the toolbar, the menu (even under **Show all**), its keyboard shortcut, the search box, Layers configuration and the offline-map and export pickers, while a link naming it in `layers=` still shows it and the menu lists it for as long as it is on. All built-in maps are installed by default.

### Custom maps

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

### Map preferences

- Keyboard shortcut: <kbd>m</kbd> <kbd>p</kbd>
- URL path: `/#show=map-preferences`

- **Max zoom** — global maximum zoom level
- **Zoom step** — the smallest zoom change scroll-wheel, pinch, box zoom and the one-finger double-tap drag can settle on: `1` (whole zoom levels, the default), `½`, `¼`, or *Free* (no snapping at all). The <kbd>+</kbd>/<kbd>−</kbd> buttons and keys always go to the next whole level whatever this says
- **Resolution scale** — simulates display pixel density and affects which tile variant is fetched (Auto by default)
- **Feature size** — enlarges rendered labels and lines (no effect on satellite, shading, WMS, or vector (MapLibre) layers)
- **Direction indicator** — source of the direction beam on the located position: *Hidden*, *Direction of travel* (GPS course over ground, visible only while moving) or *Device compass* (magnetometer, works standing still, offered only where orientation sensors exist). Defaults to the compass except on iOS, where enabling it costs a permission prompt, so direction of travel is the default there
- **Distance and bearing** — while locating, draws a line between the located position and a crosshair in the middle of the map, labelled with the distance and the bearing from the position to the crosshair; visible only once the map is panned away from that position. On by default
- **Reset to default** — fills this modal's fields (max zoom, zoom step, resolution scale, feature size, direction indicator, distance and bearing) with their defaults; apply with Save or close without saving

### Elevation preferences

- Access: Manage maps button > Elevation preferences, or the gear in the elevation profile's toolbar
- Keyboard shortcut: <kbd>m</kbd> <kbd>e</kbd>
- URL path: `/#show=elevation-settings`

- **Remove spikes** — a slider, 0–100 m, default 25 m. Where a way is drawn a few metres off the road it describes, the terrain model answers with the bank or rock face beside it; a running median drops excursions narrower than half this window, up or down, and keeps anything wider as real terrain, followed by a light average that rounds off the steps a median leaves. Zero switches it off
- **Fill terrain-model ditches** — a slider, 0–100 m, default 25 m. The detailed national terrain models (available in some countries) are usually adjusted for hydrology and dig a ditch through the road at every culvert; dips narrower than this are filled in the elevation profile and its climb/descent totals, while wider ones are kept as real terrain. Zero switches it off, and it changes nothing where the global model is used. Bridges and tunnels a route crosses are levelled separately, from the router's own data, and are unaffected by this setting
- **Steepness window** — a slider, 0–200 m plus a final "whole line" notch, default 50 m. The steepness reported at the place pointed at on the elevation profile is averaged over a stretch this long around it, so a couple of metres of GPS noise don't read as a wall. The window is centred on that place itself, so on a track whose points are far apart it still describes the stretch under the pointer rather than whatever surrounds the nearest point. Zero measures across just the segment the place stands on; "whole line" measures across the entire line at once, so the readout is the same everywhere on it and reports the rise over the line's whole length — on a straight measuring line that is the angle one end is seen at from the other, useful for sightlines (which ridge hides a summit or a sunset). Unlike the two sliders above it corrects nothing, so it changes no profile, only that readout

Which terrain model answers is not a setting: premium reads get the detailed national models where they exist and GEDTM30 past their borders, everyone else gets SRTM everywhere, for profiles and exports alike.

The first two sliders correct a terrain model, so they apply wherever elevation is read from one — planned routes, drawn lines and measurements, and imported tracks whose elevation was replaced from the server — and never to recorded altitude (live tracking, or a track kept as recorded).

Modals that edit a persisted default style or settings (Map preferences, Elevation preferences, Layers configuration, drawing **Default properties**, objects **Marker style**, track-viewer **Default style**, **Lookup style**) also carry a **Reset to default** button that refills the form with default values (applied with Save, not immediately).
