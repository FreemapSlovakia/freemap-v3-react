import { describe, expect, it } from 'vitest';
import { interpolateLabel } from './interpolateLabel.js';

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
    expect(interpolateLabel('({note})', { note: '' })).toBe('()');
  });

  it('drops a bracketed part whose value is empty', () => {
    expect(
      interpolateLabel('{name}[ ({note})]', { name: 'Sitno', note: '' }),
    ).toBe('Sitno');
  });

  it('understands every p: name, so an absent property empties its group', () => {
    // Unlike a computed key nobody knows, which stays on screen.
    expect(interpolateLabel('{name}[, {p:operator}]', { name: 'Sitno' })).toBe(
      'Sitno',
    );
  });

  it('passes a label with no braces straight through', () => {
    expect(interpolateLabel('Plain label', { name: 'x' })).toBe('Plain label');
  });
});
