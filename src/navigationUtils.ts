export function navigate(searchParams: URLSearchParams) {
  const url = new URL(document.location.href);

  const sp = url.searchParams;

  searchParams.forEach((value, key) => {
    if (value) {
      sp.set(key, value);
    } else {
      sp.delete(key);
    }
  });

  url.search = sp.toString();

  const stringUrl = url.toString();

  // replacing is because of serializeQuery in urlProcessor.ts
  history.pushState(undefined, '', stringUrl.replace(/%2F/gi, '/'));

  // notify location change handler
  window.dispatchEvent(
    new PopStateEvent('popstate', { state: { sq: stringUrl } }),
  );
}
