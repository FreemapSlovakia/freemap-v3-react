/** Matches a static `import` of another module — see below. */
const STATIC_IMPORT =
  /(?:^|[^.$\w])import\s*(?:[^;]{0,400}?\bfrom\s*)?["'][^"']+["']/;

/**
 * Prepares maplibre-gl's prebuilt worker for emission as a raw asset: drops the
 * `.map` reference, since maplibre's source maps aren't emitted.
 *
 * The worker is self-contained. If a future version splits a sibling module out
 * again, this errors out: the specifier sits inside an asset the bundler treats
 * as opaque bytes, so nothing else would rewrite it to the emitted name.
 */
export default function maplibreWorkerLoader(source) {
  if (STATIC_IMPORT.test(source)) {
    this.emitError(
      new Error(
        'maplibre-gl worker imports another module — rework the worker asset wiring.',
      ),
    );

    return source;
  }

  return source.replace(/\n?\/\/# sourceMappingURL=.*$/m, '');
}
