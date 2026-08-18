import {
  parseDrawingPointParam,
  parseStyleFields,
} from '@app/url/locationChangeHandler.js';
import { describe, expect, it } from 'vitest';
import {
  serializeDrawingPoint,
  serializeDrawingProps,
} from './urlSerialization.js';

/**
 * The properties field is the one part of the style codec that nests a second
 * separator, so it is the one that can lose data if the two disagree.
 */
describe('serializeDrawingProps', () => {
  it('writes nothing for no properties at all', () => {
    expect(serializeDrawingProps(undefined)).toBe('');
    expect(serializeDrawingProps({})).toBe('');
  });

  it('writes key and value pairs, unit-separated', () => {
    expect(serializeDrawingProps({ name: 'Sitno', ele: '1009' })).toBe(
      '\x1ePname\x1fSitno\x1fele\x1f1009',
    );
  });
});

describe('the properties field, round-tripped', () => {
  it('reads back what a point wrote', () => {
    const props = { name: 'Kráľova hoľa', ele: '1946' };

    const written = serializeDrawingPoint({
      coords: { lat: 48.88, lon: 20.13 },
      label: '{name}',
      props,
    });

    expect(parseStyleFields(written).props).toEqual(props);
  });

  it('keeps a value that carries the field separator of the outer codec', () => {
    // Not typeable, but a link can be hand-written — it must not tear the
    // field list apart on the way back in.
    const written = serializeDrawingProps({ note: 'a,b' });

    expect(parseStyleFields(written).props).toEqual({ note: 'a,b' });
  });

  it('drops a trailing key with no value', () => {
    expect(parseStyleFields('\x1ePname\x1fSitno\x1fele').props).toEqual({
      name: 'Sitno',
    });
  });

  it('reads no properties field as none', () => {
    expect(parseStyleFields('\x1eLjust a label').props).toBeUndefined();
  });
});

describe('a label written on several lines', () => {
  it('survives the round trip through the URL', () => {
    const point = {
      coords: { lat: 48.88, lon: 20.13 },
      label: 'Foo\nBar',
    };

    const written = serializeDrawingPoint(point);

    // A bare `.` in the parser stops at the newline, the anchored match then
    // fails, and the whole point is dropped rather than merely its label.
    expect(parseDrawingPointParam(written)).toMatchObject(point);
  });

  it('keeps the fields written after it', () => {
    const point = {
      coords: { lat: 48.88, lon: 20.13 },
      label: 'Foo\nBar',
      icon: 'fa:bullseye',
      props: { ele: '1946' },
    };

    expect(parseDrawingPointParam(serializeDrawingPoint(point))).toMatchObject(
      point,
    );
  });

  it('reads no point at all from something that is not coordinates', () => {
    expect(parseDrawingPointParam('nonsense')).toBeUndefined();
    expect(parseDrawingPointParam(undefined)).toBeUndefined();
  });
});
