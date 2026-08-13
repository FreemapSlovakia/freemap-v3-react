import { describe, expect, it } from 'vitest';
import { MapsLoadResponseSchema } from './mapDocumentSchema.js';

const DataSchema = MapsLoadResponseSchema.shape.data;

// Offline copies are validated through this schema on read and an unreadable one
// is discarded as a cache miss — so a document written by an older version has
// to keep parsing, or every user's offline maps quietly disappear.
describe('map document schema — what an older copy still reads as', () => {
  it('reads a route that carries no computed result', () => {
    const parsed = DataSchema.parse({
      routePlanner: {
        transportType: 'hiking',
        points: [
          { lat: 48, lon: 17 },
          { lat: 49, lon: 18 },
        ],
      },
    });

    expect(parsed.routePlanner?.points).toHaveLength(2);
    expect(parsed.routePlanner?.result).toBeUndefined();
  });

  it('reads a legacy start/midpoints/finish route', () => {
    const parsed = DataSchema.parse({
      routePlanner: {
        transportType: 'hiking',
        start: { lat: 48, lon: 17 },
        midpoints: [{ lat: 48.5, lon: 17.5 }],
        finish: { lat: 49, lon: 18 },
      },
    });

    expect(parsed.routePlanner?.points).toHaveLength(3);
  });

  it('reads an empty document', () => {
    expect(DataSchema.parse({})).toEqual({});
  });
});

// A route with no routed segment — a straight-line transport, or every request
// failing — used to carry `NaN` durations, which `JSON.stringify` writes as
// `null`. Rejecting the document over that would leave the map unopenable, its
// offline copy discarded as unreadable along with it.
describe('map document schema — a route it cannot read', () => {
  const doc = (result: unknown) => ({
    routePlanner: {
      points: [
        { lat: 48, lon: 17 },
        { lat: 49, lon: 18 },
      ],
      result,
    },
  });

  it('drops the route rather than the map', () => {
    const parsed = DataSchema.parse(
      doc({
        key: 'k',
        timestamp: 1000,
        alternative: {
          distance: 1,
          duration: null,
          legs: [],
        },
        waypoints: [],
      }),
    );

    expect(parsed.routePlanner?.points).toHaveLength(2);
    expect(parsed.routePlanner?.result).toBeUndefined();
  });

  it('drops a route of an unreadable shape entirely', () => {
    expect(
      DataSchema.parse(doc('nonsense')).routePlanner?.result,
    ).toBeUndefined();
  });
});
