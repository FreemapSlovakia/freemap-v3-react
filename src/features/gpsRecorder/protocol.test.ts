import { describe, expect, it } from 'vitest';
import {
  decodePoints,
  missingPermissions,
  RecorderStatusSchema,
  RecorderTrackPageSchema,
  streamPayloadToRows,
} from './protocol.js';

// Copied from the recorder's own API.md, which `./gradlew checkApiDocs` keeps
// in step with its implementation. Divergence here means the contract moved.
const STATUS = {
  recording: false,
  lastSeq: 1919,
  count: 1919,
  generation: 0,
  fields: [
    'seq',
    'ts',
    'lat',
    'lon',
    'alt',
    'acc',
    'spd',
    'brg',
    'altMsl',
    'altAcc',
    'spdAcc',
    'brgAcc',
    'sat',
    'src',
    'seg',
  ],
  version: { code: 11, name: '0.11' },
  port: 8378,
  portEcho: null,
  permissions: { fine: true, background: true, notifications: true },
  batteryExempt: true,
  oem: { vendor: 'xiaomi', needed: true, acknowledged: false },
  canRecord: true,
  setupComplete: false,
  config: {
    intervalMs: 1000,
    minDistanceM: 0.0,
    maxAccuracyM: null,
    priority: 'high',
    source: 'fused',
  },
};

const TRACK_PAGE = {
  fields: [
    'seq',
    'ts',
    'lat',
    'lon',
    'alt',
    'acc',
    'spd',
    'brg',
    'altMsl',
    'altAcc',
    'spdAcc',
    'brgAcc',
    'sat',
    'src',
    'seg',
  ],
  points: [
    [
      550,
      1785174195365,
      48.7062033,
      21.2367267,
      279.2,
      1.9,
      0.0,
      null,
      237.1,
      2.4,
      0.3,
      null,
      9,
      'fused',
      3,
    ],
    [
      551,
      1785174196371,
      48.7062102,
      21.2367301,
      279.4,
      1.9,
      0.4,
      183.0,
      237.3,
      2.4,
      0.3,
      2.0,
      9,
      'gps',
      3,
    ],
  ],
};

describe('RecorderStatusSchema', () => {
  it('parses what the recorder actually serves', () => {
    const status = RecorderStatusSchema.parse(STATUS);

    expect(status.version.code).toBe(11);
    expect(status.count).toBe(1919);
    expect(status.generation).toBe(0);
    expect(status.canRecord).toBe(true);
    expect(status.setupComplete).toBe(false);
    expect(status.config.priority).toBe('high');
  });

  it('carries the point column order, for a stream attached without a page', () => {
    expect(RecorderStatusSchema.parse(STATUS).fields).toEqual(
      TRACK_PAGE.fields,
    );
  });

  it('rejects a status missing a field the recorder always sends', () => {
    // There is one recorder version and no compatibility to keep, so an answer
    // that isn't it is an error rather than something to work around.
    const { fields: _, ...withoutFields } = STATUS;

    expect(RecorderStatusSchema.safeParse(withoutFields).success).toBe(false);
  });

  it('accepts a device with no vendor quirk', () => {
    // `oem.vendor` is null on anything but the handful of vendors the recorder
    // knows about, so requiring a string here would break most phones.
    const status = RecorderStatusSchema.parse({
      ...STATUS,
      oem: { vendor: null, needed: false, acknowledged: false },
    });

    expect(status.oem.vendor).toBeNull();
  });

  it('keeps fields it does not model', () => {
    // The schema is loose so a newer recorder can add fields freely.
    const status = RecorderStatusSchema.parse({ ...STATUS, somethingNew: 1 });

    expect(status).toHaveProperty('somethingNew', 1);
  });

  it('lists only the permissions that are not granted', () => {
    expect(missingPermissions(RecorderStatusSchema.parse(STATUS))).toEqual([]);

    expect(
      missingPermissions(
        RecorderStatusSchema.parse({
          ...STATUS,
          permissions: { fine: true, background: false, notifications: false },
        }),
      ),
    ).toEqual(['background', 'notifications']);
  });
});

describe('decodePoints', () => {
  it('decodes a track page into named fields', () => {
    const { fields, points } = RecorderTrackPageSchema.parse(TRACK_PAGE);

    expect(decodePoints(fields, points)[0]).toEqual({
      seq: 550,
      ts: 1785174195365,
      lat: 48.7062033,
      lon: 21.2367267,
      alt: 279.2,
      altMsl: 237.1,
      acc: 1.9,
      // An absent value is null and never 0, so a standstill stays a standstill.
      spd: 0,
      brg: null,
      sat: 9,
      seg: 3,
    });
  });

  it('survives a column whose cells are not numbers', () => {
    // `src` carries a provider name, and the `fields` list is append-only — so a
    // reader that insisted on numbers would lose the whole page over a column it
    // doesn't even read.
    const page = RecorderTrackPageSchema.parse({
      fields: [...TRACK_PAGE.fields, 'somethingNew'],
      points: [[...TRACK_PAGE.points[0]!, { nested: true }]],
    });

    expect(decodePoints(page.fields, page.points)).toHaveLength(1);
  });

  it('reads a cell that should be a number but is not as absent', () => {
    expect(
      decodePoints(
        ['seq', 'ts', 'lat', 'lon', 'seg', 'alt'],
        [[7, 1785329624603, 48.5, 21.5, 0, 'high']],
      )[0]?.alt,
    ).toBeNull();
  });

  it('reads by the declared column order, not by position', () => {
    // A recorder that reorders or adds columns must still decode correctly.
    const points = decodePoints(
      ['ts', 'lon', 'seg', 'lat', 'seq'],
      [[1785329624603, 21.5, 2, 48.5, 7]],
    );

    expect(points).toEqual([
      {
        seq: 7,
        ts: 1785329624603,
        lat: 48.5,
        lon: 21.5,
        seg: 2,
        alt: null,
        altMsl: null,
        acc: null,
        spd: null,
        brg: null,
        sat: null,
      },
    ]);
  });

  it('drops a row that carries no position', () => {
    expect(
      decodePoints(TRACK_PAGE.fields, [[1, 1785329624603, null, null]]),
    ).toEqual([]);
  });

  it('drops a row with no segment ordinal', () => {
    // The recorder always sends one, so a row without it is not a fix this app
    // can place in a segment.
    expect(
      decodePoints(
        ['seq', 'ts', 'lat', 'lon'],
        [[1, 1785329624603, 48.5, 21.5]],
      ),
    ).toEqual([]);
  });
});

describe('stream payloads', () => {
  // The stream sends bare rows, so a reader needs the order from `/status` or a
  // `/track` page; this is that order.
  const FIELDS = TRACK_PAGE.fields;

  // The `/stream` example from API.md: a full row, exactly as `/track` encodes it.
  const single = [
    551,
    1785174196371,
    48.7062102,
    21.2367301,
    279.4,
    1.9,
    0.4,
    183.0,
    237.3,
    2.4,
    0.3,
    12.0,
    9,
    'fused',
    3,
  ];

  const next = [
    552,
    1785174197380,
    48.7062,
    21.2367,
    279.5,
    1.8,
    0.5,
    181.0,
    237.4,
    2.4,
    0.3,
    12.0,
    9,
    'fused',
    3,
  ];

  it('decodes the single bare row the stream sends', () => {
    const rows = streamPayloadToRows(single);

    expect(decodePoints(FIELDS, rows).map((p) => p.seq)).toEqual([551]);
  });

  it('also decodes a batch of rows', () => {
    const rows = streamPayloadToRows([single, next]);

    expect(decodePoints(FIELDS, rows).map((p) => p.seq)).toEqual([551, 552]);
  });
});
