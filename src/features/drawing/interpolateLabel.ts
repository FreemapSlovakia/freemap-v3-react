/**
 * Expands `{key}` in a label from the feature's properties, so a label can say
 * `{name}` rather than hold a copy of the name — edit the property and every
 * label drawn from it follows.
 *
 * A key that isn't there is left standing as written. Blanking it instead would
 * quietly swallow a typo, and would eat a label that happens to contain braces
 * for reasons of its own; left alone, `{nmae}` says plainly what is wrong.
 *
 * Only a key the values object owns counts, so `{toString}` reads as a property
 * nobody set rather than as the source of what every object inherits.
 *
 * Callers may pass values beyond the stored properties — the toposcope adds the
 * `{d}`/`{location}` it computes per ray — so this takes a plain value map
 * rather than reading the feature itself.
 */
export function interpolateLabel(
  label: string,
  values: Record<string, string | undefined> | undefined,
): string {
  if (!values || !label.includes('{')) {
    return label;
  }

  return label.replace(/\{([^{}]*)\}/g, (whole, key: string) => {
    if (!Object.hasOwn(values, key)) {
      return whole;
    }

    return values[key] ?? whole;
  });
}

/** Whether a label asks for a key, so a caller can tell it apart from one that doesn't. */
export function labelUsesKey(label: string | undefined, key: string): boolean {
  return label?.includes(`{${key}}`) ?? false;
}
