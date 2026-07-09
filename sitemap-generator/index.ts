import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import matter from 'gray-matter';
import htm from 'htm';
import { marked } from 'marked';
import vhtml from 'vhtml';
import { objects } from './objects.js';
import {
  appUrl,
  BASE,
  fileName,
  HUB_LANGS,
  hubs,
  LANGS,
  renderDocument,
  renderHome,
  renderHub,
} from './seo.js';

const html = htm.bind(vhtml);

async function gen() {
  const startedAt = Date.now();

  console.log('Generating sitemap…');

  // Start from a clean output dir: gen only writes, so without this, pages for
  // OSM features deleted since the last run linger and get redeployed (rsync
  // --delete cannot remove them — they still exist locally).
  await rm('../sitemap', { recursive: true, force: true });

  await mkdir('../sitemap', { recursive: true });

  const sitemapNames: string[] = [];

  const out: string[] = [];

  // Homepage, one prerender per UI language (cross-linked via hreflang).
  for (const lang of LANGS) {
    await writeFile(
      `../sitemap/${fileName('layers=X', lang)}`,
      renderHome(lang),
    );

    out.push(appUrl('layers=X', lang));
  }

  console.log(`Homepages: ${LANGS.length} languages`);

  // Layer/tool landing pages (curated copy from llms.txt), sk + en.
  for (const hub of hubs) {
    for (const lang of HUB_LANGS) {
      await writeFile(
        `../sitemap/${fileName(hub.param, lang)}`,
        renderHub(hub, lang),
      );

      out.push(appUrl(hub.param, lang));
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

      await writeFile(
        `../sitemap/${fileName(docParam, lang)}`,
        renderDocument({
          key,
          lang,
          langs,
          xDefaultLang,
          title: typeof data['title'] === 'string' ? data['title'] : key,
          bodyHtml: await marked.parse(content),
        }),
      );

      out.push(appUrl(docParam, lang));

      docCount++;
    }
  }

  console.log(`Document pages: ${docCount} (${docLangs.size} documents)`);

  const name = 'sitemap-core.txt';

  sitemapNames.push(name);

  await writeFile(`../sitemap/${name}`, out.join('\n'));

  await objects(sitemapNames);

  await writeFile(
    '../sitemap/sitemap-index.xml',
    `<?xml version="1.0" encoding="UTF-8"?>` +
      html`
        <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          ${sitemapNames.map(
            (name) =>
              html`<sitemap>
                <loc>${BASE}/sitemap/${name}</loc>
              </sitemap>`,
          )}
        </sitemapindex>
      `,
  );

  console.log(
    `Done in ${((Date.now() - startedAt) / 1000).toFixed(1)}s — ` +
      `${out.length} core URLs, ${sitemapNames.length} sitemap files (sitemap-index.xml written).`,
  );
}

gen().catch((err) => {
  console.error(err);

  // Exit non-zero so `dep-sitemap`'s `&& rsync --delete` does not run on a
  // partial crawl and wipe good pages.
  process.exitCode = 1;
});
