import {
  type ElevationReading,
  ElevationValue,
} from '@features/elevationChart/components/ElevationValue.js';
import { getOsmElementUrl } from '@features/openInExternalApp/externalUrlUtils.js';
import type { SearchResult } from '@features/search/model/actions.js';
import {
  getNameFromOsmElement,
  resolveGenericName,
} from '@osm/osmNameResolver.js';
import { osmTagToIconMapping } from '@osm/osmTagToIconMapping.js';
import { useGenericNameParts } from '@osm/useGenericNameResolver.js';
import { IconGlyph } from '@shared/components/IconGlyph.js';
import { OsmTagKey, OsmTagValue } from '@shared/components/OsmTagLinks.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import {
  OsmFeatureIdSchema,
  stringifyFeatureId,
} from '@shared/types/featureId.js';
import type { ReactElement } from 'react';
import { Table } from 'react-bootstrap';
import { useObjectsMessages } from '../translations/useObjectsMessages.js';
import { GenericNameToggles } from './GenericNameToggles.js';
import { SourceName } from './SourceName.js';

type Props = {
  result: SearchResult;
  elevation: ElevationReading;
};

export function ObjectDetails({ result, elevation }: Props): ReactElement {
  const { id, geojson } = result;

  const genericNameParts = useGenericNameParts(result);

  const imgs = resolveGenericName(
    osmTagToIconMapping,
    geojson.properties ?? {},
  );

  const language = useAppSelector((state) => state.l10n.language);

  const displayName =
    result.displayName ||
    getNameFromOsmElement(geojson.properties ?? {}, language);

  const parsedId = OsmFeatureIdSchema.safeParse(id);

  const om = useObjectsMessages();

  return (
    <>
      {/* One wrapping row rather than running text: an inline-flex box of chips
          is atomic, so it would drop whole to the next line the moment it no
          longer fitted beside the icon. */}
      <p className="lead d-flex flex-wrap gap-2 align-items-baseline">
        {imgs.map((img) => (
          <IconGlyph key={img} poi={img} />
        ))}

        {/* Named first, kind of thing second — as the search list reads. */}
        {displayName && <span className="fw-semibold">{displayName}</span>}

        <GenericNameToggles
          // Whether its other categories are expanded is per object.
          key={stringifyFeatureId(id)}
          parts={genericNameParts}
          tags={geojson.properties ?? undefined}
        />
      </p>

      <ElevationValue {...elevation} label={om?.elevation} className="mb-3" />

      {/* An embed has no selection toolbar, so its ⋮ menu can't carry these. */}
      {window.fmEmbedded && parsedId.success && (
        <p>
          <a
            target="_blank"
            rel="noreferrer"
            href={getOsmElementUrl(parsedId.data)}
          >
            {om?.openInOsm}
          </a>
          {' ('}
          <a
            target="_blank"
            rel="noreferrer"
            href={getOsmElementUrl(parsedId.data, true)}
          >
            {om?.osmHistory}
          </a>
          )
        </p>
      )}

      {parsedId.success && geojson.properties?.['description'] && (
        <p>{geojson.properties['description']}</p>
      )}

      {geojson.properties && (
        <Table striped bordered size="sm">
          <tbody>
            {Object.entries(geojson.properties)
              .filter(([k]) => k !== 'display_name')
              .map(([k, v]) => (
                <tr key={k}>
                  <th className="text-nowrap">
                    <OsmTagKey tag={k} osm={parsedId.success} />
                  </th>

                  {/* Breaking mid-word only where a value has no separator to
                      wrap at, or it would widen the toast. */}
                  <td className="text-break">
                    <OsmTagValue tag={k} value={v} osm={parsedId.success} />
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      )}

      <span>
        {om?.source}: <SourceName result={result} />
      </span>
    </>
  );
}
