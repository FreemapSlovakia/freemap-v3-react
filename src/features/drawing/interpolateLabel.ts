import { renderTemplate } from './renderTemplate.js';

/** The prefix that reaches the feature's own properties, as `{p:name}`. */
export const PROPERTY_PREFIX = 'p:';

/**
 * Expands a label: `{key}` from the feature's values, `[…]` around a part that
 * is written only when everything inside it has something to say. See
 * `renderTemplate` for the language; this is where a drawing's own rules for
 * what a key may name live.
 *
 * A key the values don't answer is left standing as written. Blanking it would
 * quietly swallow a typo, and would eat a label that happens to contain braces
 * for reasons of its own; left alone, `{nmae}` says plainly what is wrong.
 *
 * Only a key the values object owns counts, so `{toString}` reads as a value
 * nobody set rather than as the source of what every object inherits.
 *
 * Callers may pass values beyond the stored properties — the toposcope adds the
 * `{location}` it computes per ray — so this takes a plain value map rather
 * than reading the feature itself.
 */
export function interpolateLabel(
  label: string,
  values: Record<string, string | undefined> | undefined,
): string {
  if (!values) {
    return label;
  }

  return renderTemplate(label, (key) => {
    if (Object.hasOwn(values, key)) {
      return values[key] ?? '';
    }

    // Every `p:` name is one we understand — the feature simply may not carry
    // it. Empty rather than unknown, so `[, born {p:birth}]` can disappear on a
    // feature that has no such property.
    return key.startsWith(PROPERTY_PREFIX) ? '' : undefined;
  });
}
