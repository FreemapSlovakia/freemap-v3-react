# Czechia — outreach working file

Live working state for the Czech push. Conventions as in
[`promotion-italy.md`](./promotion-italy.md) and
[`promotion-austria.md`](./promotion-austria.md): disclose affiliation in every post;
never re-introduce Freemap where it is already known; premium named only where a post
headlines a gated feature; **ask people plainly to try it** ("I'm not here to advertise
— please try it, and tell me where it's wrong for your area"); do not revive threads
that are years old, except a still-active index thread.

Read [`product-and-market.md`](./product-and-market.md) before writing copy.

## Why Czechia

- **National high-resolution terrain exists** — DMR 5G (ČÚZK), so the terrain hook is
  honest here, unlike Germany. Czechia also has its own detailed shading layer (`8`)
  and parametric shading (`z`), and aerial `Z` covers `cz` alongside `sk`.
- **Czech UI shipped**, high Matomo engagement already.
- Martin reads and writes Czech, so copy needs no translation round trip.

## The competitive reality: Mapy.com is entrenched

Mapy.com (Seznam) is excellent, free, app-first and culturally default in Czechia.
**Do not pitch Freemap as a replacement for it at home** — that argument is lost before
it starts, and Czech forums will say so.

## The angle — stated as our property, never as their gap

Czechs walk and ride the Tatras, the Slovak ranges, the Alps and the Balkans, and the
useful fact is that **Freemap covers 46 European countries with national high-resolution
terrain in 16 of them** — so planning abroad works the same as planning at home. Lead
with that, plus the workbench.

**Do not frame it as "Mapy stops at the border".** An early draft did, citing a 2020
nakole post by *Favorit1970* who went looking because Mapy.cz had no previews on the
Slovak side. Martin rejected it (2026-09-16), rightly: Mapy.com has changed a great deal
since — it has just shipped abandoned railway lines, among other things — and a stale
claim about a competitor invites a public correction that costs more than the argument
was worth. **State what Freemap has; say nothing about what anyone else lacks.**

## Warm channels found

| Venue | State |
|---|---|
| **nakole.cz** — new topic ✅ **POSTED 2026-09-16** | https://www.nakole.cz/diskuse/31509-outdoorova-mapa-a-planovac-teren-z-narodnich-vyskovych-modelu.html — rubric *Cestování na kole*. The old *Mapy na Internetu III.* index thread could not be used — it is **full**: replying returns *"Byl překročen maximální počet povolených příspěvků k jednomu tématu… založte si, prosím, nové téma."* Its real last posts are **July 2024** — an earlier note here claimed July 2026, which was wrong: those dates came from the sidebar classifieds, not the thread. No *Mapy na Internetu IV.* exists. The other relevant threads are dead too: *Plánovač tras – doporučte* ended 2019, *Jakou navigaci* 2020, *GPS* 2008. **Do not found "Mapy na Internetu IV." ourselves** — starting the successor to a community institution, as a zero-post member, with a post about our own map, is what regulars remember badly. A plain new topic in a normal rubric is the right move instead, and is what the forum's own error message tells you to do. |
| **bike-forum.cz** | Largest Czech MTB/road forum, and Freemap is known there — *Mapy.cz versus Topo Czech V4* mentions it ten times, plus `wiki.freemap.sk/FileDownload` (2021) and *"Slováci na freemap.sk mají proxy na heatmap"* (2023). **But its map threads are stale too**: newest relevant post May 2024 (*Plánování cyklo trasy v Komoot a Mapy.cz*), so under the thread-age rule they cannot be revived. A fresh thread is possible; check the forum's overall activity first. Registration `/registrace` needs a **maths question + reCAPTCHA** — Martin must do it. |
| **geocaching.cz** | Already lists freemap.sk tiles as a GME map source (28+ page thread), plus `geocaching.cz/wiki/Free_mapy_(garmin)`. Warm, and a different audience. |
| `treking.cz`, `horydoly.cz`, `mtbs.cz`, `turistika.cz` | Editorial sites, not forums — these are **embed/partnership targets**, not places to post. Turistika.cz has ~60 k Facebook followers. |

## The Strava heatmap — answered, and how to handle it

Czech cyclists partly know Freemap **for the Strava heatmap overlay** (bike-forum.cz,
2023: *"Slováci na freemap.sk mají proxy na heatmap co nevyžaduje přihlášení"*).

**It was removed in June 2026 for licensing reasons** — displaying it was not compatible
with Strava's API terms. Publicly announced, so link the announcement rather than
re-explaining:
https://en.osm.town/@FreemapSlovakia/116738960588819696

> *"We've removed the Strava heatmap layer from Freemap — displaying it on our site
> wasn't compatible with Strava's API terms. It was useful for many of you and we're
> sorry to see it go, but fair data and licensing matters more to us. Tracing paths from
> Strava into OpenStreetMap is still fine — done in your editor (iD, JOSM) with your own
> Strava account."*

**Raise it proactively in any post aimed at Czech cyclists.** They remember Freemap
partly *for* that layer; being told by a third party that it's gone reads as a bait and
switch, whereas saying it first — with the licensing reason — is the same credibility
move that worked with Bergmax's bug.

**What is left of Strava: the login provider only.** The track import announced on
2026-06-10 (https://en.osm.town/@FreemapSlovakia/116725974216618148) is **also dead** —
do not offer it, and do not link that announcement. Nothing in the repository references
it any more.

Strava remains as a login/connect provider (`src/features/auth/popupOAuthProviders.ts`),
and only on **`www.freemap.sk`** — Strava's single API app accepts just that callback
domain (`AuthProviders.tsx:103`, `isProviderAvailable`). Disconnecting works everywhere.

**So there is no Strava replacement to offer Czech cyclists.** Say the heatmap is gone,
say why, and move on to what the map does have. Do not soften it with a substitute that
does not exist.

### Side-finding: `llms.txt` is stale on login providers

**Fixed 2026-09-16.** `llms.txt` listed only Apple, Facebook, Google, OpenStreetMap and
Garmin; the code (`src/features/auth/model/types.ts`) also has **github, strava,
microsoft**. Added, with the note that Strava login works only on `www.freemap.sk`.

Historic criticism also worth knowing, from the same forums: Latin-1 encoding losing
Czech diacritics (almost certainly the old Garmin export, worth verifying before anyone
raises it), and "hard to tell path types apart" — the same complaint Garabombo made
about `highway=track` vs path in Italy.

## Verdict: start a new topic on nakole.cz

An earlier version of this section said not to. **That was wrong**, and the reasoning was
inconsistent with our own evidence:

- The **hikr Small Talk post** was itself a cold new thread from a zero-post account,
  replying to nothing — and it is the most successful post of the campaign (five people
  engaged, a tracked bug, a swisstopo endorsement). The framing did the work, not the
  existence of a prior thread.
- nakole's own software **instructs** you to start one when a topic fills:
  *"založte si, prosím, nové téma."*
- **The forum is busy**: the discussion index carries posts dated 4–14 September 2026,
  i.e. daily. Only the *map* threads went quiet, which is an opportunity rather than a
  warning — nobody has had anything new to say about maps there since 2024.

What remains true: the old threads themselves must not be revived (thread-age rule), and
the post must use the framing that has worked everywhere — disclosure, something
genuinely useful, and a plain request to try it and report what is wrong.

## Next steps, revised

1. **Czech Facebook groups** — the likeliest home of the conversation now. Martin finds
   the group names inside Facebook far faster than the agent can from outside, and
   **Martin posts** (Facebook fights automation; the Polish group post that worked went
   out from his own account).
2. **Czech outdoor media, for the embed partnership** — Turistika.cz (~60 k followers),
   Horydoly.cz, Časopis Cykloturistika, treking.cz, mtbs.cz. These serve the revenue
   constraint rather than user numbers, which is the tighter of the two.
3. **The Locus Map community** — Czech, map-tool users, and Freemap already exports for
   Locus, so they are allies rather than competitors. **Not yet checked** — do this
   before bike-forum.
4. bike-forum.cz only with a fresh thread, and only after confirming the forum is busy.
5. Log posted rows in the roadmap's Outreach log.

**Competitive note found on the way:** Mapy.cz has shipped a view of **abandoned railway
lines** (Živě.cz article linked from the nakole thread) — exactly what Cristiano asked
for in issue #41, open since January. Worth knowing before a Czech asks.

## Draft CZ-1 — **POSTED 2026-09-16**

https://www.nakole.cz/diskuse/31509-outdoorova-mapa-a-planovac-teren-z-narodnich-vyskovych-modelu.html

Rubric *Cestování na kole*. Countries tagged: Česko, Slovensko, Rakousko, Polsko,
Německo, Itálie, Švýcarsko, Slovinsko, Chorvatsko, Maďarsko — **not all 46**. That field
feeds the forum's destination filter, so tagging every covered country would push the
post into the browse list of people looking for trips to Portugal or Norway; from a
first-time poster that reads as tag-stuffing. Ten countries Czechs actually ride to is
honest and defensible. (Germany is in the list even though it has no national DTM — the
post never claims it does.)

### nakole.cz posting mechanics — save the next session the hour this cost

- **"Založit nové téma"** is `javascript:void(0)` calling `noveTema()`; the composer then
  loads in a **same-origin iframe** whose `name` starts with `cbox`, src `/diskuse/nove-tema/`.
  Nothing is reachable from the top-level document — go through
  `iframe.contentDocument`.
- Fields: `temaId` (rubric select; **12 = Cestování na kole**, 1 = Technické rady,
  15 = MTB a krosová kola, 4 = Ostatní – cyklo), `zemeId[]` (**mandatory** multi-select —
  submitting without it fails with a red *"Vyberte zemi"*), `subjekt` (title), `text`.
- **Hard limit 2 000 characters**, counted live as *"Znaků: n/2000"*. Over-length text is
  silently truncated mid-sentence when pasted. Budget for it: the version first written
  was 2 280 and had to be cut.
- Existing topics fill up and then refuse replies: *"Byl překročen maximální počet
  povolených příspěvků k jednomu tématu."*

### What actually went out

Differs from the first draft in three ways Martin asked for, all worth carrying forward:

1. **Route colorize was cut.** "Obvious from the map, and a common thing — Mapy.com has
   it too." Do not spend copy on features competitors also have; spend it on what is
   distinctive.
2. **Facebook and Mastodon links added** alongside freemap.eu.
3. **More of the application named**, using the app's own Czech labels so a reader can
   find each one: *Objekty (POI)*, *Fotografie*, *Moje mapy*, *Vlastní mapy*, *Panorama*,
   *Viditelnost odsud*, plus import/export, offline, and high-quality printing with DPI.

> **Titulek:** Outdoorová mapa a plánovač — terén z národních výškových modelů, 46 zemí
>
> Ahoj všichni,
>
> na Freemapu se podílím, takže to berte podle toho — ale myslím, že sem patří.
>
> Freemap je outdoorová mapa nad daty OpenStreetMap, projekt slovenské komunity OSM.
> Zdarma, otevřený zdroj, uživatele nesledujeme.
>
> TERÉN z národních výškových modelů, ne z globálního třicetimetrového: pro Česko z DMR 5G
> (ČÚZK), dále Slovensko, Rakousko, Itálie, Švýcarsko, Polsko, Francie — celkem 16 zemí.
> Jsou vidět rokle, staré úvozy, terénní hrany a zbytky cest. Mapa pokrývá 46 evropských
> zemí, takže se s ní plánuje stejně doma jako na dovolené.
> Sněžka: https://www.freemap.eu/#map=15/50.7359/15.7404&layers=X
> Vysoké Tatry: https://www.freemap.eu/#map=15/49.1640/20.1330&layers=X
>
> ZNAČENÉ CESTY v barvě svého značení (OSM tag osmc:symbol), s číslem i názvem.
>
> PLÁNOVAČ s profily pěšky / turistika / kolo / MTB / gravel / silnice / e-bike /
> kočárek / auto / motorka. Výškový profil se zoomuje a jde z něj vybrat úsek a zjistit
> převýšení a sklon.
>
> DÁL:
> - Objekty (POI) — hledání podle kategorie: studánky, rozhledny, přístřešky…
> - Fotografie — komunitní fotky v mapě, i geotagované z Wikimedia Commons
> - Moje mapy — vlastní kresba, poznámky a trasy; sdílení i offline
> - Vlastní mapy — vlastní WMS/TMS vrstvy
> - Panorama — 360° pohled z modelu terénu s názvy vrcholů
> - Viditelnost odsud — co je z bodu vidět
> - Import/úprava GPX/KML/TCX, export pro Garmin, Locus, OsmAnd
> - Stažení výřezu mapy pro offline
> - Tisk ve vysoké kvalitě — PDF/SVG/PNG, volitelné DPI, s vrstevnicemi a stínováním
> - Srážkový radar
> - Nativní appka pro iOS i Android, od září s offline navigací v telefonu
>
> Financuje se z příspěvků uživatelů a z vlastních reklam v mapě — žádná reklamní síť,
> uživatele nesledujeme; kdo podporuje, reklamy nevidí.
>
> Zkuste to — a kdyby něco pro vaše okolí nesedělo, napište.
>
> https://www.freemap.eu
> FB: https://www.facebook.com/FreemapSlovakia
> Mastodon: https://en.osm.town/@FreemapSlovakia

<details><summary>Superseded first draft (kept for the reasoning)</summary>

**Posture: promotion, not a feedback request.** Earlier drafts opened humbly and closed
by inviting critique; that is what produced five conversations about rendering defects on
hikr — excellent QA, but not growth. Lead with what the map does well; keep the feedback
ask to one closing clause. Disclosure stays, one line, without apology.

**Never argue from a competitor's weakness.** An earlier draft referred to a 2020 post
here about Mapy.cz lacking previews on the Slovak side. Dropped: Mapy.com has changed a
great deal since (abandoned railway lines shipped recently, among others), a stale claim
invites a public correction, and the credibility cost is immediate. State what Freemap
has; say nothing about what anyone else does not.

> **Titulek:** Outdoorová mapa a plánovač — terén z národních výškových modelů, 46 zemí
>
> Ahoj všichni,
>
> na Freemapu se podílím, takže to berte podle toho — ale myslím, že sem patří.
>
> Freemap je outdoorová mapa nad daty OpenStreetMap, projekt slovenské komunity OSM.
> Zdarma, otevřený zdrojový kód, uživatele nesledujeme.
>
> **Terén z národních výškových modelů**, ne z globálního třicetimetrového: pro Česko
> z DMR 5G (ČÚZK), dále Slovensko, Rakousko, Itálie, Švýcarsko, Polsko, Francie a další —
> celkem 16 zemí, jinde globální model. Jsou vidět rokle, staré úvozy, terénní hrany
> a zbytky cest. Mapa pokrývá 46 evropských zemí, takže se s ní plánuje stejně doma jako
> na dovolené.
> · Sněžka — https://www.freemap.eu/?lang=cs#map=15/50.735900/15.740400&layers=X
> · Vysoké Tatry — https://www.freemap.eu/?lang=cs#map=15/49.164000/20.133000&layers=X
>
> **Značené cesty** se kreslí barvou svého značení (OSM tag `osmc:symbol`), s číslem
> i názvem.
>
> **Plánovač** s profily pěšky / turistika / kolo / MTB / gravel / silnice / e-bike /
> kočárek / auto / motorka. Trasu si obarvíte podle sklonu, povrchu, typu cesty, stupně
> lesní cesty nebo obtížnosti (SAC, MTB) — vidíte, kde to začne být nepříjemné, ještě než
> tam vyjedete. Výškový profil se zoomuje a jde z něj vybrat úsek a zjistit jeho
> převýšení a sklon.
>
> **A co s tím dál:** import a úprava GPX/KML/TCX, export pro Garmin, Locus a OsmAnd,
> stažení výřezu mapy pro offline, tisk do PDF/SVG/PNG, vlastní WMS/TMS vrstvy, srážkový
> radar, 360° panorama z modelu terénu. Nativní aplikace pro iOS i Android, od září
> s offline navigací počítanou přímo v telefonu.
>
> Projekt se financuje z příspěvků uživatelů a z vlastních reklam v mapě — žádná reklamní
> síť, uživatele nesledujeme, a kdo projekt podporuje, reklamy nevidí. Na prohlížení
> mapy, plánování ani export to potřeba není.
>
> **Zkuste to** — a kdyby něco pro vaše okolí nesedělo, napište; rendering je náš
> a opravujeme.
>
> https://www.freemap.eu
> Co přibývá, ukazujeme s obrázky tady: https://en.osm.town/@FreemapSlovakia

</details>

**Not mentioned deliberately:** the Strava heatmap. Removed June 2026 over Strava's API
terms; Czech *cyclists* on bike-forum knew Freemap partly for it, but raising it
unprompted in an introduction would be odd. Have the answer ready if asked.

## Next after this

Watch the thread for replies. Then: Czech Facebook groups (Martin posts), the Locus Map
community, the outdoor-media embed pitch, and bike-forum.cz with a fresh thread.
**Reddit** is the other open direction — r/openstreetmap first, then r/MapPorn with an
image-led post; it needs an aged account, and it punishes self-promotion far harder than
any of these forums.
