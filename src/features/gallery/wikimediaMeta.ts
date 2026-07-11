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

  const tmp = document.createElement('div');

  tmp.innerHTML = html;

  return tmp.textContent?.trim() || undefined;
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

  const tmp = document.createElement('div');

  tmp.innerHTML = html;

  const name = tmp.textContent?.trim() || undefined;

  let url = tmp.querySelector('a')?.getAttribute('href') ?? undefined;

  if (url?.startsWith('//')) {
    url = `https:${url}`;
  } else if (url?.startsWith('/')) {
    url = `https://commons.wikimedia.org${url}`;
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
                      DateTime: ExtMetaFieldSchema,
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
        iiprop: 'url|extmetadata',
        iiurlwidth: String(width),
        iiextmetadatafilter:
          'ImageDescription|Artist|License|LicenseShortName|LicenseUrl|DateTime',
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

  return {
    // Commons file title (e.g. "Foo_castle.jpg"), used as the photo's label —
    // strip the "File:" namespace prefix the API returns.
    title: page.title.replace(/^File:/, ''),
    imageUrl: ii.thumburl,
    width: ii.thumbwidth,
    height: ii.thumbheight,
    descriptionUrl: ii.descriptionurl,
    description: stripHtml(pickLang(meta?.ImageDescription?.value, language)),
    artist: artist.name,
    artistUrl: artist.url,
    license: stripHtml(pickLang(meta?.LicenseShortName?.value, language)),
    licenseUrl: pickLang(meta?.LicenseUrl?.value, language),
    freemapLicense: toFreemapLicense(licenseKey),
    dateTime: stripHtml(pickLang(meta?.DateTime?.value, language)),
  };
}
