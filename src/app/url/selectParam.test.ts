import { describe, expect, it } from 'vitest';
import {
  decodeSelect,
  encodeSelect,
  type SelectParam,
  selectFromQuery,
} from './selectParam.js';

describe('select=', () => {
  const kinds: [string, SelectParam][] = [
    ['event/NtSXf9PO', { type: 'event', id: 'NtSXf9PO' }],
    ['osm-note/4000000', { type: 'osm-note', id: 4000000 }],
    ['changeset/191453628', { type: 'changeset', id: 191453628 }],
    [
      'changeset/191453628/node/4637444503',
      { type: 'changeset', id: 191453628, element: 'node/4637444503' },
    ],
    [
      'osm-node/4637444503',
      {
        type: 'osm',
        id: { type: 'osm', elementType: 'node', id: 4637444503 },
      },
    ],
    [
      'osm-relation/1690324',
      {
        type: 'osm',
        id: { type: 'osm', elementType: 'relation', id: 1690324 },
      },
    ],
    [
      'object/way/123',
      { type: 'object', id: { type: 'osm', elementType: 'way', id: 123 } },
    ],
    ['wiki/sk:Bratislava', { type: 'wiki', id: 'sk:Bratislava' }],
    // A title's slash is its own.
    ['wiki/en:AC/DC', { type: 'wiki', id: 'en:AC/DC' }],
    // As an OSM tag may write it.
    ['wiki/DE:Zugspitze', { type: 'wiki', id: 'DE:Zugspitze' }],
  ];

  it.each(kinds)('round-trips %s', (raw, select) => {
    expect(decodeSelect(raw)).toEqual(select);
    expect(encodeSelect(select)).toBe(raw);
  });

  it.each([
    'event',
    'event/has space',
    'osm-note/0',
    'osm-note/-3',
    'changeset/x',
    'changeset/7/area/1',
    'changeset/7/node',
    'changeset/7/node/1/extra',
    'wiki/Bratislava',
    'wiki/',
    'wiki/sk:',
    'osm-area/1',
    'osm-node',
    'osm-node/1/2',
    'object/node',
    'object/node/1/2',
  ])('reads %s as nothing', (raw) => {
    expect(decodeSelect(raw)).toBeNull();
  });

  it('reads the forms before it, from old links', () => {
    expect(selectFromQuery({ event: 'NtSXf9PO' })).toEqual({
      type: 'event',
      id: 'NtSXf9PO',
    });

    expect(selectFromQuery({ 'osm-note': '42' })).toEqual({
      type: 'osm-note',
      id: 42,
    });

    expect(selectFromQuery({ changeset: '7' })).toEqual({
      type: 'changeset',
      id: 7,
    });
  });

  it('prefers select= to the old forms, and a note to an inspection', () => {
    expect(selectFromQuery({ select: 'osm-note/42', changeset: '7' })).toEqual({
      type: 'osm-note',
      id: 42,
    });

    // Selecting the note ends an inspection.
    expect(selectFromQuery({ changeset: '7', 'osm-note': '42' })).toEqual({
      type: 'osm-note',
      id: 42,
    });
  });

  it('reads an older link’s show=wiki/ as the article selected', () => {
    expect(selectFromQuery({ show: 'wiki/sk:Bratislava' })).toEqual({
      type: 'wiki',
      id: 'sk:Bratislava',
    });

    expect(selectFromQuery({ show: 'manual' })).toBeNull();
  });

  it('reads old links as leniently as before', () => {
    expect(selectFromQuery({ 'osm-note': '0042' })).toEqual({
      type: 'osm-note',
      id: 42,
    });
  });

  it('takes a trailing slash, and only the ids it writes', () => {
    expect(decodeSelect('changeset/7/')).toEqual({ type: 'changeset', id: 7 });

    expect(decodeSelect('osm-note/1e3')).toBeNull();

    expect(decodeSelect('changeset/7/node/007')).toBeNull();
  });
});
