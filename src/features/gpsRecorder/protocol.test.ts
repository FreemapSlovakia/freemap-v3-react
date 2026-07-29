import { describe, expect, it } from 'vitest';
import {
  DEFAULT_POINT_FIELDS,
  decodePoints,
  missingPermissions,
  RecorderStatusSchema,
  RecorderStreamPayloadSchema,
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
  version: { code: 4, name: '0.4' },
  port: 8378,
  portEcho: null,
  permissions: { fine: true, background: true, notifications: true },
  batteryExempt: true,
  oem: { vendor: 'xiaomi', needed: true, acknowledged: false },
  canRecord: true,
  setupComplete: false,
};

const TRACK_PAGE = {
  fields: ['seq', 'ts', 'lat', 'lon', 'alt', 'acc', 'spd', 'brg'],
  points: [
    [550, 1785174195365, 48.7062033, 21.2367267, 279.2, 1.9, 0.0, null],
    [551, 1785174196371, 48.7062102, 21.2367301, 279.4, 1.9, 0.4, 183.0],
  ],
};

describe('RecorderStatusSchema', () => {
  it('parses what the recorder actually serves', () => {
    const status = RecorderStatusSchema.parse(STATUS);

    expect(status.version.code).toBe(4);
    expect(status.count).toBe(1919);
    expect(status.generation).toBe(0);
    expect(status.canRecord).toBe(true);
    expect(status.setupComplete).toBe(false);
  });

  it('accepts a device with no vendor quirk', () => {
    // `oem.vendor` is null on anything but the handful of vendors the recorder
    // knows about, so requiring a string here would break most phones.
    const status = RecorderStatusSchema.parse({
      ...STATUS,
      oem: { vendor: null, needed: false, acknowledged: false },
    });

    expect(status.oem?.vendor).toBeNull();
  });

  it('parses the error body a refused start returns', () => {
    const status = RecorderStatusSchema.parse({
      ...STATUS,
      canRecord: false,
      error: 'setup incomplete',
    });

    expect(status.error).toBe('setup incomplete');
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
      acc: 1.9,
      // An absent value is null and never 0, so a standstill stays a standstill.
      spd: 0,
      brg: null,
    });
  });

  it('reads by the declared column order, not by position', () => {
    // A recorder that reorders or adds columns must still decode correctly.
    const points = decodePoints(
      ['ts', 'lon', 'lat', 'seq'],
      [[1785329624603, 21.5, 48.5, 7]],
    );

    expect(points).toEqual([
      {
        seq: 7,
        ts: 1785329624603,
        lat: 48.5,
        lon: 21.5,
        alt: null,
        acc: null,
        spd: null,
        brg: null,
      },
    ]);
  });

  it('drops a row that carries no position', () => {
    expect(
      decodePoints(DEFAULT_POINT_FIELDS, [[1, 1785329624603, null, null]]),
    ).toEqual([]);
  });
});

describe('stream payloads', () => {
  const single = [
    551, 1785174196371, 48.7062102, 21.2367301, 279.4, 1.9, 0.4, 183.0,
  ];

  it('decodes the single bare row the stream sends', () => {
    const rows = streamPayloadToRows(RecorderStreamPayloadSchema.parse(single));

    expect(decodePoints(DEFAULT_POINT_FIELDS, rows).map((p) => p.seq)).toEqual([
      551,
    ]);
  });

  it('also decodes a batch of rows', () => {
    const rows = streamPayloadToRows(
      RecorderStreamPayloadSchema.parse([
        single,
        [552, 1785174197380, 48.7062, 21.2367],
      ]),
    );

    expect(decodePoints(DEFAULT_POINT_FIELDS, rows).map((p) => p.seq)).toEqual([
      551, 552,
    ]);
  });
});
