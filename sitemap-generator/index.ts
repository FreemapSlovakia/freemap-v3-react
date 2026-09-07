import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import matter from 'gray-matter';
import htm from 'htm';
import { marked } from 'marked';
import vhtml from 'vhtml';
import { hubs } from './hubs.js';
import { objects } from './objects.js';
import {
  appUrl,
  BASE_EU,
  BASE_SK,
  fileName,
  HUB_LANGS,
  LANGS,
  type Lang,
  renderDocument,
  renderHome,
  renderHub,
} from './seo.js';

const html = htm.bind(vhtml);

/** Write a `<sitemapindex>` listing the given child sitemaps on `base`'s host. */
async function writeSitemapIndex(file: string, base: string, names: string[]) {
  await writeFile(
    `../sitemap/${file}`,
    `<?xml version="1.0" encoding="UTF-8"?>` +
      html`
        <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          ${names.map(
            (name) =>
              html`<sitemap>
                <loc>${base}/sitemap/${name}</loc>
              </sitemap>`,
          )}
        </sitemapindex>
      `,
  );
}

async function gen() {
  const startedAt = Date.now();

  console.log('Generating sitemap…');

  // Start from a clean output dir: gen only writes, so without this, pages for
  // OSM features deleted since the last run linger and get redeployed (rsync
  // --delete cannot remove them — they still exist locally).
  await rm('../sitemap', { recursive: true, force: true });

  await mkdir('../sitemap', { recursive: true });

  // Core (non-POI) URLs and POI sitemap-shard names, split by home domain:
  // freemap.sk hosts sk/cs, freemap.eu hosts every other language.
  const outSk: string[] = [];
  const outEu: string[] = [];
  const skShards: string[] = [];
  const euShards: string[] = [];

  // Route a fully-qualified app URL to its home domain's sitemap.
  const pushUrl = (url: string) =>
    (url.startsWith(BASE_EU) ? outEu : outSk).push(url);

  // A prerender's file name is its query string, so two pages naming the same
  // app state overwrite each other silently while both stay in the sitemap —
  // and `layers=X` is nginx's fallback for every crawler request it cannot
  // match. POI pages are excluded: a feature in two categories legitimately
  // writes the same page twice.
  const written = new Set<string>();

  const writePage = async (param: string, lang: Lang, html: string) => {
    const name = fileName(param, lang);

    if (written.has(name)) {
      throw new Error(`two pages claim the prerender ${name}`);
    }

    written.add(name);

    await writeFile(`../sitemap/${name}`, html);
  };

  // Homepage, one prerender per UI language (cross-linked via hreflang).
  for (const lang of LANGS) {
    await writePage('layers=X', lang, renderHome(lang));

    pushUrl(appUrl('layers=X', lang));
  }

  console.log(`Homepages: ${LANGS.length} languages`);

  // The AI-readable site & URL-parameter reference. Listing it (per domain) gets
  // it crawled and indexed, so it surfaces in search — which is what lets AI
  // assistants (whose fetchers only allow URLs seen in results) reach it.
  outSk.push(`${BASE_SK}/llms.txt`);
  outEu.push(`${BASE_EU}/llms.txt`);

  // Layer/tool/dialog landing pages, curated copy from llms.txt, every language.
  for (const hub of hubs) {
    for (const lang of HUB_LANGS) {
      await writePage(hub.param, lang, renderHub(hub, lang));

      pushUrl(appUrl(hub.param, lang));
    }
  }

  console.log(
    `Hub pages: ${hubs.length * HUB_LANGS.length} (${hubs.length} hubs × ${HUB_LANGS.length} languages)`,
  );

  const documentsDir = '../src/documents';

  // Documents are `<key>.<lang>.md`. The app resolves the right file from the
  // bare `document=<key>` param + the active `&lang=`, so the URL must NOT carry
  // the language suffix. Group files by key to emit per-language hreflang links.
  const docLangs = new Map<string, Lang[]>();

  for (const file of await readdir(documentsDir)) {
    const m = file.match(/^(.+)\.([a-z]{2})\.md$/);

    if (!m) {
      continue;
    }

    const key = m[1];

    const lang = m[2] as Lang;

    if (!LANGS.includes(lang)) {
      continue;
    }

    docLangs.set(key, [...(docLangs.get(key) ?? []), lang]);
  }

  let docCount = 0;

  for (const [key, langs] of docLangs) {
    const docParam = `layers=X&document=${key}`;

    const xDefaultLang: Lang = langs.includes('en')
      ? 'en'
      : langs.includes('sk')
        ? 'sk'
        : langs[0];

    for (const lang of langs) {
      const md = await readFile(`${documentsDir}/${key}.${lang}.md`, 'utf-8');

      // Documents carry a YAML frontmatter `title:`; strip it from the body.
      const { data, content } = matter(md);

      await writePage(
        docParam,
        lang,
        renderDocument({
          key,
          lang,
          langs,
          xDefaultLang,
          title: typeof data['title'] === 'string' ? data['title'] : key,
          bodyHtml: await marked.parse(content),
        }),
      );

      pushUrl(appUrl(docParam, lang));

      docCount++;
    }
  }

  console.log(`Document pages: ${docCount} (${docLangs.size} documents)`);

  await writeFile('../sitemap/sitemap-core.txt', outSk.join('\n'));
  await writeFile('../sitemap/sitemap-core-eu.txt', outEu.join('\n'));

  skShards.push('sitemap-core.txt');
  euShards.push('sitemap-core-eu.txt');

  // Appends each country's POI shard names to the sk or eu list per its domain.
  await objects(skShards, euShards);

  await writeSitemapIndex('sitemap-index.xml', BASE_SK, skShards);
  await writeSitemapIndex('sitemap-index-eu.xml', BASE_EU, euShards);

  console.log(
    `Done in ${((Date.now() - startedAt) / 1000).toFixed(1)}s — ` +
      `${outSk.length + outEu.length} core URLs; ` +
      `sitemap-index.xml (${skShards.length} sk shards), ` +
      `sitemap-index-eu.xml (${euShards.length} eu shards).`,
  );
}

gen().catch((err) => {
  console.error(err);

  // Exit non-zero so `deploy-sitemap`'s `&& rsync --delete` does not run on a
  // partial crawl and wipe good pages.
  process.exitCode = 1;
});
