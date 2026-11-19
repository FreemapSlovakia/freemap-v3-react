# Premium, credits and volunteer premium: plan

Where premium and credits are heading, both repos, implemented step by step.
Tick a step when it lands.

## Principles

- **The subscription is for ongoing use** (no ads, premium zooms while browsing,
  radar bands, route options). **Credits are for a bounded need**: a job with a
  result, or a short premium pass.
- **Polar's fixed fee falls on the purchase, not on the use.** Credits are bought
  in top-ups of at least 500 (€5; 100 credits = €1), so spending them costs no
  fees. A time-limited product sold directly through Polar would pay the fixed fee
  on every purchase.
- **Price by tile volume.** Bulk area downloads are what loads the tile servers;
  browsing fetches a fraction of that, and packaging tiles on the server is cheap.

## Area downloads: export vs. device cache

Both start with the user selecting an area, and both pull the whole area from the
tile servers. They differ in who fetches and where the result can go:

|            | Offline map export (`offlineMapExport`)          | Device cache (`cachedMaps`)                   |
| ---------- | ------------------------------------------------ | --------------------------------------------- |
| Fetched by | the API, which packages a file and emails a link | the browser, tile by tile                     |
| Usable in  | any app, any number of devices, indefinitely     | Freemap in this browser, until it evicts them |
| Today      | priced per map (`creditsPerMTile`)               | free; premium zooms need premium              |

The cache is the heavier of the two, yet only export is charged. Proposal: **both
draw on one monthly tile allowance per account, and credits pay beyond it.**

- **Allowance.** Small for a free account, larger with premium. Premium zooms stay
  premium in both, and the 30-day pass (below) unlocks them.
- **The cache downloads through the export pipeline.** The API builds the area as
  a package and the browser unpacks it into the cache. One metered path, fetched
  next to the tile servers in bulk instead of as many separate browser requests.
  The package carries the attribution union the export already records
  (`X-Attribution`), in place of the per-tile `Server-Timing` capture in
  `cacheTilesProcessor.ts`.
- **Login required** to cache beyond what an anonymous visitor may fetch while
  browsing; anonymous bulk fetching stays limited by per-IP rate limits.
- **Price.** Same per-tile rate for both, or a premium on export for the portable
  file (open question).

## Premium pass for credits

A 30-day premium pass for **500 credits**: one minimum top-up buys one month,
which covers the one-off user (a 3D model for printing, a trip abroad) across
every premium feature without per-feature pricing. A 7-day pass is optional and
should be priced above the pro-rata share (e.g. 200).

- API: an endpoint spends the credits and sets
  `premiumExpiration = GREATEST(COALESCE(premiumExpiration, NOW()), NOW()) + 30 days`.
- **A live subscriber is not sold a pass** (as with a second subscription):
  extending only `premiumExpiration` would leave Polar charging on the old date.
- UI: a third option in `PremiumActivationModal`, beside subscription and
  one-time year. It needs a Matomo event, translations, and the `llms-*.md` pricing
  text.

### Periods and trials

- **Only two periods: the year and the 30-day pass.** No quarter or half-year:
  outdoor use is seasonal, so they would mostly replace the year with a summer.
  At about €5, three months of passes cost as much as a year, so a seasonal user
  buys the year. A longer need is met by buying the pass again.
- **No trial.** A card-required Polar trial puts many people off and brings
  renewal edge cases; a cardless one is abused with new accounts. Premium is
  shown instead by previews where a feature is locked (as the 3D model modal does
  with its premium-limits preview), by the pass as a paid trial, and by volunteer
  premium. Reconsider a 7–14-day subscription trial only if Matomo shows many
  premium-modal opens with few purchases.

## Per-job credits (only if the pass leaves a gap)

Charging a non-premium user per job (a high-resolution 3D model, a panorama at
premium range) needs more than the pass:

- **3D model** reads premium elevation tiles in the browser. Charging per area needs an **area grant**: a signed token that allows
  premium tiles within a bbox × max zoom × layers until an expiry, which the tile
  servers verify.
- **Panorama/viewshed** run on the terrain service with the bearer token, so a
  charge per render belongs there.

Build this only if users ask for single jobs that the pass prices badly.

## Premium for volunteer work

Premium starts or extends automatically for contributions: **photos uploaded to
the gallery** and **OSM edits**. Users opt in (and link an OSM account for edits).

### Measuring

- **Photos**: from the gallery DB. A photo counts once it has survived a holding
  period (one evaluation period), so an upload deleted right away earns nothing.
  Requires position and a minimum resolution, and excludes duplicates by hash.
  Photos are CC-licensed by their authors; some are marked premium-only (visible
  to premium users). Open: whether those count, and at what weight.
- **OSM edits**: needs a linked OSM account (`osmId`). The changesets come from
  the OSM API (`/api/0.6/changesets?user=<id>&time=<from>,<to>`). Each is
  inspected via its osmChange (`/api/0.6/changeset/<id>/download`):
  - **Effort score per changeset.** Weighted counts: new tagged features and new
    geometry (ways, nodes added to ways) weigh most, tag changes less, deletions
    least. Plus how long the changeset stayed open.
  - **Capped per changeset**, so one mass edit cannot outscore days of mapping.
  - **Excluded:** changesets tagged `bot=yes` or as an import. Changesets above a
    size threshold go to manual review rather than being scored.
  - **Per day, the scores sum to a class** (none / light / full mapping day). The
    class, not the raw count, earns days, so a single attribute tweak and a
    half-day of mapping come out differently, and splitting changesets gains nothing.
  - Open: whether only edits inside the 46 covered countries count.
- Evaluation runs **monthly** as an API cron job and credits the period before
  last, so deletions and reverts show up first.

### Earning (numbers to be calibrated on real data)

- Days of premium per counted photo and per mapping-day class, with a **cap per
  period** (e.g. at most 31 days earned per month). A steady contributor then keeps
  premium indefinitely, and a burst cannot bank years.

### Granting

- **Without a live subscription** (none, one-time year, Rovas, pass):
  `premiumExpiration = GREATEST(COALESCE(premiumExpiration, NOW()), NOW()) + days`.
- **Live Polar subscriber**: `PATCH /v1/subscriptions/{id}` with
  `current_billing_period_end` moved later by the earned days. Polar then emits
  `subscription.updated`, and the existing webhook lifts `premiumExpiration` via
  `GREATEST`, so no second write is needed. The DB alone must not be extended:
  the renewal charge would come on the old date. Polar refuses the patch for a
  subscription that is not active (e.g. `past_due`); grant those in the DB
  instead.
- **A ledger table** (`userId`, `period`, `source`, `units`, `days`, `appliedVia`)
  with a unique (`userId`, `period`, `source`) makes reruns idempotent and is what
  the account modal shows ("earned this month").
- The user is told by email and in the app (the new notifications section).

## Direct payment by QR code

A second payment channel beside Polar: a bank transfer to the company's Fio
account, paid by scanning a PAY by square code. Polar's terms appoint it a
non-exclusive reseller, so selling outside it is allowed, as long as the flow is
not labelled Polar Checkout.

### Rules (from the accountant)

- **Individuals only.** A company needs an invoice, and from 2027 an e-invoice,
  so companies keep paying through Polar.
- **A receipt per payment is enough**, and it must show the VAT. A refund is the
  same receipt with a negative amount, plus the money sent back.
- **VAT: Slovak 23% for everyone** until direct sales to individuals in other EU
  countries pass €10,000 a year; above that, OSS. Polar's sales do not count
  towards the limit. Record the payer's IBAN country as the evidence of where the
  customer is.
- **No e-kasa** for bank transfers.
- **Bookkeeping costs about €0.10 per account movement** (a refund is a second
  movement), given a monthly **CSV** the accountant converts.
- Needs its own terms of sale and privacy-policy text for the direct sale.

### Economics (€, after VAT, Polar Starter with a non-US card)

| Payment     | Polar keeps for us | QR keeps for us | Difference   |
| ----------- | ------------------ | --------------- | ------------ |
| €15 premium | ≈ 10.70            | ≈ 12.10         | +1.40 (+13%) |
| €5 credits  | ≈ 3.24             | ≈ 3.97          | +0.73 (+22%) |

The smaller the payment, the more QR saves, so it suits credit top-ups and the
pass best.

**Pricing:** a QR payment is **€0.50 cheaper** than the same purchase via Polar
(premium year €14.50). The **minimum credit top-up by QR is €3** (300 credits);
via Polar it stays €5.

**Subscribers.** A subscriber who switches to QR earns us about €1 more per year,
so the only risk is a lapse, and the reminder below covers it. The switch is not
advertised to subscribers. Subscribers on the locked €8 price have no reason to
switch.

**Paying ahead.** A QR premium payment is accepted at any time and adds a year
from the current expiry (`GREATEST(COALESCE(premiumExpiration, NOW()), NOW()) +
1 year`, as Polar's one-time year already does). The exception is a live
auto-renewing Polar subscription: QR is refused there, as the pass is, because
Polar would still charge on the renewal date. A subscription set to cancel at
period end is accepted.

**Reminder.** Premium that does not renew itself (one-time year, QR, Rovas) gets
an email about 30 and 7 days before expiry. It carries the QR code and the
payment details, and paying from it extends the premium immediately, with no gap.

### Building it

- **API:** an order gets a variable symbol and a PAY by square payload. A job
  polls the Fio API (at most one request per 30 s), matches payments by variable
  symbol and amount, then activates premium or adds credits. An underpaid,
  overpaid or unmatched payment goes to manual handling.
- **Receipts** (and refund receipts) are numbered and show the VAT. They are
  emailed to the payer and stored.
- **Monthly CSV for the accountant:** receipt number, date, variable symbol,
  amount, VAT base and VAT, and the payer's country.
- **UI:** a "pay by bank transfer" option beside Polar in the premium and credits
  modals, showing the QR code and the payment details for manual entry. It
  confirms once the payment is matched, and needs a Matomo event.

## Steps

1. [ ] **Premium pass for credits.** API endpoint, subscriber refusal,
       `PremiumActivationModal` option, translations, Matomo, `llms-*.md`.
2. [ ] **Direct payment by QR code.** Orders with a variable symbol, Fio polling
       and matching (an unmatched payment emails the admin), receipts, monthly
       CSV, a UI option in the premium and credits modals, terms and privacy
       text, translations, `llms-*.md`.
3. [ ] **Volunteer premium by hand.** Quarterly, the admin reviews gallery and
       OSM activity and grants premium through the admin endpoint
       (`adminPatchUserHandler`), only to users without a live subscription.

### Later, if data asks for it

- **One tile allowance for export and cache**, the cache downloading through the
  export pipeline. First check the tile-server logs for cache load; a
  per-account rate limit may be enough.
- **Automated volunteer premium:** photos first (a query on our own data), then
  OSM scoring. Ledger, monthly cron, and the Polar period patch once subscribers
  are among the volunteers.
- **Area grants** for per-job credits, if the pass prices single jobs badly.

## Open questions

1. Pass price and length: 30 days for 500 credits, and is a 7-day pass worth having?
2. Tile allowance sizes (free, premium), and whether export costs more per tile
   than cache.
3. Volunteer rates and cap, the OSM score weights and day-class thresholds;
   whether premium-only photos count; whether OSM edits count only in covered
   countries.
4. **Accountant: VAT on premium given for contributions.** Public CC photos and
   OSM edits give the company nothing exclusive, which looks like a promotion.
   Premium-only photos make premium worth more, so premium granted for them is
   closer to a barter, which is a taxable supply at market value. Ask before granting any.
5. **Overlap with Rovas**, which already rewards volunteer work and is accepted
   for premium. Check the share of premium paid via Rovas first; if it is
   marginal, accept the double reward.
6. Polar: whether moving `current_billing_period_end` has side effects (proration,
   emails to the customer). Check in the sandbox.
7. QR credit top-ups: €0.50 off each top-up (17% on €3, 1% on €50), or
   premium-only discount with the lower minimum as the credits' benefit.
