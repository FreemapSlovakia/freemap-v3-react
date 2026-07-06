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

- [ ] **Slovenian** UI (highest fit-per-effort: Alpine, hi-res DEM exists, 378s
      engagement, no UI yet). Add lang, run `translate-missing` skill, QA.
      Announce to Slovenian OSM + outdoor community as the news hook.
- [ ] **French** UI (aggregates FR + Belgium + CH-Romandy + LU; Alps/Pyrenees).
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

The existing Google Doc covers FR/FI/NO/DE/SK OSM community posts. Add the markets
that actually convert:

- [ ] Italy, Poland, Hungary, Austria, Czechia, Slovenia OSM community intro posts.
- Note: OSM forums reach mappers, not end-users — treat as supplementary to Phase 2/3.

## Phase 5 — Measure & iterate

- [ ] Identify which Matomo goal IDs = real premium purchases (goal "revenue" in the
      country report is goal-value, not currency). Then pull paying-users-by-country to
      confirm where money — not just engagement — comes from.
- [ ] After each push, re-check that country's visits + actions/visit + conversions.
- [ ] Feed learnings back into which market/language to do next.

---

## Current UI languages
Slovak, Czech, Hungarian, English, Polish, German, Italian.
Missing but relevant: **Slovenian, French** (then Ukrainian).

## Existing promotion channels
groups.google.com/g/osm_sk · en.osm.town/@FreemapSlovakia (Mastodon) · facebook.com/FreemapSlovakia
