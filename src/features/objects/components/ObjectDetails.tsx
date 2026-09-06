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
import { useGenericNameResolver } from '@osm/useGenericNameResolver.js';
import { IconGlyph } from '@shared/components/IconGlyph.js';
import { OsmTagKey, OsmTagValue } from '@shared/components/OsmTagLinks.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { OsmFeatureIdSchema } from '@shared/types/featureId.js';
import { Fragment, type ReactElement } from 'react';
import { Table } from 'react-bootstrap';
import { useObjectsMessages } from '../translations/useObjectsMessages.js';
import { SourceName } from './SourceName.js';

type Props = {
  result: SearchResult;
  elevation: ElevationReading;
};

export function ObjectDetails({ result, elevation }: Props): ReactElement {
  const { id, geojson } = result;

  const genericName = useGenericNameResolver(result);

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
      <p className="lead">
        {imgs.map((img) => (
          <Fragment key={img}>
            <IconGlyph poi={img} />
            &ensp;
          </Fragment>
        ))}
        {/* Named first, kind of thing second — as the search list reads. */}
        {displayName && <span className="fw-semibold">{displayName}</span>}
        {displayName && genericName && ' '}
        {genericName}
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
                  <th>
                    <OsmTagKey tag={k} osm={parsedId.success} />
                  </th>

                  <td>
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
