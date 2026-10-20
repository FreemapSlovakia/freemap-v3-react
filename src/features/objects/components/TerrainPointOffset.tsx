import { Text } from '@features/l10n/Text.js';
import { distanceTo } from '@shared/geoutils.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import type { LatLon } from '@shared/types/common.js';
import type { ReactElement } from 'react';
import type { TerrainFacts } from '../model/terrainFacts.js';
import { useObjectsMessages } from '../translations/useObjectsMessages.js';
import { TerrainMarkToggle } from './TerrainMarkToggle.js';

/** Closer than this, the summit is where the marker is. */
const MIN_OFFSET_M = 3;

type Props = {
  facts: TerrainFacts;
  osmId: number;
  /** Where the node's marker is drawn. */
  marker: LatLon | null;
};

/**
 * How far the point an elevation was read at lies from the node's marker, with
 * a toggle marking it where the service gives its position.
 */
export function TerrainPointOffset({
  facts,
  osmId,
  marker,
}: Props): ReactElement | null {
  const om = useObjectsMessages();

  const nf = useNumberFormat({ maximumFractionDigits: 0 });

  const { at } = facts;

  // From the marker shown rather than the node the service was built from,
  // which may have been moved since.
  const offsetM = at && marker ? distanceTo(marker, at) : facts.distM;

  if (offsetM === null || offsetM < MIN_OFFSET_M) {
    return null;
  }

  return (
    <div>
      <span className="text-body-secondary">
        <Text m={om}>
          {(om) =>
            om.terrain.fromMarker({ distance: `${nf.format(offsetM)} m` })
          }
        </Text>
      </span>

      {at && (
        <TerrainMarkToggle
          kind="point"
          // Negative margins: as tall as a button, without making its line taller.
          className="ms-2 my-n1"
          mark={{
            osmId,
            ...at,
            poi: facts.kind === 'peak' ? 'peak' : 'saddle',
          }}
        />
      )}
    </div>
  );
}
