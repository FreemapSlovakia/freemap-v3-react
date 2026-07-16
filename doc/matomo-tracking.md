# Matomo analytics tracking

Freemap reports usage to a self-hosted **Matomo** instance at `//matomo.freemap.sk/`.
All tracking goes through the global `window._paq` queue (the standard Matomo
command array). The `_paq` push signature is typed in
[`src/shared/types/common.ts`](../src/shared/types/common.ts) — only the command
shapes listed there are allowed.

## Setup & initialization

The tracker is bootstrapped inline in [`src/index.ejs`](../src/index.ejs):

- The `matomo.js` script and tracker are only injected when the
  `MATOMO_SITE_ID` build-time env var is set. Otherwise `window._paq` is a plain
  array stub, so all `_paq.push(...)` calls elsewhere are harmless no-ops.
- Init commands run before any page view:
  - `requireCookieConsent` — nothing is sent until consent is granted.
  - `setCustomUrl('/')` — the SPA reports a single canonical URL rather than
    leaking hash/route state.
  - `enableLinkTracking`.
  - `setCustomDimension(1, 'Embedded' | 'Top')` — **custom dimension 1**
    distinguishes the embedded widget (`window.fmEmbedded`) from the top-level app.
    Configured in Matomo as *Embed Type* (verified live).
  - `setCustomDimension(2, location.hostname)` — **custom dimension 2** records
    the serving domain (see [Domain distinction](#domain-distinction)).
    ⚠️ **Not yet configured in Matomo** — see the warning below; the value is
    currently sent by the client but dropped server-side.

## Domain distinction

The app is served from multiple domains (`www.freemap.eu`, `www.freemap.sk`)
backed by the **same** database, and all of them report into a **single Matomo
site** (`setSiteId` comes from one `MATOMO_SITE_ID`; the tracker is hardcoded to
`//matomo.freemap.sk/`). There is no `setDomains` call.

To tell the domains apart in reports, the serving host is sent as **custom
dimension 2** (`location.hostname`) — client push added in the 2026-06 pass. Note
that `setCustomUrl('/')` flattens the
reported page URL to a bare `/`, so the hostname is *not* otherwise reliably
available — events in particular carry no URL of their own — which is why the
explicit dimension is needed.

> **⚠️ Matomo-side requirement — currently unmet.** Custom dimension 2 must be
> created in the Matomo admin (Visit scope) with index `2`, or the value is
> silently dropped. As of 2026-07-04 only dimension 1 (*Embed Type*, Embedded/Top)
> exists in Matomo — the report list exposes `idDimension=1` but no
> `idDimension=2`, so the hostname the client sends is being **discarded**.
> Domain distinction will not work until the dimension is created there.

### Cookie consent

- [`src/app/index.tsx`](../src/app/index.tsx) — on startup, if consent was
  previously stored (`cookieConsent.cookieConsentResult`), it pushes
  `setCookieConsentGiven`. For non-embedded, non-robot first-time visitors with
  no stored decision, the consent toast is shown.
- [`src/features/cookieConsent/model/processor.ts`](../src/features/cookieConsent/model/processor.ts)
  — pushes `setCookieConsentGiven` when the user accepts.

### User identity & page views

[`src/features/auth/model/processors/authInitProcessor.ts`](../src/features/auth/model/processors/authInitProcessor.ts)
reacts to login/logout (`state.auth.user?.id`):

- Logged in → `setUserId(<id>)`; logged out → `resetUserId`.
- Then `trackPageView`, then `appendToTrackingUrl('')`.

This is effectively the only `trackPageView`, since the SPA does not navigate
between pages in the traditional sense.

## Tracked events

All events use the Matomo `trackEvent` command with the shape
`['trackEvent', category, action, name?, value?]`.

The **Previous** column records the pre-2026-06 `category`/`action` so old
Matomo data can still be found. The names were standardized in a single dated
cutover (see [Naming convention](#naming-convention)); **Matomo does not
aggregate across the rename**, so a metric that spans the cutover must be summed
from both the old and new identities.

| Category | Action | Name (low-cardinality) / value | Previous (historical) | Source |
|----------|--------|--------------------------------|-----------------------|--------|
| `Ad` | `impression` / `click` | ad id (`tShirt`/`rovas`/`self`/`zdilaAuthorship`/`zdilaMapNative`) | *(added 2026-07)* | [`Ad.tsx`](../src/features/ad/components/Ad.tsx) |
| `App` | `error` | `error.name` (e.g. `TypeError`); deduped + capped per page load | `Main`/`error` — *dropped Sentry event id (high cardinality)* | [`globalErrorHandler.ts`](../src/app/store/middleware/globalErrorHandler.ts) |
| `Perf` | `stall` / `storm` / `longtask` | `document.visibilityState` (`visible`/`hidden`/…) | *(added 2026-06)* | [`perfWatchdog.ts`](../src/app/store/middleware/perfWatchdog.ts) |
| `Auth` | `login` | `login` or `connect` (linking an extra provider) | *(added 2026-06)* | [`loginResponseHandler.ts`](../src/features/auth/model/processors/loginResponseHandler.ts) |
| `Auth` | `logout` | — | *(added 2026-06)* | [`authLogoutProcessor.ts`](../src/features/auth/model/processors/authLogoutProcessor.ts) |
| `Auth` | `disconnect` | provider | *(added 2026-06)* | [`authDisconnectProcessor.ts`](../src/features/auth/model/processors/authDisconnectProcessor.ts) |
| `Auth` | `deleteAccount` | — | *(added 2026-06)* | [`authDeleteAccountProcessor.ts`](../src/features/auth/model/processors/authDeleteAccountProcessor.ts) |
| `Language` | `set` | language code, or `auto` | *(added 2026-06)* | [`l10n/model/processor.ts`](../src/features/l10n/model/processor.ts) |
| `Location` | `locate` | — *(GPS follow enabled)* | *(added 2026-06)* | [`locateProcessor.ts`](../src/features/location/model/locateProcessor.ts) |
| `Modal` | `open` | modal id (incl. `embed`, `account`, `legend`, `support-us`, `map-preferences`, …) | *(added 2026-06)* | [`setActiveModalProcessor.ts`](../src/processors/setActiveModalProcessor.ts) |
| `MapShading` | `add` | shading component type (`hillshade-*`/`slope-*`/`color-relief`/`aspect`/`contour`) | *(added 2026-06)* | [`ShadingControl.tsx`](../src/features/parameterizedShading/components/ShadingControl.tsx) |
| `HomeLocation` | `save` | — | *(added 2026-06)* | [`HomeLocationPickingMenu.tsx`](../src/features/homeLocation/components/HomeLocationPickingMenu.tsx) |
| `Osm` | `view` | `node` / `way` / `relation` | *(added 2026-06)* | [`osmLoadNodeProcessor.ts`](../src/features/osm/model/processors/osmLoadNodeProcessor.ts), [`…WayProcessor.ts`](../src/features/osm/model/processors/osmLoadWayProcessor.ts), [`…RelationProcessor.ts`](../src/features/osm/model/processors/osmLoadRelationProcessor.ts) |
| `Tool` | `set` | tool id | `Main`/`setTool` | [`setToolProcessor.ts`](../src/processors/setToolProcessor.ts) |
| `Settings` | `save` | — | `Main`/`saveSettings` | [`saveSettingsProcessor.ts`](../src/processors/saveSettingsProcessor.ts) |
| `Share` | `openExternal` | target (`where`) | `Main`/`openInExternalApp` | [`openInExternalAppProcessor.ts`](../src/features/openInExternalApp/openInExternalAppProcessor.ts) |
| `Map` | `setLayers` | sorted comma-joined layer ids | *(unchanged)* | [`mapTypeGaProcessor.ts`](../src/features/map/model/processors/mapTypeGaProcessor.ts) |
| `Search` | `search` | — | `Search`/`search` — *dropped raw query (PII)* | [`searchProcessor.ts`](../src/features/search/model/processors/searchProcessor.ts) |
| `Objects` | `search` | sorted comma-joined POI filter ids | `Objects`/`search` — *was `\|`-joined* | [`objectsFetchProcessor.ts`](../src/features/objects/model/objectsFetchProcessor.ts) |
| `MapDetails` | `search` | — | *(unchanged)* | [`mapDetailsProcessorHandler.ts`](../src/features/mapDetails/model/mapDetailsProcessorHandler.ts) |
| `Changesets` | `search` | `days` + `byAuthor` (bool) query string | `Changesets`/`set` — *dropped `authorName` (PII)* | [`changesets/model/processor.ts`](../src/features/changesets/model/processor.ts) |
| `RoutePlanner` | `search` | `transportType` + `mode` query string | *(unchanged)* | [`findRouteProcessorHandler.ts`](../src/features/routePlanner/model/processors/findRouteProcessorHandler.ts) |
| `RoutePlanner` | `toggleElevationChart` | — | *(unchanged)* | [`toggleElevationChartProcessor.ts`](../src/features/routePlanner/model/processors/toggleElevationChartProcessor.ts) |
| `TrackViewer` | `toggleElevationChart` | — | `TrackViewer`/`showElevationProfile` | [`trackViewerToggleElevationChartProcessor.ts`](../src/features/trackViewer/model/processors/trackViewerToggleElevationChartProcessor.ts), [`trackViewerResolveElevationPromptProcessor.ts`](../src/features/trackViewer/model/processors/trackViewerResolveElevationPromptProcessor.ts) |
| `Drawing` | `measure` | geometry type — deduped per measured target (not per vertex edit) | *(unchanged)* | [`measurementProcessor.ts`](../src/features/measurement/model/measurementProcessor.ts) |
| `Drawing` | `convertToDrawing` | source (`track`/`planned-route`/`objects`/`search-result`/`changesets`/…) | *(added 2026-06)* | [`convertToDrawingProcessor.ts`](../src/processors/convertToDrawingProcessor.ts) |
| `Gallery` | `showPhoto` | — | `Gallery`/`showPhoto` — *dropped image id* | [`galleryShowImageGaProcessor.ts`](../src/features/gallery/model/processors/galleryShowImageGaProcessor.ts) |
| `Gallery` | `submitComment` | — | `Gallery`/`submitComment` — *dropped image id* | [`gallerySubmitCommentProcessor.ts`](../src/features/gallery/model/processors/gallerySubmitCommentProcessor.ts) |
| `Gallery` | `submitStars` | **value** = star rating | `Gallery`/`submitStars` — *dropped image id from name* | [`gallerySubmitStarsProcessor.ts`](../src/features/gallery/model/processors/gallerySubmitStarsProcessor.ts) |
| `Gallery` | `upload` | — *(once per completed upload batch)* | *(added 2026-06)* | [`galleryItemUploadProcessorHandler.ts`](../src/features/gallery/model/processors/galleryItemUploadProcessorHandler.ts) |
| `Gallery` | `savePhoto` | — *(saved edits to own photo)* | *(added 2026-06)* | [`gallerySavePictureProcessor.ts`](../src/features/gallery/model/processors/gallerySavePictureProcessor.ts) |
| `Gallery` | `deletePhoto` | — | *(added 2026-06)* | [`galleryDeletePictureProcessor.ts`](../src/features/gallery/model/processors/galleryDeletePictureProcessor.ts) |
| `Tracking` | `create` / `update` | `device`, `accessToken`, or `watchedDevice` | `Tracking`/`saveDevice`, `saveAccessToken` (name was `create`/`modify`); `watchedDevice` *(added 2026-06)* | [`trackingDeviceProcessors.ts`](../src/features/tracking/model/processors/trackingDeviceProcessors.ts), [`trackingAccessTokenProcessors.ts`](../src/features/tracking/model/processors/trackingAccessTokenProcessors.ts), [`TrackedDeviceForm.tsx`](../src/features/tracking/components/TrackedDeviceForm.tsx) |
| `DocumentExport` | `export` | format (pdf/svg/png/jpg) | `MapExport`/`export` | [`exportMapToDocument.ts`](../src/features/mapToDocumentExport/model/exportMapToDocument.ts) |
| `FeaturesExport` | `export` | query string of `type` (gpx/geojson), `target` (download/gdrive/dropbox/garmin), sorted `exportables` | `MapFeaturesExport`/`export` *(added 2026-06)* | [`exportMapFeaturesProcessor.ts`](../src/features/mapFeaturesExport/model/processors/exportMapFeaturesProcessor.ts) |
| `OfflineExport` | `export` | query string of `map`/`format`/`scale` | `DownloadMap`/`downloadMapStart` — *was JSON-wrapped* | [`downloadMapProcessorHandler.ts`](../src/features/offlineMapExport/model/downloadMapProcessorHandler.ts) |
| `MapCache` | `start` | cached base-layer id (`sourceType`) | *(added 2026-06)* | [`cacheTilesProcessor.ts`](../src/features/cachedMaps/model/cacheTilesProcessor.ts) |
| `MyMaps` | `create` / `update` / `copy` | — | `MyMaps`/`save` (variant was in name) *(added 2026-06)* | [`mapsSaveProcessor.ts`](../src/features/myMaps/model/processors/mapsSaveProcessor.ts) |
| `MyMaps` | `load` | `replace` or `merge` (only user-initiated, not auth re-validation reloads) | *(added 2026-06)* | [`mapsLoadProcessor.ts`](../src/features/myMaps/model/processors/mapsLoadProcessor.ts) |
| `MyMaps` | `delete` | — | *(added 2026-06)* | [`mapsDeleteProcessor.ts`](../src/features/myMaps/model/processors/mapsDeleteProcessor.ts) |
| `MapSettings` | `create` / `update` / `delete` | `customMap` | `CustomMap`/`create`,`edit`,`delete` *(added 2026-06)* | [`CustomMapsModal.tsx`](../src/features/mapSettings/components/CustomMapsModal.tsx) |
| `Purchase` | `start` / `success` | name = `premium` or `credits`; **value** = credit amount | `Purchase`/`purchaseStart`, `purchaseSuccess` — *was JSON payload* | [`purchaseProcessor.ts`](../src/features/purchases/model/processors/purchaseProcessor.ts) |

## Data quality / known issues

Observed in the live Matomo data (30-day window, verified 2026-07-04):

- **`Drawing`/`measure` no longer floods the dataset** *(fixed 2026-07-04)*.
  `drawingMeasure` re-fires on every vertex add/drag, which previously made it the
  single largest event source (~275k events from ~2.3k visits, ~120/visit, ≈26%
  of *all* events). [`measurementProcessor.ts`](../src/features/measurement/model/measurementProcessor.ts)
  now dedupes consecutive measurements of the same target (`lastMeasureKey`), so
  it fires ≈once per geometry — Goal *Drawing tool* still converts.
- **`App`/`error` is now named and rate-capped** *(fixed 2026-07-04)*. A page in
  an error loop used to emit thousands of nameless events per visit (~29k from
  ~340 visits). [`globalErrorHandler.ts`](../src/app/store/middleware/globalErrorHandler.ts)
  now sends `error.name` (low cardinality, e.g. `TypeError`) as the event name,
  dedupes by name+message, and caps at 25 distinct errors per page load. Sentry
  remains the high-fidelity channel.
- **`Perf` no longer uses a high-cardinality name** *(fixed 2026-07-04)*. It sent
  the free-text `message` (with timing numbers) as the event name, fragmenting the
  report. [`perfWatchdog.ts`](../src/app/store/middleware/perfWatchdog.ts) now
  sends the `document.visibilityState` bucket instead; the full message stays in
  Sentry.
- **Custom dimension 2 (hostname) is now configured** *(fixed 2026-07-04)* — the
  *Hostname* Visit-scope dimension exists at index 2, so the value the client
  sends is recorded (accumulates going forward, not backfilled).
- **Stale clients still emit the pre-cutover `Main` category.** The 2026-06
  rename is not retroactive and old cached SPA bundles (service-worker–served)
  keep sending `Main`/* — ~18k visits in the window, including ~53k `Main`/`measure`.
  This decays as clients update; sum old+new identities for cutover-spanning
  metrics.

Page-level reports (Behaviour → Pages, Entry/Exit, flow, bounce) are effectively
empty by design: `setCustomUrl('/')` collapses every view to a single `/index`
URL and there is one `trackPageView` per visit. In-app navigation is instead
modelled through `Tool`/`set` and `Modal`/`open` events. If page-flow/funnel
features are ever wanted, a coarse **virtual** `setCustomUrl` per tool/modal
(e.g. `/tool/route-planner`, no hash/coords → no PII) would light them up.

## Naming convention

Standardize on this so the scheme doesn't drift again:

- **Category = feature area** (PascalCase), ideally 1:1 with the feature folder.
  No catch-all bucket (`Main` was split into `Tool`, `Settings`, `Share`,
  `App`) and no operation-shaped categories (`DownloadMap` → `OfflineExport`,
  `MapExport` → `DocumentExport`, `CustomMap` → `MapSettings`).
- **Action = lowerCamelCase verb** from a small fixed vocabulary — CRUD
  (`create`, `update`, `delete`, `load`, `copy`) plus `search`, `export`, `set`,
  `toggle…`, `measure`, `upload`, `open…`. Use `update` (never `modify`/`edit`);
  the action must **not** restate the category (so no `purchaseStart` under
  `Purchase` — it's `start`).
- **Slot rule:** the *operation* is the action; its *parameters/variants* go in
  `name`. When one feature acts on several object types, the object goes in
  `name` (`Tracking` → `device`/`accessToken`; `MapSettings` → `customMap`).
- **`name` is for low-cardinality, non-PII tokens only** — enums, sorted id
  lists, boolean-ized flags. Never raw user input (search text, author names),
  per-record ids, or `JSON.stringify`-ed payloads. Encode multi-field names with
  `URLSearchParams` (never JSON or ad-hoc joins). High-cardinality numerics go
  in the **value** slot (e.g. star rating, credit amount).

## Conventions

- Tracking lives in **processors** (the side-effect middleware), not in
  components — consistent with the architecture described in
  [`architecture.md`](./architecture.md). Several processors exist solely to
  track (`*GaProcessor.ts`); others push an event as a side effect of work they
  already do. A few events are tracked in **components** instead, because the
  distinction or the user gesture only exists at the call site and isn't carried
  by a dedicated action: `MapSettings`/`customMap` (funnels through generic
  `saveSettings`), `Tracking`/`watchedDevice`, `HomeLocation`/`save`,
  `MapShading`/`add`, and `Ad`/`impression`+`click` (the rendered ad id and the
  outbound-link gesture only exist in `Ad.tsx`; the `click` is caught via
  `onClickCapture` so it covers the translation-rendered ad variants too).
- Because `_paq` is a typed queue, adding a new event only requires pushing a
  `['trackEvent', …]` tuple from a processor; no registration step.
- Keep this table in sync when you add, remove, or rename a `_paq.push` call,
  and follow the [naming convention](#naming-convention).

## Other analytics on the page

Independent of Matomo, [`src/index.ejs`](../src/index.ejs) also conditionally
loads the **Facebook Pixel** (when `FB_APP_ID` is set). It is not driven through
`_paq` and is not covered by the table above.
