# Austria — outreach working file (roadmap Phase 3)

Live working state for the Austrian push. Post outcomes go to the Outreach log in
[`promotion-roadmap.md`](./promotion-roadmap.md). Same conventions as
[`promotion-italy.md`](./promotion-italy.md): attract, never sell — never a price,
never a pitch, and premium named only where a post headlines a gated feature (see
*Decided — how premium is mentioned* below); disclose affiliation in every post;
never re-introduce Freemap where it is already known.

### Thread-age rule

**Do not revive threads that are years old.** A reply under an old tour report or an
old question reads as necroposting and makes the poster look like they trawled the
archive for a place to put a link.

**One exception: pinned index/collection threads** that exist to be added to
indefinitely and are still being appended to (gipfeltreffen's "Digitale Karten im
Netz – Übersicht" — pinned, opened with *"Mit der Bitte um Ergänzungen"*, last
appended April 2025). Adding an entry there is using the thread as intended, not
reviving it.

Where a good old thread exists but is not an index, **start a fresh thread on the
same subject instead** and do not quote or @-mention people from the old one.

## Why Austria before Germany

The roadmap calls Germany the "biggest untapped ceiling", but the code says the
terrain hook does not work there. `OUTDOOR_NATIONAL_DTM_ATTRIBUTION` in
`src/shared/mapDefinitions.tsx` lists AT, CZ, FR, IT, PL, SK, SI, CH, NO, SE, FI,
ES, HR, LU, BE and England — **no `de`**. Germany falls back to global 30 m
GEDTM30, so "see every gully and old road" is not a claim that can be made there.

Austria has **ALS DTM (Geoland.at)** over the whole country, 13 actions/visit (the
best engagement figure in the roadmap), Alpine and ski-touring culture, and German
copy that is reusable for Germany and Switzerland later. It is the better bet.

## The warm channel: gipfeltreffen.at

ÖAV-affiliated (Austrian Alpine Club sections have their own subforums), active
daily, vBulletin. Freemap already appeared there organically in March 2023, inside
a tour-report thread:

- **manfred1110** (20 083 posts) offered it as a map worth adding, alongside "die
  Tschechenmap": `https://www.freemap.sk/#map=15/47.87…&layers=X`
- **Rudolf_48** (16 847 posts) answered: *"Die Slowaken haben eine nette
  Geländedarstellung und viele Beschriftungen. Dafür finde ich keine
  Orthofotodarstellung von der Gegend."*

Source: https://www.gipfeltreffen.at/forum/gipfeltreffen/toureninfo-verh%C3%A4ltnisse/wanderungen-und-bergtouren/wien-n%C3%B6-burgenland-af/2528321-vordere-mandling-von-s%C3%BCdwesten-22-3-2023 (posts #13–14)

**Two things follow.**

1. Two of the forum's heaviest posters liked the terrain rendering unprompted. That
   is the warm signal — but it was a digression in a 2023 tour report, not a proper
   presentation, so Freemap has never actually been introduced on that forum. A new
   thread in the right section is legitimate here (unlike avventurosamente).
2. **An objection has stood unanswered for three years**: Rudolf could not find
   aerial imagery. Freemap has had a worldwide Esri aerial (`S`) the whole time — he
   simply never found the layer switcher. Worth answering plainly in the post, since
   he is still active and others will have hit the same wall.

**Venue:** `Literatur, Navigation und Technik` → **`Hard & Software mit Bergbezug`**
(`/forum/gipfeltreffen/literatur-navigation-und-technik/hard-software-mit-bergbezug`).

**Registration** (2026-09-04): registered as `MartinFreemap`, email confirmed, and
**awaiting manual administrator approval** — *"Dein Benutzerkonto muss noch von einem
Administrator freigeschalten werden."* Until then the account can browse and change
settings but has no reply control and no new-thread button anywhere.

No reCAPTCHA (vBulletin `humanverify` only) and a real email address is required
("Wegwerf- oder Einmal-Adressen können nicht berücksichtigt werden"). An earlier note
here claimed there was no approval queue — that was read off a generic template
string in the page source and was wrong.

## Other Austrian venues

| Venue | Notes |
|---|---|
| ~~`alpinforum.com`~~ | **Checked and rejected.** Despite the name it is a ski-resort and cable-car forum — its board list is Skigebiete, Aktuelle Schneesituation, Infrastrukturelle Neuigkeiten, Seilbahntechnik, Lift-World, Skiliftforum, Remontées Mécaniques, Funiforum. The audience rides lifts on marked pistes; it has little use for LiDAR terrain, OSM waymark rendering or path routing, and no Freemap mention exists there. Low fit — skip. |
| `tourentipp.com` forum (Gipfelkonferenz) | Austria board; tour-conditions focused. |
| `bergsteigen.com` | Editorial site with community; closer to a partnership than a forum post. |
| `hikr.org` | **Registered 2026-09-04** as `MartinFreemap` (shown truncated as `MartinFree`), logged in, no approval queue — it works immediately. Forums are per-community; there is no top-level forum. Use **Small Talk** (`/comm/talk/forum/`) for German and **Hikr in italiano** (`/comm/italiano/forum/`) for Italian. Swiss-majority audience, so swissALTI3D applies as well as the Austrian ALS DTM. |
| `wanderforum.de`, `wander-community.de` | German hiking forums — for the DE leg later, where the terrain hook does not apply. |
| `community.openstreetmap.org/c/communities/at/59` | OSM Austria. Mappers, not end users — supplementary, do last. |

## The real entry point: the pinned "Digitale Karten im Netz – Übersicht"

`/hard-software-mit-bergbezug/67800-digitale-karten-im-netz-übersicht` — pinned,
started 2012 by **cyberpezzi** with the words *"Mit der Bitte um Ergänzungen"*, 86
replies, **28 641 hits**, last active April 2025. A community-curated list of free
online maps, entered by country (`Frankreich: geoportail…`, `Schweiz: map.geo.admin.ch`,
`Bayern: bayernatlas.de`, `Österreich: austrianmap.at`). **Freemap is not in it.**

That is the Austrian counterpart of the Italian Risorse entry, except it takes
contributions by design. Post **Draft A0** there first; it is a contribution to a
list, not an advert. Draft A (own thread) only later, and only if A0 draws interest.

**Willingness to pay, in their own words** (posts #76–78, Jan 2021): tauernfuchs —
*"trotzdem zahle ich die 7.- Euro pro Jahr gerne"* for bergfex-pro; chfrey — *"Wenn
das alles gratis wäre, wovon sollen dann die Programmierer leben?"* This audience
argues openly for paying for good cartography, so the "funded by its users" sentence
is an asset here rather than a risk.

## Draft A0 — entry in the pinned overview thread

> Hallo,
>
> zur Ergänzung der Übersicht — mit der Offenlegung vorweg: ich arbeite an der Karte
> mit, die ich hier eintrage, bin also befangen.
>
> **Europaweit, inklusive Österreich: https://www.freemap.eu**
>
> Outdoor-Karte auf OpenStreetMap-Basis, gemeinnütziges Projekt der slowakischen
> OSM-Community, quelloffen, werbe- und trackingfrei.
>
> Für Österreich werden Schummerung und Höhenlinien aus dem ALS-Geländemodell
> (Digitales Geländemodell Österreich, Geoland.at) gerechnet und nicht aus einem
> globalen 30-m-Modell — Rinnen, Geländekanten, alte Karrenwege und Wegspuren bleiben
> erkennbar. Steige werden in der Farbe ihrer Markierung gezeichnet (OSM-Tag
> `osmc:symbol`) und mit Wegnummer und Namen beschriftet.
> · Dachstein — https://www.freemap.eu/?lang=de#map=15/47.475000/13.605000&layers=X
> · Großglockner — https://www.freemap.eu/?lang=de#map=15/47.074000/12.694000&layers=X
>
> Dazu, alles im Browser: Tourenplaner mit Höhenprofil (Wandern, Rad, MTB, Skitour,
> Gravel, E-Bike), GPX/KML/TCX öffnen, bearbeiten und exportieren — für Garmin, Locus
> und OsmAnd passend aufbereitet —, Offline-Nutzung eines gewählten Ausschnitts,
> Kartendruck als PDF/SVG/PNG, eigene WMS-/TMS-Ebenen, Niederschlagsradar und ein
> 360°-Panorama aus dem Geländemodell.
>
> Das Luftbild ist übrigens als eigene Ebene umschaltbar — das war hier vor einigen
> Jahren schon einmal eine Frage.
>
> Oberfläche auf Deutsch, zum Schauen und Planen ist kein Konto nötig. Das Projekt
> finanziert sich über seine Nutzerinnen und Nutzer statt über Werbung oder
> Datenauswertung; ein Teil der aufwendigeren Funktionen ist deshalb Unterstützern
> vorbehalten, fürs Kartenlesen, Planen, Aufzeichnen und Exportieren braucht es das
> nicht.
>
> Was neu dazukommt, zeigen wir mit Bildern hier: https://en.osm.town/@FreemapSlovakia
> Quellcode: https://github.com/FreemapSlovakia

## Draft A — gipfeltreffen.at, own thread in *Hard & Software mit Bergbezug*

Only after A0, and only if it draws interest.

> **Titel:** Freemap.eu — freie Outdoor-Karte mit österreichischem ALS-Geländemodell
>
> Hallo miteinander,
>
> vorweg, damit es klar ist: ich arbeite an dem Projekt mit. Ich bin nicht hier, um
> euch etwas zu verkaufen — Freemap ist ein gemeinnütziges Projekt der slowakischen
> OpenStreetMap-Community, quelloffen, werbefrei und ohne Tracking.
>
> Die Karte ist hier schon einmal aufgetaucht: manfred1110 hat sie 2023 in einem
> Tourenbericht verlinkt, und Rudolf_48 hat damals geschrieben, die Geländedarstellung
> und die Beschriftungen seien nett, er finde aber keine Orthofotodarstellung. Das
> möchte ich beantworten, und gleich dazusagen, was sich seither getan hat.
>
> **Zum Orthofoto:** das gibt es, es ist nur nicht die Standardebene. Oben rechts im
> Kartenmenü lässt sich auf Luftbild umschalten — weltweit verfügbar, also auch für
> ganz Österreich. Ebenso lassen sich eigene WMS-/TMS-Ebenen einbinden, wenn jemand
> lieber das Orthofoto eines Landes einbindet.
>
> **Zum Gelände:** Schummerung und Höhenlinien für Österreich werden aus dem
> ALS-Geländemodell (Digitales Geländemodell Österreich, Geoland.at) berechnet, nicht
> aus einem globalen 30-m-Modell. Man sieht Rinnen, alte Karrenwege, Geländekanten und
> Wegspuren, die auf anderen Karten verschwinden.
> · Dachstein — https://www.freemap.eu/?lang=de#map=15/47.475000/13.605000&layers=X
> · Großglockner — https://www.freemap.eu/?lang=de#map=15/47.074000/12.694000&layers=X
>
> **Zu den Wegen:** Steige werden in der Farbe ihrer Markierung gezeichnet (aus dem
> OSM-Tag `osmc:symbol`), mit Wegnummer und Namen beschriftet, lokale Steige
> gestrichelt. Was in OSM nicht erfasst ist, fehlt hier natürlich auch — dafür ist es
> ein paar Minuten nach einer Korrektur in OSM auf der Karte sichtbar.
>
> **Was sonst noch drin steckt**, alles im Browser, ohne Installation:
> · Tourenplaner mit eigenen Profilen (Wandern, Rad, MTB, Skitour, Gravel, E-Bike)
>   samt Höhenprofil; die Route lässt sich nach Steigung, Untergrund, Wegart und
>   Schwierigkeit (SAC bzw. MTB) einfärben — man sieht also vorher, wo es heikel wird
> · GPX/KML/TCX öffnen, bearbeiten und exportieren; Export passend für Garmin,
>   Locus und OsmAnd aufbereitet
> · Offline: Ausschnitt und Zoombereich wählen, herunterladen, ohne Verbindung nutzen
> · Karte als PDF/SVG/PNG exportieren zum Ausdrucken
> · 360°-Panorama aus dem Geländemodell und eine Sichtbarkeitsanalyse von einem
>   gewählten Punkt aus
> · Niederschlagsradar, Live-Tracking, eigene Kartenebenen (WMS/TMS)
>
> Oberfläche auf Deutsch, kein Konto nötig zum Schauen.
>
> Das Projekt finanziert sich über seine Nutzerinnen und Nutzer statt über Werbung
> oder Datenauswertung — ein Teil der aufwendigeren Funktionen ist deshalb
> Unterstützern vorbehalten. Zum Kartenlesen, Planen, Aufzeichnen und Exportieren
> braucht es das nicht.
>
> Mich interessiert vor allem, wie die Darstellung Österreichs bei euch ankommt —
> was fehlt, was falsch dargestellt ist, was ihr erwarten würdet und nicht findet.
> Das Rendering ist unseres, Rückmeldungen landen also direkt in Änderungen.
>
> https://www.freemap.eu · Quellcode: https://github.com/FreemapSlovakia
> Was neu dazukommt, zeigen wir dort mit Bildern: https://en.osm.town/@FreemapSlovakia

## Product idea this research turned up

Rudolf's complaint is answerable today (Esri aerial, layer `S`), but Austria
publishes its own orthophoto openly via **basemap.at** (`bmaporthofoto30cm`), which
is sharper than the global Esri mosaic over Austria and is the imagery Austrians
actually expect. Adding it as an Austrian aerial layer would answer, in the product,
the one public objection an Austrian heavyweight raised — worth evaluating
(licensing to be confirmed before shipping). Not started; no code touched.

## Decided — how premium is mentioned

Colorize by steepness, surface, road type, SAC and MTB difficulty, track grade and
smoothness is premium-gated (only Elevation, Speed and Time are free), as are the
finer panorama tiers, viewshed beyond 20 km, radar history, and the MBTiles/SQLiteDB
offline export.

**Rule: name it only where the copy headlines a feature that is actually gated —
one factual sentence, low in the post, never a price and never a pitch.** Framed as
"funded by its users instead of by ads or data", it explains why there is no
tracking and earns goodwill in exactly these audiences; and it protects the post
from the far worse outcome of a reader hitting a gem on a feature that was
headlined, then saying so publicly.

Drafts carrying the sentence: Austria A; Italy 1, 2, 3, 4. Drafts that must **not**
carry it: Italy 6 (track merge — join and GPX export are free, so mentioning it
there would be gratuitous) and Italy 5 (embed pitch).

**Every intro-style draft also links the Mastodon feed**
(`https://en.osm.town/@FreemapSlovakia`) as the "what's new, with pictures" pointer —
it shows features in images, which a forum post cannot, and it gives an interested
reader somewhere to follow that is not a sales page. Not in Draft 6 (off-topic
there) or Draft 5.

## Next session: start here

1. ~~Register on gipfeltreffen.at~~ — done as `MartinFreemap`, email confirmed,
   **awaiting admin approval**. Nothing can be posted until it clears.
2. Post **Draft A0** in the pinned "Digitale Karten im Netz – Übersicht" thread.
   **Draft A** (own thread) only later, if A0 draws interest.
3. Check `alpinforum.com` for existing Freemap mentions and its registration flow
   before writing anything for it.
4. Log posted rows in the roadmap's Outreach log.

## hikr.org — why the framing is "tell me where it's wrong"

Two precedents set the tone, and both say disclosed self-promotion is fine here when
the post asks something of the community:

- **`/comm/italiano/forum/`, 28 Aug 2026** — `Fkeru`: *"Quanto è bagnato il terreno
  adesso? Ho fatto una mappa della Svizzera — ditemi dove sbaglia"*, presenting his own
  project (thetrail.guide, trail wetness over 137 800 km of Swiss paths) and asking
  for corrections. A map author posting his own map, one week ago.
- **`/comm/talk/forum/`** — `budget5`: *"Ich erlaube mir an dieser Stelle etwas Werbung
  für unseren neuen Podcast zu machen"*. Explicit ad, four replies, no backlash.

Also: hikr rates every tour on the **SAC T-scale**, so colorizing a route by SAC
difficulty is unusually on-topic here — lead with it, unlike anywhere else.

## Draft H-DE — hikr.org, Small Talk forum — **POSTED 2026-09-04**

Live at https://www.hikr.org/post203834.html . Joined the Small Talk community first
(required before its forum accepts posts; member 122).

**Two replies arrived the same day and both are answered** (verified live):

- **Bergmax**, 10:37 — checked the North Sea coast and Helgoland. Praised the aerial
  imagery. Reported the contour bug, asked what the red "?" are, objected to tidal
  channels as grey lines and to runways/taxiways being drawn alike, and asked what
  "Premium-Zugang" is for. Answered in "Danke — die Antworten der Reihe nach".
- **ABoehlen (Adrian)**, 14:35 — "Super Projekt". Prefers the cartography to
  OpenTopoMap, says swissALTI3D is visible at a glance, singles out the panorama and
  viewshed as things he misses in the federal geoportal. Suggested using swisstopo
  open data instead of OSM inside Switzerland (example: the Hagsbach missing).
  Answered in "Danke — und zu den swisstopo-Daten": declined on principle — national
  data only where OSM has nothing to say (elevation), OSM for anything OSM maps,
  because otherwise the cross-border consistency he praised is what breaks.

**hikr posting mechanics — get this right first time, it saves an edit:**

- The message box is a **CKEditor** storing HTML. Setting the underlying
  `textarea[name=post_text_c]` does nothing visible; use
  `CKEDITOR.instances.post_text_c.setData(html)`.
- **Write real HTML, not plain text.** Bare URLs render as unclickable text that wraps
  mid-address and looks careless. Use `<a href="…">Short label</a>`, `<strong>` for the
  lead of each section so the post can be scanned, `<em>` for tags like
  `osmc:symbol`, and `<p>&nbsp;</p>` between blocks — consecutive `<p>` alone renders
  too tight and reads as a wall of text.
- Editing afterwards works: `https://www.hikr.org/edit_msg.php?id=<post id>`.
- Joining the community is required before its forum accepts a post.

> **Titel:** Ich arbeite an einer freien Outdoor-Karte — sagt mir, wo sie für eure Gegend danebenliegt
>
> Hallo zusammen,
>
> Offenlegung vorweg: ich arbeite an der Karte mit, die ich hier zeige. Freemap ist
> ein gemeinnütziges Projekt der slowakischen OpenStreetMap-Community — quelloffen,
> werbefrei, ohne Tracking. Ich stelle sie hier nicht vor, damit ihr sie benutzt,
> sondern weil ihr genau die Leute seid, die mir sagen können, wo sie falsch liegt.
>
> **Das Gelände** kommt aus den nationalen Höhenmodellen statt aus einem globalen
> 30-m-Modell: swissALTI3D für die Schweiz, das ALS-Geländemodell (Geoland.at) für
> Österreich, das HR-DTM 5 m des CNR-IRPI für Italien. Rinnen, Geländekanten, alte
> Karrenwege und Wegspuren bleiben dadurch lesbar.
> · Grimsel — https://www.freemap.eu/?lang=de#map=15/46.571000/8.336000&layers=X
> · Dachstein — https://www.freemap.eu/?lang=de#map=15/47.475000/13.605000&layers=X
>
> **Die Wege** werden in der Farbe ihrer Markierung gezeichnet (OSM-Tag
> `osmc:symbol`), mit Nummer und Namen beschriftet, lokale Wege gestrichelt. Was in
> OSM fehlt, fehlt auch hier — dafür ist eine Korrektur ein paar Minuten später auf
> der Karte sichtbar.
>
> **Für euch vielleicht am ehesten interessant:** eine geplante oder importierte Route
> lässt sich nach SAC-Wanderskala einfärben, ebenso nach Steigung, Untergrund, Wegart
> und Schwierigkeit — man sieht also am Kartenbild, wo eine Tour vom T2 ins T4 kippt,
> bevor man draußen steht. Dazu Höhenprofil mit Zoom und Abschnittsauswertung,
> GPX/KML/TCX-Import und -Export (auch für Garmin, Locus, OsmAnd aufbereitet),
> Offline-Nutzung eines gewählten Ausschnitts, und ein 360°-Panorama aus dem
> Geländemodell, das die Gipfel benennt.
>
> Das Projekt finanziert sich über seine Nutzerinnen und Nutzer statt über Werbung
> oder Datenauswertung; ein Teil der aufwendigeren Funktionen ist deshalb
> Unterstützern vorbehalten. Fürs Kartenlesen, Planen und Exportieren braucht es das
> nicht.
>
> Was mich wirklich interessiert: schaut euch eure Hausberge an und sagt mir, was
> falsch, hässlich oder schlicht nicht da ist. Das Rendering ist unseres, solche
> Rückmeldungen landen direkt in Änderungen.
>
> https://www.freemap.eu · Neues mit Bildern: https://en.osm.town/@FreemapSlovakia

## Product feedback harvested from the hikr post

Worth acting on, in order:

1. **Contours are drawn over open sea** (confirmed at Helgoland — the `0 m` contour
   runs across the water, so the cliff appears to lie in the sea). Germany has no
   national DTM, so GEDTM30 answers there and returns values offshore.
   **Decision: clip contour lines against the water polygon** — the cheap version,
   since masking the DEM is a bigger job. At a coastline the cut is hidden by the
   drawn coastline, so there are no ugly stubs. Do **not** simply drop the 0 m
   contour: northern Germany and the Netherlands have real land below sea level.
   Martin has told Bergmax we will look at this, so shipping it earns a follow-up.
2. **The premium notice reads as a caption, not a control.** A first-time visitor hit
   the gem when zooming and could not tell what it was for; it only reveals itself as
   clickable on hover. A link affordance or an ⓘ would fix it.
3. Declined deliberately: swisstopo data in place of OSM (see above); runway/taxiway
   surface and width distinctions (an outdoor map does not draw road width to scale
   either); tidal channels as grey lines — Bergmax was asked for a URL, since the
   grey lines found near Norderney turned out to be a cycle route and dyke lines.

**The red "?" are OSM objects carrying `fixme=*`** — deliberate, not a glitch.
Example: https://www.freemap.eu/#map=18/53.698134/7.163437&layers=X&osm-node=430165866
The map legend (https://www.freemap.eu/#show=legend) answers this class of question
and is generated for the zoom currently in view — worth quoting to anyone asking what
a symbol means.
