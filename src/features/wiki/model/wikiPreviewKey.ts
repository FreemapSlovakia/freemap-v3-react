import type { WikiPreview } from './actions.js';

/**
 * The `lang:title` key identifying a loaded preview — matches the
 * `wikiLoadPreview` argument and the `show=wiki/<key>` URL form.
 */
export function wikiPreviewKey(preview: WikiPreview): string {
  return `${preview.lang}:${preview.langTitle}`;
}
