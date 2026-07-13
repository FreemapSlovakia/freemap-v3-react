import { objectToURLSearchParams } from '@shared/stringUtils.js';
import z from 'zod';
import type { GalleryLicense } from './licenseDefs.js';

/**
 * CC component signatures (version stripped) that map onto our license set.
 * An older CC version (2.0/2.5/3.0) shares its badge and tooltip with the 4.0
 * sibling that has the same components — only the version shown in the name and
 * the link differ. No-Derivatives (`nd`) combos have no freemap equivalent.
 */
const CC_SIGNATURE_MAP: Record<string, GalleryLicense> = {
  by: 'CC-BY-4.0',
  'by-sa': 'CC-BY-SA-4.0',
  'by-nc': 'CC-BY-NC-4.0',
  'by-nc-sa': 'CC-BY-NC-SA-4.0',
};

/**
 * Maps a Commons machine-readable license (e.g. `cc-by-sa-3.0`, `cc0`) onto our
 * license set by its CC components, ignoring the version. Returns undefined for
 * licenses we don't model (public domain, GFDL, any No-Derivatives variant), so
 * the viewer falls back to the plain Commons name + link.
 */
function toFreemapLicense(key: string | undefined): GalleryLicense | undefined {
  if (!key) {
    return undefined;
  }

  if (key === 'cc0' || key === 'cc-zero') {
    return 'CC0-1.0';
  }

  // Strip the trailing version, plus any jurisdiction/port suffix on older
  // ported licenses (e.g. `cc-by-sa-3.0-de`, `cc-by-2.0-fr`).
  const signature = key.replace(/^cc-/, '').replace(/-\d[\d.]*(-[a-z]+)?$/, '');

  return CC_SIGNATURE_MAP[signature];
}

// Wikimedia Commons `extmetadata` values are either a plain string or a
// language-keyed map; pick the best match for the UI language.
const ExtMetaValueSchema = z.union([
  z.string(),
  z.record(z.string(), z.unknown()),
  z.undefined(),
]);

type ExtMetaValue = z.infer<typeof ExtMetaValueSchema>;

function pickLang(value: ExtMetaValue, language: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value[language] === 'string') {
    return value[language] as string;
  }

  if (typeof value['en'] === 'string') {
    return value['en'] as string;
  }

  for (const [k, v] of Object.entries(value)) {
    if (k !== '_type' && typeof v === 'string') {
      return v;
    }
  }

  return undefined;
}

function stripHtml(html: string | undefined): string | undefined {
  if (!html) {
    return undefined;
  }

  // Parse into an inert document instead of assigning `innerHTML` on a live
  // element. An inert `DOMParser` document has no browsing context, so it never
  // runs scripts, loads resources, or fires event handlers — untrusted Commons
  // markup like `<img src=x onerror=…>` can't execute. (`innerHTML` wouldn't run
  // a `<script>`, but it WOULD fire `onerror`/`onload`, even on a detached node.)
  const doc = new DOMParser().parseFromString(html, 'text/html');

  // Drop the chrome Commons wraps a caption in. `<style>`/`<script>` text would
  // otherwise be spliced in by `textContent` (the raw-CSS leak); the template
  // boilerplate (info/location/assessment tables, message banners) renders as
  // `<table>` or `.mw-message-box`, whereas captions are plain/inline text — so
  // drop those structural blocks rather than naming individual templates.
  for (const el of doc.querySelectorAll(
    'style, script, table, .mw-message-box',
  )) {
    el.remove();
  }

  // Drop hidden nodes so their text isn't spliced in — Commons date fields
  // append a machine-readable microformat as `<div style="display:none">…</div>`.
  for (const el of doc.querySelectorAll('[style]')) {
    if (el instanceof HTMLElement && el.style.display === 'none') {
      el.remove();
    }
  }

  return doc.body.textContent?.trim() || undefined;
}

/**
 * The `Artist` field is usually HTML with a link to the author's user page, e.g.
 * `<a href="//commons.wikimedia.org/wiki/User:Foo">Foo</a>`. Extract the plain
 * name plus the (absolute) profile URL, if any.
 */
function parseArtist(html: string | undefined): {
  name?: string;
  url?: string;
} {
  if (!html) {
    return {};
  }

  // Inert parse (see stripHtml) — never executes scripts/handlers from the
  // untrusted Commons markup.
  const doc = new DOMParser().parseFromString(html, 'text/html');

  const name = doc.body.textContent?.trim() || undefined;

  let url = doc.querySelector('a')?.getAttribute('href') ?? undefined;

  if (url?.startsWith('//')) {
    url = `https:${url}`;
  } else if (url?.startsWith('/')) {
    url = `https://commons.wikimedia.org${url}`;
  } else if (url && !/^https?:\/\//i.test(url)) {
    // The URL is rendered as a link, so reject any non-http(s) scheme (e.g.
    // `javascript:`) that would be an XSS vector when clicked.
    url = undefined;
  }

  return { name, url };
}

const ExtMetaFieldSchema = z
  .object({ value: ExtMetaValueSchema.optional() })
  .optional();

const ResponseSchema = z.object({
  query: z
    .object({
      pages: z
        .array(
          z.object({
            pageid: z.number(),
            title: z.string(),
            imageinfo: z
              .array(
                z.object({
                  // Original dimensions (from iiprop=size), used to detect a
                  // full equirectangular 360 panorama by its exact 2:1 ratio.
                  width: z.number().optional(),
                  height: z.number().optional(),
                  thumburl: z.string().optional(),
                  thumbwidth: z.number().optional(),
                  thumbheight: z.number().optional(),
                  descriptionurl: z.string().optional(),
                  extmetadata: z
                    .object({
                      ImageDescription: ExtMetaFieldSchema,
                      Artist: ExtMetaFieldSchema,
                      License: ExtMetaFieldSchema,
                      LicenseShortName: ExtMetaFieldSchema,
                      LicenseUrl: ExtMetaFieldSchema,
                      // The capture/creation date ("Date" on Commons), same
                      // field the map colorize keys on — not `DateTime`, which
                      // is the file's modification/upload time.
                      DateTimeOriginal: ExtMetaFieldSchema,
                    })
                    .optional(),
                }),
              )
              .optional(),
          }),
        )
        .optional(),
    })
    .optional(),
});

export interface WikimediaMeta {
  title?: string;
  imageUrl?: string;
  width?: number;
  height?: number;
  descriptionUrl?: string;
  description?: string;
  artist?: string;
  artistUrl?: string;
  license?: string;
  licenseUrl?: string;
  /**
   * The Commons license mapped onto our own set by its CC components (any
   * version) — lets the viewer render the same badge + tooltip as freemap
   * photos while still showing the real version name and link. Undefined for
   * licenses we don't model (public domain, GFDL, No-Derivatives), where the
   * viewer falls back to the plain Commons name + link.
   */
  freemapLicense?: GalleryLicense;
  dateTime?: string;
  /**
   * True when the original image is exactly 2:1 — a full equirectangular 360
   * panorama. Commons 360s (e.g. Mapillary uploads) carry no GPano/XMP, so the
   * dimensions are the only signal; the strict 2:1 test avoids wrapping an
   * ordinary wide crop into a distorted sphere.
   */
  pano?: boolean;
  /** A width-capped 2:1 thumbnail URL to feed pannellum (only set when pano). */
  panoUrl?: string;
}

/**
 * Commons only renders (and only allows direct hotlinking to) thumbnails at
 * these standard bucket widths; a non-standard width like 2560 is rejected with
 * an error page. Descending so we can pick the largest that fits.
 * See https://www.mediawiki.org/wiki/Common_thumbnail_sizes
 */
const STANDARD_THUMB_WIDTHS = [
  3840, 1920, 1280, 960, 500, 330, 250, 120, 60, 40, 20,
];

/**
 * Largest standard bucket width that doesn't upscale the original — big enough
 * for a sharp 360, small enough to download quickly. 3840 (the top bucket) for
 * any real panorama.
 */
function panoThumbWidth(originalWidth: number): number {
  return (
    STANDARD_THUMB_WIDTHS.find((w) => w <= originalWidth) ??
    STANDARD_THUMB_WIDTHS.at(-1)!
  );
}

/**
 * Smallest standard bucket that covers `targetWidth` without upscaling past the
 * original — for the viewer's display image. Commons rejects direct hotlinks to
 * non-bucket widths, and cache hits are far likelier on a common bucket, so we
 * snap rather than request an arbitrary size. Falls back to the largest bucket
 * that fits when the target exceeds every bucket the original can supply.
 */
function displayThumbWidth(targetWidth: number, originalWidth: number): number {
  const capped = Math.min(targetWidth, originalWidth);

  for (let i = STANDARD_THUMB_WIDTHS.length - 1; i >= 0; i--) {
    const w = STANDARD_THUMB_WIDTHS[i];

    if (w >= capped && w <= originalWidth) {
      return w;
    }
  }

  return panoThumbWidth(originalWidth);
}

/**
 * The Commons image URL to display at a given device-pixel width, snapped to a
 * standard thumbnail bucket. Rescaling the fetched `imageUrl` (already a direct
 * upload.wikimedia.org thumb) lets the viewer pick a bucket per render — small
 * in the modal, larger in fullscreen — without re-querying the API.
 */
export function wikimediaImageUrl(
  meta: WikimediaMeta,
  targetWidth: number,
): string | undefined {
  if (!meta.imageUrl || !meta.width) {
    return meta.imageUrl;
  }

  return scaleThumbUrl(
    meta.imageUrl,
    displayThumbWidth(targetWidth, meta.width),
  );
}

/**
 * Fetches a Wikimedia Commons photo's display thumbnail and attribution
 * (author, license, description) straight from the Commons API — image bytes and
 * licensing always come from Wikimedia, never proxied through our server.
 */
export async function fetchWikimediaMeta(
  pageId: number,
  language: string,
  width: number,
  signal?: AbortSignal,
): Promise<WikimediaMeta | null> {
  const res = await fetch(
    'https://commons.wikimedia.org/w/api.php?' +
      objectToURLSearchParams({
        origin: '*',
        action: 'query',
        format: 'json',
        formatversion: '2',
        pageids: String(pageId),
        prop: 'imageinfo',
        iiprop: 'size|url|extmetadata',
        iiurlwidth: String(width),
        iiextmetadatafilter:
          'ImageDescription|Artist|License|LicenseShortName|LicenseUrl|DateTimeOriginal',
        iiextmetadatamultilang: '1',
        iiextmetadatalanguage: language,
      }),
    { signal },
  );

  if (!res.ok) {
    return null;
  }

  const page = ResponseSchema.parse(await res.json()).query?.pages?.[0];

  const ii = page?.imageinfo?.[0];

  if (!ii) {
    return null;
  }

  const meta = ii.extmetadata;

  const artist = parseArtist(pickLang(meta?.Artist?.value, language));

  const licenseKey = pickLang(meta?.License?.value, language)?.toLowerCase();

  // Commons file title (e.g. "Foo_castle.jpg") — strip the "File:" prefix.
  const fileName = page.title.replace(/^File:/, '');

  // A full equirectangular 360 panorama is exactly 2:1; nothing else on Commons
  // marks these (no GPano/XMP), so the dimensions are the only signal.
  const pano =
    ii.width !== undefined &&
    ii.height !== undefined &&
    ii.width === ii.height * 2;

  return {
    title: fileName,
    imageUrl: ii.thumburl,
    // Original dimensions (from iiprop=size), used to cap display/pano
    // thumbnails so we never request a bucket wider than the source.
    width: ii.width,
    height: ii.height,
    descriptionUrl: ii.descriptionurl,
    description: stripHtml(pickLang(meta?.ImageDescription?.value, language)),
    artist: artist.name,
    artistUrl: artist.url,
    license: stripHtml(pickLang(meta?.LicenseShortName?.value, language)),
    licenseUrl: pickLang(meta?.LicenseUrl?.value, language),
    freemapLicense: toFreemapLicense(licenseKey),
    // Capture/creation date, matching the map's colorize source. Same viewer
    // handling as before: parsed when possible, else shown verbatim.
    dateTime: stripHtml(pickLang(meta?.DateTimeOriginal?.value, language)),
    pano,
    // Point pannellum at a width-capped 2:1 thumbnail rather than the multi-MB
    // original (the display thumbnail is too low-res for immersive 360). Built
    // by rescaling the API's `thumburl` — a direct upload.wikimedia.org URL that
    // sends CORS headers, which pannellum's WebGL texture load requires. The
    // Special:FilePath redirect would be simpler but its 302 carries no CORS.
    panoUrl:
      pano && ii.thumburl
        ? scaleThumbUrl(ii.thumburl, panoThumbWidth(ii.width!))
        : undefined,
  };
}

/**
 * Rescales a Commons thumbnail URL to a new width. Upload thumb URLs end in
 * `/<N>px-<filename>`; swap `<N>`. Falls back to the input if it doesn't match
 * (e.g. an unexpected URL shape), so the caller still gets a usable image.
 */
function scaleThumbUrl(thumburl: string, width: number): string {
  return thumburl.replace(/\/\d+px-([^/]*)$/, `/${width}px-$1`);
}
