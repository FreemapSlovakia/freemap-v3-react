import {
  creditedAttributions,
  mergeAttributions,
  newElevationCredits,
  readElevationAttributions,
  withElevationAttributions,
} from '@shared/elevation.js';
import { lineString } from '@turf/helpers';
import { describe, expect, it } from 'vitest';

const sk = { type: 'data', name: 'DMR 5.0', url: 'https://ugkk.test' } as const;

const at = { type: 'data', name: 'ALS DTM' } as const;

const line = () =>
  lineString([
    [17, 48],
    [17.1, 48.1],
  ]);

describe('mergeAttributions', () => {
  it('keeps first-seen order and drops repeats', () => {
    expect(mergeAttributions([sk, at], [{ ...sk }, at])).toEqual([sk, at]);
  });

  it('tells apart two credits that share a name', () => {
    expect(
      mergeAttributions([sk, { ...sk, url: 'https://other.test' }]),
    ).toHaveLength(2);
  });
});

describe('withElevationAttributions', () => {
  it('stamps the credits so they read back off the feature', () => {
    const credits = newElevationCredits();

    credits.sources.add('sk');

    credits.attributions.set('sk', sk);

    const stamped = withElevationAttributions(
      line(),
      creditedAttributions(credits),
    );

    expect(readElevationAttributions(stamped)).toEqual([sk]);
  });

  // A token can carry no credit at all, and only the credits are stamped.
  it('leaves the feature alone when nothing was credited', () => {
    const tokensOnly = newElevationCredits();

    tokensOnly.sources.add('sonny');

    const feature = line();

    expect(
      withElevationAttributions(feature, creditedAttributions(tokensOnly)),
    ).toBe(feature);
  });
});

describe('readElevationAttributions', () => {
  const stamped = (value: unknown) => {
    const feature = line();

    feature.properties = { 'fm:elevationAttributions': value };

    return readElevationAttributions(feature);
  };

  it('reads nothing off a feature that carries no stamp', () => {
    expect(readElevationAttributions(line())).toEqual([]);
  });

  // A stamp comes back from a saved map, so it can be anything at all.
  it('drops a malformed stamp rather than crediting it', () => {
    expect(stamped('DMR 5.0')).toEqual([]);
  });

  it('keeps the credits beside a malformed one', () => {
    expect(stamped([sk, 'DMR 5.0', at])).toEqual([sk, at]);
  });

  // The name is rendered as a link, and a shared map is writable by others.
  it('names a credit whose link is not http(s), without linking it', () => {
    expect(stamped([{ ...sk, url: 'javascript:alert(1)' }])).toEqual([
      { type: 'data', name: sk.name },
    ]);
  });

  // `null` is an ordinary JSON spelling of "no link"; under-crediting is worse
  // than a missing link, so the credit is still named.
  it.each([null, undefined, 42])('names a credit whose url is %p', (url) => {
    expect(stamped([{ name: sk.name, url }])).toEqual([
      { type: 'data', name: sk.name },
    ]);
  });
});
