import { describe, expect, it } from 'vitest';
import {
  type ActiveModal,
  decodeActiveModal,
  encodeActiveModal,
} from './activeModal.js';

describe('the event form in show=', () => {
  it.each<[ActiveModal, string]>([
    [{ type: 'event-form' }, 'event-form'],
    [{ type: 'event-form', id: 'aB3_x9Zq' }, 'event-form/aB3_x9Zq'],
    [{ type: 'event-form', mapId: 'Mp-12345' }, 'event-form/from/Mp-12345'],
  ])('round-trips %o as %s', (modal, encoded) => {
    expect(encodeActiveModal(modal)).toBe(encoded);

    expect(decodeActiveModal(encoded)).toEqual(modal);
  });
});
