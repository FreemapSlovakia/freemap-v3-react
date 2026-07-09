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

The set of governed files is **not** fixed — read it from `translation-manager/templates.json` (`.templates[]`, each carrying a `{LANG}` placeholder) so this skill stays correct as feature folders are added. The English source is `{file}-en.{ext}` / `{LANG}=en` (no `.template`); it has every key and is what the templates fall back to via `DeepPartialWithRequiredObjects<Messages>`.

### Which languages

Do **not** hardcode the language list — it grows. The canonical codes are the `languages` tuple in `src/shared/langUtils.ts`, re-exported through `src/features/mainMenu/components/languageItems.ts`; `en` is the master and is never a translation target. The sync iterates exactly `translation-manager/templates.json`'s `.langs[]`, which must match. List the current targets with:

```
jq -r '.langs[]' translation-manager/templates.json
```

If `$ARGUMENTS` names specific languages, process only those; otherwise process every code from the command above.

## Steps

1. Run `pnpm sync-language-files` to make sure the TODO markers reflect the current state.
2. For each language, expand its generated files from `templates.json` and scan them for TODO blocks. Generated `*.tsx` / `*.ts` files are gitignored, so the `Grep` tool won't see them — go through `Bash`:

   ```
   # every generated file for <lang> that still has TODO markers, with counts
   jq -r '.templates[]' translation-manager/templates.json \
     | sed 's/{LANG}/<lang>/' \
     | xargs grep -c "TODO translate" 2>/dev/null \
     | grep -v ':0$'
   ```

   Blocks look like:

   ```
   /* TODO translate; non-english translations:
    * sk: 'Predvolený'
    * cs: 'Výchozí'
    */
   default: 'Route default',
   ```

   The block carries everything needed: the English value (the last line) and any sibling translations. Translate into `<lang>` using both as context — don't blindly copy the Slovak.

3. For each TODO key, add the translation to the matching `*.template.*` file at the same path inside the messages tree:

   - Locate the parent object in the template by searching for sibling keys that already exist (the English source shows which siblings to look for).
   - Use the shape-spread / object-literal style already in the file. Add the new key alongside existing siblings.
   - If a parent object exists as `{}` or is missing entirely, fill it in / create it. Some sections (e.g. `gallery.stats`, `wikimediaCommons`) are empty placeholders in some templates.
   - If a top-level section is missing (e.g. `access`, `emergency`, `entrance` in OSM mappings), add it where sibling sections sit.

4. After editing, re-run `pnpm sync-language-files` and confirm the touched languages have **zero** remaining `TODO translate` markers. Reuse the scan from step 2 — an empty result means done:

   ```
   pnpm sync-language-files
   jq -r '.templates[]' translation-manager/templates.json \
     | sed 's/{LANG}/<lang>/' \
     | xargs grep -c "TODO translate" 2>/dev/null | grep -v ':0$' || echo "clean"
   ```

5. Run `npx biome check --write` on every template you touched. The project enforces Biome formatting + import order.
6. **Do not commit.** Per project policy, leave the working tree dirty until the user approves.

## Notes

- Edit the `.template.*` files only. Never edit the plain generated files — they are regenerated.
- `en.tsx` / `osmTagToNameMapping-en.ts` etc. are the masters; English strings only ever change there.
- Keep translations natural for the target language. The Slovak hint is usually close to the intended phrasing, but Italian/German/Hungarian/French translations should match the rest of that template's style, not mirror Slavic word order. For distant targets with no close sibling in the hint set (e.g. `fr`, whose nearest is Italian), review more carefully.
- Quoting: single quotes, trailing commas — match what Biome / the surrounding file already uses.
- Run the skill once per language or batch several together — either is fine; the verification scan covers both.

Arguments passed: `$ARGUMENTS` — optional space-separated list of languages to focus on (e.g. `pl cs`). If empty, process every sync target (see "Which languages").
