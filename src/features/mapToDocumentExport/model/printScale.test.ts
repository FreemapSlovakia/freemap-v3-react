import { describe, expect, it } from 'vitest';
import { type Bbox, type PrintInput, resolvePrint } from './printScale.js';

// Around 48.7° N, a few kilometres across.
const BBOX: Bbox = [19.0, 48.65, 19.1, 48.75];

const LIMITS = {
  minZoom: 5,
  maxZoom: 20,
  minDpi: 60,
  maxDpi: 960,
  maxPxPerMapPx: 10,
};

const BASE: PrintInput = {
  zoom: 15,
  paper: null,
  dpi: 96,
  px: null,
  locked: [],
};

function run(input: Partial<PrintInput>) {
  return resolvePrint(BBOX, { ...BASE, ...input }, LIMITS);
}

function resolve(input: Partial<PrintInput>) {
  const r = run(input);

  if (!r.ok) {
    throw new Error(`invalid ${r.invalid}`);
  }

  return r;
}

describe('resolvePrint', () => {
  it('prints a zoom at its own scale while the paper follows it', () => {
    const { print, derived } = resolve({});

    expect(derived).toBe('px');
    expect(print.enlargement).toBe(1);
    expect(print.denominator).toBeCloseTo(11_900, -2);
    expect(print.px.width).toBe(print.mapPx.width);
  });

  it('treats print width as the same choice as scale', () => {
    const byScale = resolve({ paper: { by: 'scale', value: 25_000 } }).print;

    const byCm = resolve({
      paper: { by: 'cm', value: byScale.cm.width },
    }).print;

    expect(byCm.denominator).toBeCloseTo(25_000);
  });

  it('changes DPI for a typed image size while the rest is unlocked', () => {
    const { print, derived } = resolve({
      dpi: 200,
      px: 5000,
      locked: ['px'],
    });

    expect(derived).toBe('dpi');
    expect(print.px.width).toBe(5000);
    expect(print.enlargement).toBe(1);
  });

  it('changes the scale for a new image size when DPI is locked', () => {
    const { print, derived } = resolve({
      dpi: 200,
      px: 5000,
      locked: ['dpi', 'px'],
    });

    expect(derived).toBe('paper');
    expect(print.dpi).toBe(200);
    expect(print.cm.width).toBeCloseTo((5000 / 200) * 2.54);
  });

  it('flags the field that cannot be satisfied', () => {
    expect(run({ zoom: 3 })).toEqual({ ok: false, invalid: 'zoom' });

    expect(run({ paper: { by: 'scale', value: 0 } })).toEqual({
      ok: false,
      invalid: 'paper',
    });

    // A tiny scale at 960 DPI: far past 10 image pixels per map pixel.
    expect(
      run({ paper: { by: 'scale', value: 1000 }, dpi: 960, locked: ['paper'] }),
    ).toMatchObject({ ok: false, invalid: 'paper' });

    // A width needing a DPI below 60, which is still shown.
    const tooFew = run({ px: 10, locked: ['px'] });

    expect(tooFew).toMatchObject({ ok: false, invalid: 'dpi' });
    expect(tooFew.print?.dpi).toBeLessThan(60);
  });
});
