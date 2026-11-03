import { describe, expect, it } from 'vitest';
import { batchOf, batchPatch, pickedColors } from './batchProperties.js';
import type { FeatureProperties } from './components/FeaturePropertiesModal.js';

const item = (patch: Partial<FeatureProperties>): FeatureProperties => ({
  label: '',
  props: undefined,
  color: '#ff0000',
  markerType: 'pin',
  icon: '',
  type: 'line',
  fillColor: undefined,
  width: 4,
  dashArray: [],
  lineCap: 'round',
  lineJoin: 'round',
  ...patch,
});

describe('batchOf', () => {
  it('shows what the features share, and marks what differs', () => {
    const form = batchOf(
      [],
      [
        item({ label: 'a', props: { name: 'X', ele: '1' } }),
        item({ label: 'b', props: { name: 'X' }, color: '#00ff00' }),
      ],
    )!;

    expect(form.initial.label).toBe('');
    expect(form.initial.props).toEqual({ name: 'X', ele: '' });
    expect([...form.batch.mixed].sort()).toEqual(['color', 'label']);
    expect([...form.batch.mixedKeys]).toEqual(['ele']);
  });

  it('compares a style field only among the features that have it', () => {
    const form = batchOf(
      [item({ markerType: 'square', width: undefined })],
      [item({ width: 6 })],
    )!;

    expect(form.batch.mixed.has('width')).toBe(false);
    expect(form.batch.mixed.has('markerType')).toBe(false);
    expect(form.initial).toMatchObject({ width: 6, markerType: 'square' });
  });

  it('takes the fill from the polygons alone', () => {
    const form = batchOf(
      [],
      [
        item({}),
        item({ type: 'polygon', fillColor: '#00ff0033' }),
        item({ type: 'polygon', fillColor: '#00ff0033' }),
      ],
    )!;

    expect(form.initial).toMatchObject({
      type: 'polygon',
      fillColor: '#00ff0033',
    });
    expect(form.batch.mixed.has('fillColor')).toBe(false);
  });

  it('has nothing to show for no features', () => {
    expect(batchOf([], [])).toBeUndefined();
  });
});

describe('batchPatch', () => {
  const values = item({ label: 'New', color: '#0000ff', width: 9 });

  const none = {
    touched: new Set<never>(),
    rows: [],
    keptKeys: new Set<string>(),
  };

  it('is empty where nothing changes', () => {
    const own = item({ props: { a: '1' } });

    expect(
      batchPatch(own, false, values, {
        ...none,
        rows: [['a', '1', 'a']],
      }),
    ).toEqual({});
  });

  it('carries only the touched fields that come out different', () => {
    expect(
      batchPatch(item({ width: 2 }), false, values, {
        ...none,
        touched: new Set(['color', 'width', 'markerType']),
      }),
    ).toEqual({ color: '#0000ff', width: 9 });

    // Set back to what the feature has: nothing to write.
    expect(
      batchPatch(item({}), false, item({}), {
        ...none,
        touched: new Set(['color']),
      }),
    ).toEqual({});
  });

  it('gives a fill to polygons only', () => {
    const fill = item({ fillColor: '#0000ff33' });

    const patch = (type: 'line' | 'polygon') =>
      batchPatch(item({ type }), false, fill, {
        ...none,
        touched: new Set(['fillColor']),
      }).fillColor;

    expect(patch('polygon')).toBe('#0000ff33');
    expect(patch('line')).toBeUndefined();
  });

  it('applies rows as JOSM does', () => {
    const patch = batchPatch(
      item({ props: { name: 'A', ele: '1', gone: 'x', kept: 'k', c: 'z' } }),
      false,
      values,
      {
        ...none,
        rows: [
          ['name', 'B', 'name'], // overwritten
          ['height', '', 'ele'], // kept, renamed
          ['kept', '', 'kept'], // kept
          ['c', '', 'c'], // differed, changed to empty on all
          ['added', 'y'], // new
        ],
        keptKeys: new Set(['ele', 'kept']),
      },
    );

    expect(patch.props).toEqual({
      name: 'B',
      height: '1',
      kept: 'k',
      c: '',
      added: 'y',
    });
  });

  it('does not add a kept key to a feature that lacked it', () => {
    expect(
      batchPatch(item({ props: {} }), false, values, {
        ...none,
        rows: [['ele', '', 'ele']],
        keptKeys: new Set(['ele']),
      }),
    ).toEqual({});
  });
});

describe('pickedColors', () => {
  it('are only the colors the user touched', () => {
    const values = item({ color: '#111111', fillColor: '#22222233' });

    expect(
      pickedColors(values, {
        touched: new Set(['fillColor']),
        rows: [],
        keptKeys: new Set(),
      }),
    ).toEqual(['#22222233']);
  });
});
