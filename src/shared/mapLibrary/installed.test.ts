import { describe, expect, it } from 'vitest';
import { effectiveShortcut, userShortcuts } from './installed.js';

const shiftN = { code: 'KeyN', shift: true };

// `n` is a built-in map whose default is ⇧N.
const notes = { type: 'n', shortcut: shiftN };

describe('effectiveShortcut', () => {
  it('keeps a built-in default nobody else has', () => {
    expect(effectiveShortcut({}, notes, userShortcuts({}, []))).toEqual(shiftN);
  });

  it('yields a built-in default to a custom map the user gave it', () => {
    const custom = { type: '.1', shortcut: shiftN };

    const taken = userShortcuts({}, [custom]);

    expect(effectiveShortcut({}, notes, taken)).toBeNull();

    expect(effectiveShortcut({}, custom, taken)).toEqual(shiftN);
  });

  it('yields a built-in default to a preset or another map set to it', () => {
    const settings = { '@1': { shortcut: shiftN } };

    expect(
      effectiveShortcut(settings, notes, userShortcuts(settings, [])),
    ).toBeNull();
  });

  it("keeps the user's own choice for the map itself", () => {
    const settings = { n: { shortcut: shiftN }, '@1': { shortcut: shiftN } };

    expect(
      effectiveShortcut(settings, notes, userShortcuts(settings, [])),
    ).toEqual(shiftN);
  });

  it('tells modifiers apart', () => {
    const custom = { type: '.1', shortcut: { code: 'KeyN' } };

    expect(effectiveShortcut({}, notes, userShortcuts({}, [custom]))).toEqual(
      shiftN,
    );
  });
});
