/**
 * Where the first link to the app in the text leads, as a path on this origin
 * (either portal, or a local dev server); null when the text holds none.
 */
export function freemapLinkTarget(text: string): string | null {
  for (const [candidate] of text.matchAll(/https?:\/\/\S+/g)) {
    let url: URL;

    try {
      // Without the punctuation of the sentence the link ends.
      url = new URL(candidate.replace(/[.,;:!?)\]}'"»]+$/, ''));
    } catch {
      continue;
    }

    if (
      /^(www\.|local\.)?freemap\.(sk|eu)$/.test(url.hostname) &&
      (url.search || url.hash)
    ) {
      return url.pathname + url.search + url.hash;
    }
  }

  return null;
}
