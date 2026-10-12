import { HttpError } from '@app/httpRequest.js';
import type { RootState } from '@app/store/store.js';
import { dataViewerMatchTrack } from '@features/dataViewer/model/actions.js';
import type { FeatureCollection, MultiLineString } from 'geojson';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dataViewerMatchTrackProcessor } from './dataViewerMatchTrackProcessor.js';

const httpRequest = vi.hoisted(() => vi.fn());

vi.mock('@app/httpRequest.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@app/httpRequest.js')>()),
  httpRequest,
}));

/** Two segments of a degree a tenth apart — both far longer than the 100 m floor. */
const recording: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        'fm:kind': 'track',
        name: 'Ráno do hôr',
        coordinateProperties: {
          times: [
            ['2020-01-01T00:00:00.000Z', '2020-01-01T00:01:00.000Z'],
            ['2020-01-01T02:00:00.000Z', '2020-01-01T02:01:00.000Z'],
          ],
        },
      },
      geometry: {
        type: 'MultiLineString',
        coordinates: [
          [
            [0, 0],
            [0.1, 0],
          ],
          [
            [0.2, 0],
            [0.3, 0],
          ],
        ],
      },
    },
  ],
};

/** What GraphHopper answers with: its own points, and spans as index ranges. */
const response = (offset: number) => ({
  json: async () => ({
    paths: [
      {
        points: {
          type: 'LineString',
          coordinates: [
            [offset, 0],
            [offset + 0.01, 0],
            [offset + 0.02, 0],
          ],
        },
        details: { surface: [[0, 2, 'asphalt']] },
      },
    ],
  }),
});

describe('dataViewerMatchTrackProcessor', () => {
  const dispatch = vi.fn();

  const getState = () =>
    ({
      trackViewer: { trackGeojson: recording, activeTrackIndex: 0 },
    }) as unknown as RootState;

  const run = () =>
    dataViewerMatchTrackProcessor.handle!({
      prevState: getState(),
      getState,
      dispatch: dispatch as never,
      action: dataViewerMatchTrack({ transport: 'bike' }),
      toastError: vi.fn(),
    });

  /** What the processor wrote back into the viewer. */
  const loaded = () => {
    const setData = dispatch.mock.calls
      .map(([action]) => action)
      .find((action) => action.payload?.trackGeojson);

    return setData!.payload.trackGeojson as FeatureCollection;
  };

  beforeEach(() => {
    dispatch.mockClear();

    httpRequest.mockReset();
  });

  // The issue this replaces: the match was written back as one feature per
  // segment, so one recording turned into N in the track list, in the
  // start/finish markers, in the profile and in "more info".
  it('keeps the recording as one entry, with a part per segment', async () => {
    httpRequest
      .mockResolvedValueOnce(response(0))
      .mockResolvedValueOnce(response(0.2));

    await run();

    expect(httpRequest).toHaveBeenCalledTimes(2);

    const { features } = loaded();

    expect(features).toHaveLength(1);

    expect(features![0]!.geometry.type).toBe('MultiLineString');

    expect(
      (features![0]!.geometry as MultiLineString).coordinates,
    ).toHaveLength(2);

    expect(features![0]!.properties?.['name']).toBe('Ráno do hôr');
  });

  // Each part's spans are metres along that part, and `fm:pathDetails` is the
  // array a colorizer indexes with the part it is painting.
  it('carries one entry of spans per part', async () => {
    httpRequest
      .mockResolvedValueOnce(response(0))
      .mockResolvedValueOnce(response(0.2));

    await run();

    const details = loaded().features![0]!.properties!['fm:pathDetails'] as {
      surface: unknown[];
    }[];

    expect(details).toHaveLength(2);

    expect(details[0]?.['surface']).toHaveLength(1);

    expect(details[1]?.['surface']).toHaveLength(1);
  });

  // A segment the graph cannot route through is kept as recorded — with the
  // recorded points, so its own rows of per-point values still line up.
  it('keeps the recorded values of a segment the graph refused', async () => {
    httpRequest
      .mockResolvedValueOnce(response(0))
      .mockRejectedValueOnce(
        new HttpError(
          400,
          'Sequence is broken for submitted track at time step 1',
        ),
      );

    await run();

    const feature = loaded().features![0]!;

    const times = (
      feature.properties!['coordinateProperties'] as {
        times: (string | null)[][];
      }
    ).times;

    // Three graph points to the recorded segment's two.
    expect(times[0]).toEqual([null, null, null]);

    expect(times[1]).toEqual([
      '2020-01-01T02:00:00.000Z',
      '2020-01-01T02:01:00.000Z',
    ]);

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'TOASTS_ADD' }),
    );
  });
});
