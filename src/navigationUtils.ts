export function navigate(query: string) {
  const url = new URL(document.location.href);

  const sp = new URLSearchParams(url.hash.slice(1));

  new URLSearchParams(query).forEach((value, key) => {
    if (['show', 'tip', 'document'].includes(key)) {
      sp.delete('show');

      sp.delete('tip');

      sp.delete('document');
    }

    if (value) {
      sp.set(key, value);
    } else {
      sp.delete(key);
    }
  });

  url.hash = sp.toString();

  const stringUrl = url.toString();

  // replacing is because of serializeQuery in urlProcessor.ts
  history.pushState(undefined, '', stringUrl.replace(/%2F/gi, '/'));

  // notify location change handler
  window.dispatchEvent(
    new PopStateEvent('popstate', { state: { sq: stringUrl } }),
  );
}
