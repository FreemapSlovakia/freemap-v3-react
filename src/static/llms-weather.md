## Weather

### Weather forecast

- Access: Main menu > Weather forecast, the search box, or <kbd>g</kbd> <kbd>f</kbd> — each asks for one click on the map or a searched place; or **Weather forecast** in the map context menu (and in every ⋮ menu that knows a place), which opens it for that point at once
- URL path: `panel=weather/<lat>,<lon>`
- Online only; Europe only; data from Open-Meteo

The forecast opens in a docked panel: hourly, for 16 days, for the elevation of the place picked (given in the footer — on a summit it is colder than the model's average for the area), its days and times in the place's own time zone. The footer says **Local time** with the difference where that isn't the viewer's. The panel's **Another place** asks for a place again.

**Days** (the default view) lists the days, each with its prevailing weather, fresh snow in cm, rain in mm, the lowest and highest temperature, and the snow on the ground under the date. A day opens into:

- a summary line: sunshine hours (held, here and in the hours' details, to the time the sun stands over the terrain where that is known), the strongest gusts, the hours with precipitation and their highest chance, and a UV index from 3;
- its hours, with a slim row each where the sun rises and sets — where the terrain model covers the place, the time it clears or drops behind the surrounding terrain (from the panorama's terrain service, with a spinner while it loads), followed by the time over a level horizon; elsewhere the astronomical time. On a day the terrain hides the sun all day, the rows give only the level-horizon times, labelled so, and the summary line says "The terrain hides the sun all day". The night shading in the charts follows the same times, and the footer credits the terrain models. An hour shows the weather symbol, temperature, fresh snow in cm with a snowflake or rain in mm with a drop, the chance of precipitation (the share of ensemble runs with some) with an umbrella, and the wind with its direction arrow and gusts. Gusts are coloured by strength (grey to about 45 km/h, fading into amber by 60 km/h and on to red by 100 km/h, bold from 90 km/h); a moderate thunderstorm risk is amber and a high one red;
- an hour's details: felt temperature, snow depth, snow line (while something falls; from the ICON models only, so not every day), humidity, freezing level, cloud cover low/mid/high, thunderstorm risk, sunshine, UV index and visibility, each only where it says something.

**Charts** (the **Days | Charts** switch at the top) turns the list into stacked charts on one time axis — temperature and felt temperature, precipitation (rain and snow in 3-hour bars, hourly once zoomed in), its chance, clouds by height (high, mid, low), wind and gusts with direction arrows, and the 0 °C height against the place's — zoomed with the wheel or a pinch and panned by dragging, all together, with the values shown on hover. On a desktop the panel widens while the charts show.

The same forecast is timed to a trip in two other places: the route finder's **Weather along the route** (from a set departure, the weather where the route is at each hour — see [Routes and tracks](/llms-routes-tracks.md)), and an event's panel, for an event in the next 16 days (see [Photos and personal maps](/llms-photos-maps.md)).

### Weather radar

- Access: the `R` overlay (map toolbar, the search box, or <kbd>Shift</kbd> <kbd>R</kbd>); see the layer registry in [Map Layers](/llms-layers.md)

The radar is animated: turning it on opens its own toolbar with play/pause, frame stepping and a timeline. The timeline carries the same frames for everyone — the measured frames the server publishes plus a one-hour forecast — but only part of it can be opened without premium: premium reaches up to six hours back and can open the forecast, everyone else two hours and no forecast. The locked stretches are painted in the upsell colour at each end and offer premium when clicked. The only setting is whether the forecast frames are shown at all, which is itself premium.
