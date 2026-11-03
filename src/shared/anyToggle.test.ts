import { describe, expect, it } from 'vitest';
import { ANY, fromAnyValue, withAnyValue } from './anyToggle.js';

describe('the "Any" toggle', () => {
  it('stands lit while nothing is picked', () => {
    expect(withAnyValue([])).toEqual([ANY]);

    expect(withAnyValue(['a'])).toEqual(['a']);
  });

  it('goes out when something is picked', () => {
    expect(fromAnyValue([ANY, 'a'], [])).toEqual(['a']);
  });

  it('clears the picks when pressed', () => {
    expect(fromAnyValue(['a', 'b', ANY], ['a', 'b'])).toEqual([]);
  });

  it('stays lit when pressed with nothing picked', () => {
    expect(fromAnyValue([], [])).toEqual([]);
  });
});
