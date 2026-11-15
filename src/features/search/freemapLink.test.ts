import { describe, expect, it } from 'vitest';
import { freemapLinkTarget } from './freemapLink.js';

describe('freemapLinkTarget', () => {
  it('takes the path of a link from either portal', () => {
    expect(
      freemapLinkTarget(' https://www.freemap.sk/#map=12/48.1/17.1 '),
    ).toBe('/#map=12/48.1/17.1');

    expect(freemapLinkTarget('https://freemap.eu/?osm-node=1&lang=en')).toBe(
      '/?osm-node=1&lang=en',
    );

    expect(freemapLinkTarget('https://local.freemap.sk:9000/#layers=X')).toBe(
      '/#layers=X',
    );
  });

  it('finds the link inside a message', () => {
    expect(
      freemapLinkTarget('Pozri: https://www.freemap.sk/#map=12/48.1/17.1 ok?'),
    ).toBe('/#map=12/48.1/17.1');

    expect(
      freemapLinkTarget('Pozri (https://www.freemap.sk/#map=12/48.1/17.1).'),
    ).toBe('/#map=12/48.1/17.1');
  });

  it('ignores other text', () => {
    expect(freemapLinkTarget('Bratislava')).toBeNull();
    expect(freemapLinkTarget('https://notfreemap.sk/#map=1/2/3')).toBeNull();
    expect(freemapLinkTarget('https://www.freemap.sk/')).toBeNull();
    expect(freemapLinkTarget('https://wiki.freemap.sk/?title=Foo')).toBeNull();
  });
});
