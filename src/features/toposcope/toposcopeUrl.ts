import { type ToposcopeState, toposcopeInitialState } from './model/reducer.js';

type ToposcopeUrlState = Omit<ToposcopeState, 'pickingCenter'>;

/**
 * The dial's own settings as one `\x1e`-separated field string, in the same
 * shape as the drawing style params. Field codes: `R` inner circle radius, `O`
 * outer circle radius, `S` scale, `U` prevent upturned text, `A` and `B` the
 * two ray line templates, and `0`–`3` the four inscriptions.
 *
 * Only what differs from the defaults is written, so an untouched dial adds
 * nothing to the URL. Codec and parser sit together because they have to agree
 * exactly — the round trip is what makes a copied link reproduce the dial.
 */
export function serializeToposcope(state: ToposcopeState): string {
  const d = toposcopeInitialState;

  const fields: string[] = [];

  if (state.innerCircleRadius !== d.innerCircleRadius) {
    fields.push(`R${state.innerCircleRadius}`);
  }

  if (state.outerCircleRadius !== d.outerCircleRadius) {
    fields.push(`O${state.outerCircleRadius}`);
  }

  if (state.scale !== d.scale) {
    fields.push(`S${state.scale}`);
  }

  if (state.preventUpturnedText !== d.preventUpturnedText) {
    fields.push(`U${state.preventUpturnedText ? 1 : 0}`);
  }

  if (state.line1 !== d.line1) {
    fields.push(`A${state.line1}`);
  }

  if (state.line2 !== d.line2) {
    fields.push(`B${state.line2}`);
  }

  for (const [i, inscription] of state.inscriptions.entries()) {
    if (inscription !== d.inscriptions[i]) {
      fields.push(`${i}${inscription}`);
    }
  }

  return fields.join('\x1e');
}

/**
 * Reads that string back. Absent fields keep their default, so what a link
 * doesn't say is what an untouched dial shows — and a field that isn't a number
 * is treated as absent rather than turning the dial into NaN geometry.
 */
export function parseToposcope(s: string): ToposcopeUrlState {
  const d = toposcopeInitialState;

  const out: ToposcopeUrlState = {
    inscriptions: [...d.inscriptions],
    innerCircleRadius: d.innerCircleRadius,
    outerCircleRadius: d.outerCircleRadius,
    scale: d.scale,
    preventUpturnedText: d.preventUpturnedText,
    line1: d.line1,
    line2: d.line2,
  };

  for (const field of s.split('\x1e')) {
    if (!field) {
      continue;
    }

    const code = field[0]!;

    const value = field.slice(1);

    if (code === 'R') {
      const radius = Number(value);

      // The inner circle has to leave room for the rays, which start at it.
      if (Number.isFinite(radius) && radius >= 0 && radius <= 80) {
        out.innerCircleRadius = radius;
      }
    } else if (code === 'O') {
      const radius = Number(value);

      // Inside the circle the inscriptions curve along, and clear of the middle.
      if (Number.isFinite(radius) && radius >= 30 && radius <= 98) {
        out.outerCircleRadius = radius;
      }
    } else if (code === 'S') {
      const scale = Number(value);

      if (Number.isFinite(scale) && scale >= 25 && scale <= 400) {
        out.scale = scale;
      }
    } else if (code === 'U') {
      out.preventUpturnedText = value !== '0';
    } else if (code === 'A') {
      out.line1 = value;
    } else if (code === 'B') {
      out.line2 = value;
    } else if (code >= '0' && code <= '3') {
      out.inscriptions[Number(code)] = value;
    }
  }

  return out;
}
