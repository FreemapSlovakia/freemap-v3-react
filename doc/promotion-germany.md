# Germany — outreach working file (roadmap Phase 3)

Live working state for the German push. Conventions, the thread-age rule, the premium
rule and the tone rules are in [`promotion-austria.md`](./promotion-austria.md); claims
to avoid are in the roadmap's _Claims that must stay accurate_. Log posts in the
roadmap's Outreach log.

## Venues

| Venue                                          | State (2026-11-16)                                                                                                                                                                                                                                |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **outdoorseiten.net (ODS)**                    | **The target.** Largest German trekking forum: 1.9 M posts, posts daily. phpBB. Subforum _Orientierung, Navigation & Geocaching_ (`viewforum.php?f=27`). Registration open behind a CAPTCHA — Martin registers himself. No Freemap mention found. |
| wanderforum.de                                 | **Not worth a post.** 7 threads touched in the last 30 days, mostly partner searches with 0–5 replies. Its Freemap thread is from 2011 (thread-age rule).                                                                                         |
| mtb-news.de, rennrad-news.de, trekkingguide.de | Not checked yet.                                                                                                                                                                                                                                  |

### What ODS taught before posting

- **A German DGM product was introduced in the same subforum and fell flat** —
  `freizeitkarte`, "Genaue Höhendaten für Deutschland" (`viewtopic.php?t=58792`,
  Nov 2025). Regulars answered: a toy for map nerds, contours must be visible
  everywhere without clicking per tile, too data-hungry on a phone with poor signal,
  "I'd rather stay with openstreetmap.org", and a reminder to show the data licences.
  So **do not lead with terrain precision.** Lead with the practical map: contours
  everywhere, waymarks as on the signs, offline, Garmin export. Name the licences.
- **New account + product post reads as advertising** — "App Vorstellung: Meine Touren
  …" (Nov 2026, in _Sonstige Ausrüstung_) drew "just registered and straight away a
  product presentation looks like advertising", yet stayed up and found interested
  komoot-weary readers. Disclose up front and say plainly how the project is funded,
  before someone asks.
- Live grievances there: komoot after the sale ("Komoot verkauft", 35 replies), Mapy
  turning subscription ("mapy.cz ist zu einem Abo-Zombie geworden"), Garmin watch
  track/waypoint pain (`viewtopic.php?t=58796`). Do not name competitors in the post;
  the readers make the comparison themselves.

## Draft D1 — ODS, own thread in _Orientierung, Navigation & Geocaching_ — **POSTED 2026-11-16**

Posted as `*Martin*`: https://www.outdoorseiten.net/forum/viewtopic.php?t=95821.
phpBB with CKEditor in BBCode mode: `CKEDITOR.instances.message.setData(bbcode)` takes
BBCode, not HTML.

### English (for review)

> **Title:** Freemap.eu — OSM hiking map with DGM1 terrain for all of Germany, offline
> and with Garmin export (feedback welcome)
>
> Hello all,
>
> to be clear up front: I develop the map I'm presenting here, so I'm biased. Freemap
> is a project of the Slovak OpenStreetMap community, open source and without
> tracking. I'm not here to advertise — I'm here because this forum has people who
> can judge whether a map works outdoors. Please try it, and then tell me where it's
> wrong for your area.
>
> **What it is:** an OSM-based outdoor map of 46 European countries that runs in the
> browser (desktop and phone) and as a native app for Android and iOS.
>
> **For Germany:** hillshading and contours are computed in all 16 states from that
> state survey office's DGM1, and are part of the map itself — nothing to switch on or
> load per tile, for everyone, no account needed. Waymarked trails are drawn in the
> colour of their waymark (OSM tag osmc:symbol) and labelled with number and name;
> what is on the signpost is on the map.
> · Saxon Switzerland (Schrammsteine): [link]
> · Berchtesgaden (Watzmann): [link]
>
> **What helps day to day:**
> · route planner (hiking, bike, MTB and more) with elevation profile
> · open GPX/KML/KMZ, join tracks, set your own named waypoints and export it all as
> one GPX — prepared for Garmin, Locus and OsmAnd
> · offline: choose an area and zoom levels, download, use without signal; the app
> also plans routes offline on the device
> · map export to PDF/SVG/PNG for printing
> · 360° panorama with peak names and a viewshed, both from the terrain model
>
> The attribution names the sources of the terrain data and OSM, matching the area on
> screen.
>
> On funding, since the question will come: the map is free and needs no account.
> Supporters get the finest zoom levels and some heavier functions; everyone else
> sees ads the project serves itself — no ad network, no trackers.
>
> What's new, with pictures: [Mastodon] · Source code: [GitHub]
>
> Regards, Martin

### German (to post)

> **Titel:** Freemap.eu – OSM-Wanderkarte mit DGM1-Gelände für ganz Deutschland,
> offline und mit Garmin-Export (Feedback erwünscht)
>
> Hallo zusammen,
>
> vorweg, damit es klar ist: Ich entwickle die Karte, die ich hier vorstelle, bin also
> befangen. Freemap ist ein Projekt der slowakischen OpenStreetMap-Community,
> quelloffen und ohne Tracking. Ich bin nicht zum Werben hier, sondern weil hier
> Leute unterwegs sind, die beurteilen können, ob eine Karte draußen taugt. Probiert
> sie aus – und sagt mir dann, wo sie für eure Gegend danebenliegt.
>
> **Was es ist:** eine Outdoor-Karte auf OSM-Basis für 46 Länder Europas, die im
> Browser läuft (am PC wie am Handy) und als native App für Android und iOS.
>
> **Für Deutschland:** Schummerung und Höhenlinien werden in allen 16 Bundesländern aus
> dem DGM1 des jeweiligen Landesvermessungsamts gerechnet und sind Teil der Karte
> selbst – nichts zum Zuschalten oder kachelweise Nachladen, für alle und ohne Konto.
> Markierte Wanderwege werden in der Farbe ihrer Markierung gezeichnet (OSM-Tag
> `osmc:symbol`) und mit Nummer und Namen beschriftet; was auf dem Wegweiser steht,
> steht auch auf der Karte.
> · Sächsische Schweiz (Schrammsteine): https://www.freemap.eu/?lang=de#map=15/50.9186/14.2125&layers=X
> · Berchtesgaden (Watzmann): https://www.freemap.eu/?lang=de#map=15/47.5545/12.9225&layers=X
>
> **Was im Alltag hilft:**
> · Tourenplaner (Wandern, Rad, MTB u. a.) mit Höhenprofil
> · GPX/KML/KMZ öffnen, Tracks zusammenfügen, eigene benannte Wegpunkte setzen und
> alles als ein GPX exportieren – passend aufbereitet für Garmin, Locus und OsmAnd
> · Offline: Ausschnitt und Zoomstufen wählen, herunterladen, ohne Netz nutzen; die
> App plant Routen auch offline direkt auf dem Gerät
> · Karte als PDF/SVG/PNG zum Ausdrucken
> · 360°-Panorama mit Gipfelnamen und eine Sichtbarkeitsanalyse, beides aus dem
> Geländemodell
>
> Die Quellen der Geländedaten und von OSM nennt die Kartenattribution, passend zum
> angezeigten Ausschnitt.
>
> Zur Finanzierung, weil die Frage sicher kommt: Die Karte ist kostenlos und braucht
> kein Konto. Wer das Projekt unterstützt, bekommt die feinsten Zoomstufen und einige
> aufwendigere Funktionen; alle anderen sehen Werbung, die das Projekt selbst
> einbindet – kein Werbenetzwerk, keine Tracker.
>
> Was neu dazukommt, zeigen wir mit Bildern hier: https://en.osm.town/@FreemapSlovakia
> Quellcode: https://github.com/FreemapSlovakia
>
> Viele Grüße
> Martin
