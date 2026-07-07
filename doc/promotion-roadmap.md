# Freemap.eu foreign-growth roadmap

Goal: grow usage (and premium conversions) outside Slovakia. Data-driven; based on
Matomo (site 1, `www.freemap.sk`) last-365-day country / language / referrer cuts,
July 2026.

## Why these markets

Foreign audience is concentrated in a Carpathian/Alpine ring where three product
assets already line up: localized UI, hi-res LiDAR elevation, and outdoor culture.
Quality is read from **actions/visit + time-on-site**, not raw visits (US ~178k
visits is bots/SEO noise at 3.1 actions / 43s — ignored).

Real engaged foreign markets, best first:
Italy · Poland · Hungary · Austria · Czechia · Germany · Slovenia.

Distinctive positioning hooks (lead with these, not "another OSM map"):
1. Free, open-source, non-commercial, privacy-friendly (no tracking).
2. Hi-res LiDAR terrain + shaded relief + contours ("see every gully and old road").
3. Real offline maps + GPS-device export (Garmin/Locus/OsmAnd) + live tracking.
4. Multi-profile route planning (hike/MTB/ski/horse) with elevation profiles.
Hooks 2–4 are also the premium hooks — users drawn by them convert best.

---

## Phase 0 — Poland activation (in progress: generating hi-res shading + contours)

- [ ] Finish hi-res shading + contours coverage for Poland.
- [ ] Verify Polish hi-res layers render + are premium-gated as intended.
- [ ] Draft Polish-language launch post leading with the new terrain (Tatras, Karkonosze,
      Bieszczady). Polish UI already exists; engagement already high (11.6 actions, 209s).
- [ ] Seed: Polish hiking/MTB forums, big regional FB hiking groups, r/Polska outdoor
      threads, Polish OSM community, Fediverse (pl hiking/OSM hashtags).

## Phase 1 — Localization expansion

- [x] **Slovenian** UI added (highest fit-per-effort: Alpine, hi-res DEM exists, 378s
      engagement) and announced (2026-07-07) to the Slovenian OSM community and the
      hribi.net outdoor community (the latter auto-translates across the hike.uno network,
      so it also reaches IT/DE — see Outreach log).
- [x] **French** UI added (aggregates FR + Belgium + CH-Romandy + LU; Alps/Pyrenees)
      and announced to the French community. Follow-up: broaden to French-speaking
      outdoor communities (Belgium, CH-Romandy, Pyrenees).
- [ ] (Optional) Ukrainian — Carpathians + diaspora.
- [ ] Deferred: Spanish (Spain/LatAm only, peripheral — NOT a pan-Europe lever),
      Dutch (speakers use English UI).
- Note: adding a language is an ongoing cost (new `en.tsx` strings need translating);
  `translate-missing` skill fills `TODO translate` markers to keep the cost low.

## Phase 2 — Italy: cultivate the warm channel (highest-ROI foreign market)

Italy is already sending genuine engaged traffic with zero outreach — Italian trail
sites link organically (camminodelledolomiti.it, avventurosamente.it 9.4 actions/295s,
amicodelpopolo.it), plus a LiDAR/archaeology niche (lidarandaerialarchaeology.com).

- [ ] Partnership/embed pitch (EN + IT) to the Italian trail sites already linking in;
      offer the embed-map widget + attribution.
- [ ] Post in Italian hiking/MTB communities (CAI-adjacent forums, FB groups, subreddits).
- [ ] Lead with hi-res terrain (Dolomites) + offline maps + free/OSS.

## Phase 3 — Broaden community seeding (DE, AT, CZ, HU)

- [ ] Germany — biggest untapped ceiling; German outdoor forums, Wander/MTB subreddits,
      Fediverse. (talk-de intro already done once.)
- [ ] Austria — Alpine, hi-res DEM, 13 actions/visit; Austrian outdoor/ski-touring groups.
- [ ] Czechia + Hungary — reinforce (UI localized, very high engagement already).
- [ ] Emphasize non-OSM channels: hiking/MTB forums, regional FB groups, subreddits,
      Fediverse hashtags — the paying outdoor users, not just mappers.

## Phase 4 — Complete the OSM-community intro-post matrix

The Outreach log below tracks the OSM-community posts (FR/FI/NO/DE/SK done). Add the
markets that actually convert:

- [ ] Italy, Poland, Hungary, Austria, Czechia OSM community intro posts.
- [x] Slovenia — posted 2026-07-07 (see Outreach log).
- Note: OSM forums reach mappers, not end-users — treat as supplementary to Phase 2/3.

## Phase 5 — Measure & iterate

- [ ] Identify which Matomo goal IDs = real premium purchases (goal "revenue" in the
      country report is goal-value, not currency). Then pull paying-users-by-country to
      confirm where money — not just engagement — comes from.
- [ ] After each push, re-check that country's visits + actions/visit + conversions.
- [ ] Feed learnings back into which market/language to do next.

---

## Current UI languages
Slovak, Czech, Hungarian, English, Polish, German, Italian, French, Slovenian.
Missing but relevant: **Ukrainian**.

## Existing promotion channels
groups.google.com/g/osm_sk · en.osm.town/@FreemapSlovakia (Mastodon) · facebook.com/FreemapSlovakia

## Outreach log

Version-controlled record of intro/announcement posts (replaces the old Google Doc).
Add a row per post; keep `—` where the date is unknown rather than guessing.

| Date | Market | Channel | Lang | Status | Link |
|------|--------|---------|------|--------|------|
| 2026-01 | 🇩🇪 Germany | talk-de mailing list | EN | posted | https://lists.openstreetmap.org/pipermail/talk-de/2026-January/118507.html |
| — | 🇫🇷 France | forum.openstreetmap.fr (template source) | FR | posted | https://forum.openstreetmap.fr/t/freemap-eu-carte-outdoor-et-outils-bases-sur-osm-open-source-par-la-communaute-osm-slovaque/40396 |
| — | 🇫🇮 Finland | community.openstreetmap.org | EN | posted | https://community.openstreetmap.org/t/freemap-eu-open-source-osm-based-outdoor-map-tools-by-the-slovak-osm-community-introduction/139943 |
| — | 🇳🇴 Norway | community.openstreetmap.org | EN | posted | https://community.openstreetmap.org/t/freemap-eu-open-source-osm-based-outdoor-map-tools-by-the-slovak-osm-community/139942 |
| — | 🇸🇰 Slovakia | mtbiker.sk forum | SK | posted | https://www.mtbiker.sk/forum/cyklotrasy-navigacia/freemap-sk-openstreetmap-org--35970 |
| 2026-07-07 | 🇸🇮 Slovenia | community.openstreetmap.org (Slovenija) | SL | posted | https://community.openstreetmap.org/t/freemap-eu-odprtokodna-zunanja-karta-in-orodja-na-osnovah-osm-ki-jih-razvija-slovaska-skupnost-osm/145198 |
| 2026-07-07 | 🇸🇮🇮🇹🇩🇪 SI+IT+DE | hribi.net / hike.uno network (auto-translated) | SL | posted | https://www.hribi.net/trenutne_razmere/slo/freemapeu_-_brezplacna_pohodniska_karta_z_lidar_reliefom_zdaj_v_slovenscini/10001/10088 |
| — | 🇸🇮🇫🇷 SL + FR | Mastodon new-languages announcement (@FreemapSlovakia) | EN | posted | https://en.osm.town/@FreemapSlovakia |
