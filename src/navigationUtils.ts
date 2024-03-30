export function navigate(query: string) {
  const url = new URL(document.location.href);

  const sp = new URLSearchParams(url.hash.slice(1));

  new URLSearchParams(query).forEach((value, key) => {
    if (key === 'show' || key === 'tip') {
      sp.delete('show');

      sp.delete('tip');
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
