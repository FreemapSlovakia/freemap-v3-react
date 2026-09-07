import { describe, expect, it } from 'vitest';
import { renderTemplate } from './renderTemplate.js';

/** Knows two names; `ele` is one it has nothing to say for. */
const resolve = (key: string) =>
  key === 'name' ? 'Sitno' : key === 'ele' ? '' : undefined;

describe('renderTemplate', () => {
  it('writes what a key resolves to', () => {
    expect(renderTemplate('{name}', resolve)).toBe('Sitno');
  });

  it('leaves a key nobody knows as written, so a typo shows', () => {
    expect(renderTemplate('{nmae}', resolve)).toBe('{nmae}');
  });

  it('writes nothing for a key with no value', () => {
    expect(renderTemplate('{ele}', resolve)).toBe('');
  });
});

describe('a group', () => {
  it('is written when everything in it has something to say', () => {
    expect(renderTemplate('{name}[ ({name})]', resolve)).toBe('Sitno (Sitno)');
  });

  it('goes entirely when a value in it is missing', () => {
    expect(renderTemplate('{name}[ ({ele} m)]', resolve)).toBe('Sitno');
  });

  it('takes a caption with it, which no guess could', () => {
    const both = '[Name: {name}][, height {ele}]';

    expect(renderTemplate(both, resolve)).toBe('Name: Sitno');

    expect(renderTemplate(both, (key) => (key === 'ele' ? '1009' : ''))).toBe(
      ', height 1009',
    );
  });

  it('keeps a group around a name nobody knows, so the typo stays visible', () => {
    expect(renderTemplate('{name}[ ({nmae})]', resolve)).toBe('Sitno ({nmae})');
  });

  it('nests', () => {
    expect(renderTemplate('[{name}[ ({ele})]]', resolve)).toBe('Sitno');

    expect(renderTemplate('[{ele}[ ({name})]]', resolve)).toBe('');
  });
});

describe('a bracket that is not a group', () => {
  it('holds no placeholder, so it reads as the text it is', () => {
    expect(renderTemplate('{name} [1]', resolve)).toBe('Sitno [1]');

    expect(renderTemplate('{name} [closed]', resolve)).toBe('Sitno [closed]');
  });

  it('is written with a backslash where it wraps one', () => {
    expect(renderTemplate('\\[{name}\\]', resolve)).toBe('[Sitno]');
  });

  it('never opened, so a stray one stays put', () => {
    expect(renderTemplate('{name} [ {name}', resolve)).toBe('Sitno [ Sitno');
  });

  it('never opened either way round', () => {
    expect(renderTemplate('{name}] ok', resolve)).toBe('Sitno] ok');
  });
});

describe('a backslash', () => {
  it('writes a brace rather than opening a placeholder', () => {
    expect(renderTemplate('\\{name\\}', resolve)).toBe('{name}');
  });

  it('writes itself when doubled', () => {
    expect(renderTemplate('{name} \\\\ x', resolve)).toBe('Sitno \\ x');
  });

  it('is left alone before anything that is not syntax', () => {
    expect(renderTemplate('{name} C:\\path', resolve)).toBe('Sitno C:\\path');
  });

  it('is left alone at the very end, where it escapes nothing', () => {
    expect(renderTemplate('{name}\\', resolve)).toBe('Sitno\\');

    expect(renderTemplate('Cesta\\', resolve)).toBe('Cesta\\');
  });
});

describe('a brace that opens nothing', () => {
  it('is text, like any character that is not syntax', () => {
    expect(renderTemplate('{name} {oops', resolve)).toBe('Sitno {oops');
  });
});

describe('a template with no placeholder at all', () => {
  it('comes through untouched, brackets and all', () => {
    expect(renderTemplate('Sitno [1009 m]', resolve)).toBe('Sitno [1009 m]');
  });
});
