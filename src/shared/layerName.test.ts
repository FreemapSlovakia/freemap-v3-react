import { describe, expect, it } from 'vitest';
import type { Messages } from '@/translations/messagesInterface.js';
import { layerName } from './layerName.js';

const m = { mapLayers: { letters: { X: 'Outdoor' } } } as unknown as Messages;

describe('layerName', () => {
  it('takes a map’s own name first', () => {
    expect(layerName({ type: 'Z0003', name: 'Austria' }, m)).toBe('Austria');
  });

  it('translates a built-in map', () => {
    expect(layerName({ type: 'X' }, m)).toBe('Outdoor');
  });

  it('passes over an empty custom name', () => {
    expect(layerName({ type: 'abcdef', name: '' }, m)).toBeUndefined();
  });
});
