import { authSetUser } from '@features/auth/model/actions.js';
import { describe, expect, it } from 'vitest';
import { l10nSetChosenLanguage, l10nSetLanguage } from './actions.js';
import { l10nInitialState, l10nReducer } from './reducer.js';

/**
 * Pure reducer tests for the l10n slice. `chosenLanguage` is the user's
 * explicit pick (null = follow browser); `language` is the resolved active
 * locale. Both `authSetUser` and `l10nSetChosenLanguage` run the value through
 * `isLanguage`, so unknown codes are rejected.
 */

// l10n only reads `payload.language`; a minimal cast user is enough.
const userWith = (language: string | null) =>
  authSetUser({ language } as never);

describe('l10nReducer — l10nSetChosenLanguage', () => {
  it('stores a supported language', () => {
    const next = l10nReducer(
      l10nInitialState,
      l10nSetChosenLanguage({ language: 'sk' }),
    );

    expect(next.chosenLanguage).toBe('sk');
  });

  it('resets to null for an unsupported language', () => {
    const state = { ...l10nInitialState, chosenLanguage: 'sk' as const };

    const next = l10nReducer(state, l10nSetChosenLanguage({ language: 'xx' }));

    expect(next.chosenLanguage).toBeNull();
  });

  it('resets to null when explicitly cleared', () => {
    const state = { ...l10nInitialState, chosenLanguage: 'sk' as const };

    const next = l10nReducer(state, l10nSetChosenLanguage({ language: null }));

    expect(next.chosenLanguage).toBeNull();
  });
});

describe('l10nReducer — authSetUser', () => {
  it("adopts the user's supported language", () => {
    const next = l10nReducer(l10nInitialState, userWith('de'));

    expect(next.chosenLanguage).toBe('de');
  });

  it('keeps the existing choice when the user language is unsupported', () => {
    const state = { ...l10nInitialState, chosenLanguage: 'sk' as const };

    const next = l10nReducer(state, userWith('xx'));

    expect(next.chosenLanguage).toBe('sk');
  });

  it('keeps the existing choice when logging out (null user)', () => {
    const state = { ...l10nInitialState, chosenLanguage: 'sk' as const };

    const next = l10nReducer(state, authSetUser(null));

    expect(next.chosenLanguage).toBe('sk');
  });
});

describe('l10nReducer — l10nSetLanguage', () => {
  it('sets the resolved active language', () => {
    const next = l10nReducer(l10nInitialState, l10nSetLanguage('cs'));

    expect(next.language).toBe('cs');
    expect(next.chosenLanguage).toBeNull(); // unaffected
  });
});
