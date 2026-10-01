## OpenStreetMap objects, details and changes

### Objects (POIs)

- Access: type the kind of place into the search box
- URL path: `/#objects=<type>;<type>`

Not a tool that is opened: the POI types are a filter, and switching one on is what brings everything else with it. From two characters on, the search box lists the matching types under an **Objects (POIs)** caption, above the places it finds — each a checkbox, so picking one leaves the query and the list alone and several can be switched on in a row. A type is found by its name or by its raw tags (`amenity=pub`); the rows keep the order the match scored them in, so switching one on never moves another. A type already on is ticked, and switching it off is done from the same row, from the chips in a selected object's details popup, or from that object's **Hide type “…”** row. Offline the section is empty: the objects are fetched. Matching types are visible interactively as markers with icons on the map; the objects come from Freemap's own OpenStreetMap query API, which holds Europe only.

While any type is on, a short **Objects (POIs)** toolbar stands for the filter — it has no open or close of its own, and the **×** that clears the filter is what takes it off the screen (<kbd>Del</kbd> does the same while nothing is selected). Its **⋮** menu carries **Marker style**, below a divider: a modal to set the marker shape (pin/ring/square) and color, applied to all displayed objects, and **Show label** (Always, On hover — the default, When selected, On hover or selected) for the objects' name tooltips. The shape and color can also be preset via the read-only `/#objects-style=` URL param (see `doc/url-params.md`).
While objects are displayed, that same **⋮ menu** offers **Convert all to drawing** and **Show all as Lookup**. Either hands the objects over for good: the type filter is cleared — which is also what takes the toolbar away — so they leave the map as objects (as lookups they arrive kept, and the element behind one is fetched from OSM only when it is clicked; at most 500 can be handed over at once, since each is named separately in the URL). A selected object's toolbar carries the same ⋮ menu for that one object, leaving the others alone — and leaving the object itself on the map, which is why it says **Copy to drawing** instead. For a way or a relation the conversion dialog offers the element's **own geometry** in place of the point it is drawn at; picking it fetches the element from OSM straight away, and if it turns out detailed enough to be worth thinning the dialog's own deviation slider appears, derived from it. **Copy to Tracks and data** (which offers the same geometry choice, and — where the viewer already holds something — whether to append to it or replace it) does the same into the track viewer instead — a copy for one object, since a single live object cannot be taken off the map, and a conversion for the whole screenful. That menu also carries the map context menu's whole list for where the object stands, and what can be done with the one object elsewhere: OpenStreetMap.org and its history, the two editors opened on the element itself, and the "Open in external application" targets. **Show as Lookup** on one object leaves it kept, the same way the whole screenful arrives kept. A selected object's menu also opens with a **Hide type "…"** row for each type a filter is currently showing it under, so the kind that is in the way can be switched off without hunting for it; the same switches sit in the details popup, where every kind of the object is a chip that toggles its type on or off (filled while the type is on, and a broader type showing the object gets a chip of its own even where the object's name doesn't mention it). <kbd>Del</kbd> clears the type filter while nothing is selected.

### Map details

- Access: Main menu > Map details
- Keyboard shortcut: <kbd>g</kbd> <kbd>i</kbd>
- URL path: `/#tools=map-details`

Toggles the map details toolbar. Clicking a location queries information about it, grouped by source (each toggleable via the **Sources** dropdown); the results are listed in the search box's dropdown and are displayed the same way search results are — the picked one for as long as it is selected, plus any kept through the selection toolbar's **Keep on the map** toggle:

- **Reverse geocoding** — the locality / address of the point
- **Nearby** — features near the clicked point
- **Containing features** — administrative and geographic areas containing the point (cadastral community, district, region, mountain range, country, etc.)

The last two read OpenStreetMap data from Freemap's own query API, which holds Europe only; outside Europe they answer with nothing.

Selecting a feature opens a detail popup headed by its name and what kind of thing it is — each kind a chip that, where it matches a POI type, switches that category on or off, as the outdoor map legend's chips do — with the terrain-model elevation at it (read from the elevation API at one point of the feature — a line at its midpoint, anything else at the centre of its geometry — naming the model behind the number and offering premium a higher-precision one; a feature reaching more than 200 m across gets none at all, one reading saying nothing about a street, a railway route or a whole forest), its OSM tags, and the data source. What can be done with the feature elsewhere lives in the ⋮ menu of its selection toolbar (search results and objects alike) instead — the toolbars keep only what is about the feature being on the map, and the menu's toggle is named in its tooltip alone: the map context menu's whole list for where the feature stands, and then an **Open in…** submenu (with a ← Back item) holding the whole list of targets, each named for what it is rather than for the opening — "OpenStreetMap.org", "OpenStreetMap.org (history)", "JOSM" and "iD" all act on the element itself, which is why the list's own position-based editors are left out of this menu, and the other maps follow. That list is long enough that leaving it inline would bury everything above it. **Share location** sits with the rest of what acts on the place; copying the page URL is not offered here at all, being about the page rather than the feature — the main menu's **Share / Open in external app** is where that lives. It follows the selection and opens of itself for anything that is on the map because it was put there — an object, a map-details hit, an element asked for by id, a lookup that is kept. The one exception is a hit from searching by name that is merely being looked at: picking that is navigation, so it comes without the popup and the selection toolbar offers an ⓘ **Details** button to ask for it. The popup's × dismisses it for as long as that feature stays selected; clicking the feature again brings it back, and nothing about the choice is remembered beyond that.

The geometry displayed for search and map-details results shares one style (color, fill, width, dash, line cap/join, marker shape — the same set as the track-viewer default style), editable in a dedicated **Lookup style** modal opened from the last row of the search box's dropdown (it carries a **Reset to default** button), which also sets **Show label** (Always, On hover — the default, When selected, On hover or selected) for the results' names. The style can also be preset via the read-only `/#search-style=` URL param, and `window.fmHeadless.searchResultStyle` overrides it in headless image rendering (see `doc/url-params.md`).

### Map changes

- Access: Main menu > Map changes
- Keyboard shortcut: <kbd>g</kbd> <kbd>x</kbd>
- URL path: `/#tools=changesets`

Toggles the OSM changes toolbar, which contains: a dropdown to select the time window (changesets from the last 3, 7, 14, or 30 days), an "All authors" text input to filter by OSM username, a clear button, a button to download the changesets, and — once some have been found — a ⋮ menu that turns them into drawing points or hands them to Tracks and data. Either takes them off the map and closes the toolbar; as loaded data each changeset becomes a waypoint named by its comment, carrying the changeset id, the author and when it was closed as properties.
OSM changes matching the selected parameters are displayed on the map as markers showing the mapper's name and changeset description.

Clicking the marker will open the toast with the following details:

- author
- changeset description
- date/time of the changeset
- changeset links to osm.org and Achavi
