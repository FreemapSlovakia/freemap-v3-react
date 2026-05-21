---
name: translate-missing
description: Translate `TODO translate`-marked keys from generated locale files into the corresponding `*.template.*` files. Use when the user asks to fill in missing translations, finish translating a language, or process TODO translate markers.
user-invocable: true
allowed-tools:
  - Read
  - Edit
  - Write
  - Grep
  - Glob
  - Bash
---

# /translate-missing

Translate keys marked `/* TODO translate; non-english translations: ... */` from the generated locale files into the matching `*.template.*` files.

## Background

`pnpm sync-language-files` (driven by `translation-manager/sync-language-files.ts` and `translation-manager/templates.json`) regenerates the plain locale files from `en` plus each `*.template.*` file. Any key that is in `en` but missing from a `<lang>.template.*` gets emitted into the generated file with a `TODO translate` block comment that includes the English value and any sibling-language translations as hints. The `*.template.*` files are the source of truth; the plain files are gitignored and overwritten on each sync.

Files governed by the sync (see `translation-manager/templates.json`):

- `src/osm/osmTagToNameMapping-{LANG}.ts`
- `src/translations/{LANG}.tsx`
- `src/features/supportUsModal/translations/{LANG}.tsx`

Languages: `cs`, `hu`, `it`, `sk`, `de`, `pl`. The English source is `{file}-en.{ext}` / `{LANG}=en` (no `.template`); it has every key and is what the templates fall back to via `DeepPartialWithRequiredObjects<Messages>`.

## Steps

1. Run `pnpm sync-language-files` to make sure the TODO markers reflect the current state.
2. For each generated file (`src/osm/osmTagToNameMapping-<lang>.ts`, `src/translations/<lang>.tsx`, `src/features/supportUsModal/translations/<lang>.tsx`), find blocks of the form:

   ```
   /* TODO translate; non-english translations:
    * sk: 'Predvolený'
    * cs: 'Výchozí'
    */
   default: 'Route default',
   ```

   The block carries everything needed to translate: the English value (the last line) and any sibling translations. Translate into `<lang>` using both as context — don't blindly copy the Slovak.

   Note: generated `*.tsx` / `*.ts` files are listed in `.gitignore`, so the default `Grep` tool will not find them. Use `grep -c "TODO translate" src/translations/<lang>.tsx` (or `awk`) directly via `Bash` to scan and extract blocks.

3. For each TODO key, add the translation to the matching `*.template.*` file at the same path inside the messages tree:

   - Locate the parent object in the template by searching for sibling keys that already exist (the English source shows you which siblings to look for).
   - Use the shape-spread / object-literal style already in the file. Add the new key alongside existing siblings.
   - If a parent object exists as `{}` or is missing entirely, fill it in / create it. Some sections (e.g. `gallery.stats`, `wikimediaCommons`) are empty placeholders in some templates.
   - If a top-level section is missing (e.g. `access`, `emergency`, `entrance` in OSM mappings), add it at the same place where sibling sections sit.

4. After editing, re-run `pnpm sync-language-files` and confirm the touched `<lang>` generated files have **zero** remaining `TODO translate` markers:

   ```
   pnpm sync-language-files
   grep -c "TODO translate" src/translations/<lang>.tsx src/osm/osmTagToNameMapping-<lang>.ts src/features/supportUsModal/translations/<lang>.tsx
   ```

5. Run `npx biome check --write` on every template you touched. The project enforces Biome formatting + import order.
6. **Do not commit.** Per project policy, leave the working tree dirty until the user approves.

## Notes

- Edit the `.template.*` files only. Never edit the plain generated files — they are regenerated.
- `en.tsx` / `osmTagToNameMapping-en.ts` are the masters; English strings only ever change there.
- Keep translations natural for the target language. The Slovak hint is usually close to the intended phrasing, but Italian/German/Hungarian translations should match the rest of that template's style, not mirror Slavic word order.
- Quoting: single quotes, trailing commas — match what Biome / the surrounding file already uses.
- Run the skill once per language, or batch all languages together — either is fine; the verification step (`grep -c`) covers both.

Arguments passed: `$ARGUMENTS` — optional list of languages to focus on (e.g. `pl cs`). If empty, process all six.
