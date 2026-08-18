import { describe, expect, it } from 'vitest';
import { interpolateLabel, labelUsesKey } from './interpolateLabel.js';

describe('interpolateLabel', () => {
  it('expands a key that is there', () => {
    expect(interpolateLabel('{name}', { name: 'Kráľova hoľa' })).toBe(
      'Kráľova hoľa',
    );
  });

  it('expands several keys, including across lines', () => {
    expect(
      interpolateLabel('{name}\n{ele} m', { name: 'Sitno', ele: '1009' }),
    ).toBe('Sitno\n1009 m');
  });

  it('leaves a key that is not there as written', () => {
    expect(interpolateLabel('{nmae}', { name: 'Sitno' })).toBe('{nmae}');
  });

  it('leaves braces alone when there are no properties at all', () => {
    expect(interpolateLabel('Meet at {the tree}', undefined)).toBe(
      'Meet at {the tree}',
    );
  });

  it('expands an empty value to nothing', () => {
    expect(interpolateLabel('[{note}]', { note: '' })).toBe('[]');
  });

  it('passes a label with no braces straight through', () => {
    expect(interpolateLabel('Plain label', { name: 'x' })).toBe('Plain label');
  });
});

describe('labelUsesKey', () => {
  it('is true only for the key actually written', () => {
    expect(labelUsesKey('{name} {ele}', 'ele')).toBe(true);
    expect(labelUsesKey('{name}', 'ele')).toBe(false);
    expect(labelUsesKey(undefined, 'ele')).toBe(false);
  });
});
