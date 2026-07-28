import type { ProfileResolver } from '@features/elevationChart/model/resolve.js';
import { lineString } from '@turf/helpers';

/**
 * The drawn line the target names. Found by id, not by index: deleting,
 * splitting or joining renumbers the lines, and an index would quietly come to
 * mean a different one.
 */
const resolve: ProfileResolver = async (getState) => {
  const { target } = getState().elevationChart;

  if (target?.type !== 'drawing') {
    return { status: 'gone' };
  }

  const line = getState().drawingLines.lines.find(
    ({ id }) => id === target.lineId,
  );

  // Ids are stable, so a line that isn't here was deleted — nothing is coming.
  // A line trimmed below two points has no profile either, but it may well grow
  // one again, so the chart stays aimed at it.
  if (!line) {
    return { status: 'gone' };
  }

  if (line.points.length < 2) {
    return { status: 'pending' };
  }

  return {
    status: 'ok',
    source: {
      trackGeojson: lineString(line.points.map(({ lon, lat }) => [lon, lat])),
      // A drawn line carries no elevation of its own, so the profile is sampled
      // from the elevation API.
      keepRecorded: false,
      waypoints: [],
      credit: { provenance: 'terrain-model' },
    },
  };
};

export default resolve;
