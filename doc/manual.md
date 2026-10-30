# User manual

The in-app manual: Info & help → Manual, `#show=manual` (first chapter) or `#show=manual/<chapter>`.

## Files

- `src/manual/<chapter>.<lang>.md` — one file per chapter and language; `<chapter>` is kebab-case and is the URL id, so it never changes. Front matter: `title`, `icon` (a react-icons name from `react-icons/<first two letters>`, without the inline icons' numbered-pack fallback), `order` (100 steps).
- Read by `RspackMarkdownDictPlugin` (the `src/manual` instance in `rspack.config.ts`) into `virtual/manual-dict.js`; `src/manual/index.ts` merges per key with **English fallback**, so a language without a translation shows the English chapter.
- Rendered by `markdown-render.js` — through `markdown-loader.js` for the app, directly for the SEO prerender, which serves each chapter at `?layers=X&manual=<chapter>&lang=<lang>` (see [seo-prerender.md](./seo-prerender.md)) — and shown by `ManualModal.tsx` (chapter list beside the text, a drop-down on a narrow screen).
- Every chapter is a search-box row (`commandDefinitions.tsx`) with keywords under `search.commands.keywords['manual-<chapter>']`.
- Slovak and English are written by hand; other languages fall back. A chapter moved from `src/documents/` keeps the languages it had.

## Writing

- Address the reader formally and follow [translations.md](./translations.md).
- Name a control exactly as the UI labels it — copy from `en.messages.tsx` / `<lang>.template.tsx`, bold for buttons and menu items (**Locate me**, **Kde som?**).
- Don't make things act like persons: a tool, map, button or the app doesn't plan, find, offer, know or remember. Say what it is for or what the reader does with it — "Vyhľadávač trás slúži na naplánovanie trasy", not "Vyhľadávač trás naplánuje trasu"; "the button opens …" is fine for a plain UI effect.
- In Slovak, no gendered pronoun for a thing beyond a plain `ho`/`ju` object — no possessive `jeho`/`jej` and no prepositional `naň`, `na ňu`, `v ňom`, `na nej`, `po ňu`, `zaň`, `ním`: name the thing instead. "Kliknutím na bod ho vyberiete a na lište výberu nájdete …", not "Na jeho lište je …"; "súčty až po túto zastávku", not "až po ňu"; "lišta nástroja", "autor fotky", "územie mapy".
- Say what the reader does and sees, not how it works inside. `llms-*.md` holds the full facts; the manual picks what a user needs.
- `##` headings split a chapter into sections; keep sections short.
- Links: `#show=<modal>`, `#show=manual/<chapter>` and `#show=document/<key>` open in place (`useMarkdownLinks`); the prerender turns the latter two into page URLs, so don't write `#document=`. A link with more than one parameter (`#tool=…&show=`) does nothing — don't use them.
- No emoji: they render in colour and differ per platform.

## Icons

- `:FaBars:` renders that react-icons glyph inline, at build time. Write the icon wherever the UI shows one beside the thing named — a button, menu item, tool, dialog link.
- Use the **same glyph the UI uses**: look it up in the component (`MainMenu.tsx`, `MapControls.tsx`, `LocationActionItems.tsx`, `toolDefinitions.tsx`, `commandDefinitions.tsx`), not by guessing a name.
- A glyph the UI colours takes Bootstrap classes: `:FaSearchPlus.text-warning:`.
- The pack comes from the prefix; a name only in a numbered pack is found too (`IoLanguage` → `io5`). An unknown name fails the build.
- No icon for coloured or bitmap marks (the route start/finish squares, third-party logos) or for browser controls.

## Screenshots

- Never edit images by hand. `node scripts/manual-screenshots.mjs [name…]` captures them from the running dev server (`FM_URL`, default `https://local.freemap.sk:9000`) into `src/manual/images/<name>.<lang>.webp`, every name in every language (`LANGS=sk,en`), each in a fresh browser profile. Retake after a UI change.
- A shot is an entry in the script's `shots`: `hash` (the URL state), optional `steps` (clicks, typing), and `crop` (a selector; the union of what it matches) or, without it, the whole `viewport`.
- Crops get **8 px of the map around them** (`pad`, cut at the viewport edge), so every cropped image has the same margin.
- Captured at 2× (`scale`) for sharp text; `manifest.json` records each image's CSS size and the loader writes it as `width`/`height`, so it shows at real size and doesn't shift the text while loading. Images are centred by `.markdown img`.
- The full-screen shot is 820 × 520: the narrowest viewport where the bottom bar stays on one row.
- A shot marked `mobile` is taken a second time on a touch phone (390 × 760) as `<name>.<lang>.mobile.webp`; the renderer then emits a `<picture>` whose phone-width source (below Bootstrap's `sm`) is that file, so a reader on a phone sees the phone UI instead of a shrunken desktop toolbar. Mark every shot of something the phone lays out differently — toolbars, the search box, the full screen. Chapters reference only the desktop file.
- Toasts (attribution, cookie consent) are hidden by CSS for every shot.
- Images are written to a temp directory and copied in at the end: writing into `src/` mid-run makes the dev server rebuild, and the next page then asks for chunks that aren't there. For the same reason, edit nothing under `src/` while it runs; a shot that fails with "the app did not start" or "nothing matches" usually caught a rebuild — run it again.
- In a chapter: `![Alt text](./images/<name>.<lang>.webp)` — each language file names its own language's image. An image named but not yet captured fails the build ("Module not found"), so capture the shot first.
- WebP quality 85; a full map view costs ~600 KB at 2×, a cropped control 10–40 KB. Images load lazily, when their chapter is opened.

## Moving a document into the manual

1. Move the files to `src/manual/` (all languages they exist in), re-titling and editing them as chapters.
2. Remove the key from `DocumentSchema` (`src/features/documents/model/actions.ts`).
3. Add the old key to `DOCUMENTS_IN_MANUAL` (`src/manual/moved.ts`), so `#document=<key>` and `#show=document/<key>` links open the chapter and the SEO prerender points the old URL at it.
4. Move its keywords from `document-<key>` to `manual-<chapter>`, and update `llms-interface.md`.
