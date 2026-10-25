import { describe, expect, it } from 'vitest';
import { isInputNumber, parseDecimal } from './numberValidator.js';

describe('a decimal', () => {
  it('is read with a point only', () => {
    expect(['12', ' 1.5 ', '-.5e2', '1,000', '0x10'].map(parseDecimal)).toEqual(
      [12, 1.5, -50, undefined, undefined],
    );
  });

  it('is shown by a number input only as that input writes one', () => {
    expect(
      ['12', '-1.5', '.5', '1e3', ' 12', '+5', '5.', '1,5'].map(isInputNumber),
    ).toEqual([true, true, true, true, false, false, false, false]);
  });
});
