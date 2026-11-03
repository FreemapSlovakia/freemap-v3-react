import { describe, expect, it } from 'vitest';
import { keyProblems } from './DrawingPropsEditor.js';

describe('property names', () => {
  it('are not asked of a valueless row by text it hides', () => {
    expect(keyProblems([['', 'abc', undefined, 'null']])).toEqual([undefined]);
  });

  it('are required of a row with a value, and unique', () => {
    expect(
      keyProblems([
        ['a', '1'],
        [' a ', '2'],
        ['', 'x'],
        ['', '', undefined, 'number'],
        ['', ''],
        ['b', ''],
      ]),
    ).toEqual([
      'duplicate',
      'duplicate',
      'missing',
      undefined,
      undefined,
      undefined,
    ]);
  });

  it('count a kept batch row’s emptied name as the one it opened with', () => {
    expect(
      keyProblems(
        [
          ['', '', 'ref'],
          ['ref', '7'],
        ],
        (origin) => origin === 'ref',
      ),
    ).toEqual(['duplicate', 'duplicate']);
  });
});
