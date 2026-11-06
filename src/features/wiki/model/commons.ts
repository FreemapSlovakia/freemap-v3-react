import {
  parseArtist,
  STANDARD_THUMB_WIDTHS,
  scaleThumbUrl,
  stripHtml,
} from '@features/gallery/wikimediaMeta.js';
import { objectToURLSearchParams } from '@shared/stringUtils.js';
import z from 'zod';
import type { GetJson } from './article.js';

export interface CommonsImage {
  title: string;
  /** The original's size. */
  width: number;
  height: number;
  /** A thumbnail URL, whose width `thumbnailUrl` rewrites. */
  thumbUrl: string;
  /** Vector, so rendered at any width without upscaling. */
  vector: boolean;
  pageUrl: string;
  /** The description's first sentence, else the file name. */
  caption: string;
  artist?: string | undefined;
  /** The author's page, http(s) only. */
  artistUrl?: string | undefined;
  license?: string | undefined;
  licenseUrl?: string | undefined;
}

const MetaValueSchema = z.object({ value: z.unknown() }).optional();

const PagesSchema = z.object({
  query: z
    .object({
      pages: z.array(
        z.object({
          title: z.string(),
          imageinfo: z
            .array(
              z.object({
                width: z.number(),
                height: z.number(),
                thumburl: z.string(),
                descriptionurl: z.string(),
                mime: z.string(),
                extmetadata: z
                  .object({
                    ImageDescription: MetaValueSchema,
                    Artist: MetaValueSchema,
                    LicenseShortName: MetaValueSchema,
                    LicenseUrl: MetaValueSchema,
                  })
                  .optional(),
              }),
            )
            .optional(),
        }),
      ),
    })
    .optional(),
});

// The smallest bucket worth showing, so `thumburl` is a rescalable thumb.
const THUMB_WIDTH = 120;

/** The smallest standard thumbnail at least `width` wide, else the widest there is. */
export function thumbnailUrl(image: CommonsImage, width: number): string {
  // Commons renders no bitmap thumbnail as wide as its original.
  const buckets = STANDARD_THUMB_WIDTHS.filter(
    (w) => image.vector || w < image.width,
  );

  const bucket = buckets.findLast((w) => w >= width) ?? buckets[0];

  return bucket ? scaleThumbUrl(image.thumbUrl, bucket) : image.thumbUrl;
}

const CATEGORY_LIMIT = 20;

const CAPTION_LENGTH = 150;

/** The visible text of a metadata value, as the gallery viewer shows it. */
function plainText(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  // Most short values are plain text, not worth a parse.
  const text = value.includes('<') ? (stripHtml(value) ?? '') : value;

  return text.replace(/\s+/g, ' ').trim();
}

/** A description's first sentence, else the file name. */
export function captionOf(html: unknown, title: string): string {
  const clean = plainText(html);

  if (!clean) {
    return title.replace(/^File:/, '').replace(/\.[a-z0-9]+$/i, '');
  }

  const sentence = /^.+?[.!?](?=\s|$)/.exec(clean)?.[0] ?? clean;

  return sentence.length > CAPTION_LENGTH
    ? `${sentence.slice(0, CAPTION_LENGTH).replace(/\s+\S*$/, '')}…`
    : sentence;
}

async function query(
  get: GetJson,
  language: string,
  params: Record<string, string>,
): Promise<CommonsImage[]> {
  const data = PagesSchema.parse(
    await get(
      'https://commons.wikimedia.org/w/api.php?' +
        objectToURLSearchParams({
          origin: '*',
          action: 'query',
          format: 'json',
          formatversion: '2',
          prop: 'imageinfo',
          iiprop: 'url|size|mime|extmetadata',
          iiurlwidth: String(THUMB_WIDTH),
          iiextmetadatafilter:
            'ImageDescription|Artist|LicenseShortName|LicenseUrl',
          iiextmetadatalanguage: language,
          ...params,
        }),
    ),
  );

  return (data.query?.pages ?? []).flatMap(({ title, imageinfo }) => {
    const ii = imageinfo?.[0];

    if (!ii?.mime.startsWith('image/')) {
      return [];
    }

    const artist = ii.extmetadata?.Artist?.value;

    const { name, url } = parseArtist(
      typeof artist === 'string' ? artist : undefined,
    );

    return [
      {
        title,
        width: ii.width,
        height: ii.height,
        thumbUrl: ii.thumburl,
        vector: ii.mime === 'image/svg+xml',
        pageUrl: ii.descriptionurl,
        caption: captionOf(ii.extmetadata?.ImageDescription?.value, title),
        artist: name,
        artistUrl: url,
        license:
          plainText(ii.extmetadata?.LicenseShortName?.value) || undefined,
        licenseUrl:
          typeof ii.extmetadata?.LicenseUrl?.value === 'string'
            ? ii.extmetadata.LicenseUrl.value
            : undefined,
      },
    ];
  });
}

/** A file title as Commons normalises it, without its namespace. */
function fileName(title: string): string {
  const name = title
    .replace(/^File:/i, '')
    .replaceAll('_', ' ')
    .trim();

  return name.charAt(0).toUpperCase() + name.slice(1);
}

/** Thumbnails of the named files first, then of the category's files. */
export async function fetchCommonsImages(
  get: GetJson,
  files: string[],
  category: string | undefined,
  language: string,
): Promise<CommonsImage[]> {
  const [named, inCategory] = await Promise.all([
    files.length
      ? query(get, language, {
          titles: files
            .slice(0, 50)
            .map((f) => (/^File:/i.test(f) ? f : `File:${f}`))
            .join('|'),
        })
      : [],
    category
      ? query(get, language, {
          generator: 'categorymembers',
          gcmtitle: /^Category:/i.test(category)
            ? category
            : `Category:${category}`,
          gcmtype: 'file',
          gcmlimit: String(CATEGORY_LIMIT),
        })
      : [],
  ]);

  // `titles` answers in its own order, not the order asked, and normalised.
  const order = files.map(fileName);

  const rank = (image: CommonsImage) => {
    const i = order.indexOf(fileName(image.title));

    return i === -1 ? order.length : i;
  };

  named.sort((a, b) => rank(a) - rank(b));

  const seen = new Set(named.map((i) => i.title));

  return [...named, ...inCategory.filter((i) => !seen.has(i.title))];
}

const COMMONS_URL =
  /^https?:\/\/commons\.(?:m\.)?wikimedia\.org\/wiki\/((?:File|Category):[^?#]+)/i;

/** Commons files and a category named by OSM's `wikimedia_commons` and `image`. */
export function commonsFromTags(tags: Record<string, string>): {
  files: string[];
  category: string | undefined;
} {
  const files: string[] = [];

  let category: string | undefined;

  // A Commons title may contain `;`, so only `image` is split, as the tags table does.
  const parts = [
    ...(tags['wikimedia_commons'] ? [tags['wikimedia_commons']] : []),
    ...(tags['image']?.split(';') ?? []),
  ];

  for (const part of parts) {
    let value = part.trim();

    const m = COMMONS_URL.exec(value);

    if (m) {
      try {
        value = decodeURIComponent(m[1]!).replaceAll('_', ' ');
      } catch {
        // A stray `%`: not a link to anything.
        continue;
      }
    }

    if (/^File:/i.test(value)) {
      files.push(value);
    } else if (/^Category:/i.test(value)) {
      category ??= value;
    }
  }

  return { files, category };
}
